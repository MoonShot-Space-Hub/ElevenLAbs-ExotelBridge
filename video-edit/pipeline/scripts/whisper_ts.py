# Greedy Whisper decoding with timestamp tokens, using sherpa-onnx exported ONNX models.
import sys, json, base64, numpy as np, onnxruntime as ort, kaldi_native_fbank as knf, soundfile as sf
prefix, wav, lang, task = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
so = ort.SessionOptions(); so.intra_op_num_threads = 4
enc = ort.InferenceSession(prefix + '-encoder.int8.onnx', so)
dec = ort.InferenceSession(prefix + '-decoder.int8.onnx', so)
meta = enc.get_modelmeta().custom_metadata_map
n_mels = int(meta['n_mels']); n_layer = int(meta['n_text_layer']); n_ctx = int(meta['n_text_ctx']); n_state = int(meta['n_text_state'])
sot = int(meta['sot']); eot = int(meta['eot']); no_ts = int(meta['no_timestamps'])
tr = int(meta['translate']) if task == 'translate' else int(meta['transcribe'])
codes = meta['all_language_codes'].split(','); ltoks = list(map(int, meta['all_language_tokens'].split(',')))
lang_tok = dict(zip(codes, ltoks))[lang]
ts_begin = no_ts + 1
tok_bytes = {}
for line in open(prefix + '-tokens.txt', encoding='utf-8'):
    b64, i = line.rstrip('\n').rsplit(' ', 1)
    tok_bytes[int(i)] = base64.b64decode(b64)
audio, sr = sf.read(wav, dtype='float32'); assert sr == 16000

def mel_of(chunk):
    chunk = np.concatenate([chunk, np.zeros(16000 * 30 - len(chunk), dtype=np.float32)]) if len(chunk) < 480000 else chunk[:480000]
    o = knf.WhisperFeatureOptions(); o.dim = n_mels
    f = knf.OnlineWhisperFbank(o); f.accept_waveform(16000, chunk); f.input_finished()
    feats = np.stack([f.get_frame(i) for i in range(f.num_frames_ready)])
    ls = np.log10(np.clip(feats, 1e-10, None)); ls = np.maximum(ls, ls.max() - 8.0); m = (ls + 4.0) / 4.0
    m = m[:3000] if m.shape[0] >= 3000 else np.pad(m, ((0, 3000 - m.shape[0]), (0, 0)))
    return m.T[None].astype(np.float32)

def decode_window(chunk):
    ck, cv = enc.run(None, {'mel': mel_of(chunk)})
    kc = np.zeros((n_layer, 1, n_ctx, n_state), np.float32); vc = np.zeros_like(kc)
    seq = [sot, lang_tok, tr]
    logits, kc, vc = dec.run(None, {'tokens': np.array([seq], np.int64), 'in_n_layer_self_k_cache': kc, 'in_n_layer_self_v_cache': vc, 'n_layer_cross_k': ck, 'n_layer_cross_v': cv, 'offset': np.array([0], np.int64)})
    offset = len(seq); out = []
    for step in range(200):
        lg = logits[0, -1].astype(np.float64).copy()
        lg[no_ts] = -np.inf
        if step == 0:
            lg[:ts_begin] = -np.inf; lg[ts_begin + 50 + 1:] = -np.inf  # first token: timestamp <= 1.0s
        else:
            last_ts = len(out) >= 1 and out[-1] >= ts_begin
            pen_ts = len(out) < 2 or out[-2] >= ts_begin
            if last_ts:
                if pen_ts: lg[ts_begin:] = -np.inf
                else: lg[:eot] = -np.inf
            tss = [t for t in out if t >= ts_begin]
            if tss:
                lo = tss[-1] + (0 if (last_ts and not pen_ts) else 1)
                lg[ts_begin:lo] = -np.inf
            lp = lg - np.logaddexp.reduce(lg[np.isfinite(lg)])
            ts_lp = np.logaddexp.reduce(lp[ts_begin:][np.isfinite(lp[ts_begin:])]) if np.isfinite(lp[ts_begin:]).any() else -np.inf
            if ts_lp > np.max(lp[:ts_begin]): lg[:ts_begin] = -np.inf
        t = int(np.argmax(lg))
        if t == eot: break
        out.append(t)
        logits, kc, vc = dec.run(None, {'tokens': np.array([[t]], np.int64), 'in_n_layer_self_k_cache': kc, 'in_n_layer_self_v_cache': vc, 'n_layer_cross_k': ck, 'n_layer_cross_v': cv, 'offset': np.array([offset], np.int64)})
        offset += 1
    return out

segs = []; total = len(audio) / 16000
bounds = [float(x) for x in sys.argv[6].split(',')] if len(sys.argv) > 6 else [0.0, total]
for a, b in zip(bounds[:-1], bounds[1:]):
    toks = decode_window(audio[int(a * 16000): int(b * 16000)])
    cur = None; text = b''
    for t in toks:
        if t >= ts_begin:
            ts = (t - ts_begin) * 0.02
            if cur is None: cur = ts
            else:
                segs.append({'start': round(a + cur, 2), 'end': round(a + ts, 2), 'text': text.decode('utf-8', 'replace').strip()}); cur = None; text = b''
        elif t < eot: text += tok_bytes.get(t, b'')
    if text.strip(): segs.append({'start': round(a + (cur or 0), 2), 'end': round(b, 2), 'text': text.decode('utf-8', 'replace').strip()})
for s in segs: print(f"[{s['start']:6.2f} - {s['end']:6.2f}] {s['text']}")
json.dump(segs, open(sys.argv[5], 'w'), ensure_ascii=False, indent=1)
