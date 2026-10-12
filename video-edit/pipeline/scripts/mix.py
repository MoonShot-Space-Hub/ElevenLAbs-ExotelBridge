# Final audio mix: processed voice + spotted SFX + section-levelled music bed -> loudness-normalised stereo WAV.
import numpy as np, soundfile as sf, json, sys, pyloudnorm as pyln
cfg = json.load(open(sys.argv[1])); SR = 48000
DUR = cfg['duration']; N = int(DUR * SR)
meter = pyln.Meter(SR)
v, sr = sf.read(cfg['voice']); assert sr == SR
v = v if v.ndim == 1 else v.mean(1)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
Lv = meter.integrated_loudness(np.stack([voice, voice], 1)[:int(cfg['speech_end'] * SR)])
voice *= 10 ** ((cfg['voice_lufs'] - Lv) / 20)          # voice to target (e.g. -14.5 LUFS)
mix = np.stack([voice, voice], 1)
stem_v = mix.copy(); stem_m = np.zeros_like(mix); stem_s = np.zeros_like(mix)
# ---- music, levelled per section relative to the voice
if cfg.get('music'):
    m, _ = sf.read(cfg['music']); m = m[:N] if len(m) >= N else np.pad(m, ((0, N - len(m)), (0, 0)))
    secs = cfg['music_sections']   # [start, end, LU_below_voice]
    t = np.arange(N) / SR; target = np.zeros(N)
    for a, b, lu in secs: target[(t >= a) & (t < b)] = cfg['voice_lufs'] - lu
    # measure music loudness per section, compute gain per section
    gain_db = np.zeros(N)
    for a, b, lu in secs:
        sel = slice(int(a * SR), int(min(b, DUR) * SR))
        seg = m[sel]
        if len(seg) < SR * 0.5: Lm = meter.integrated_loudness(m[max(0, sel.start - SR):sel.stop])
        else: Lm = meter.integrated_loudness(seg)
        gain_db[sel] = (cfg['voice_lufs'] - lu) - Lm
    k = int(0.25 * SR); ker = np.hanning(2 * k + 1); ker /= ker.sum()   # smooth section transitions (~250 ms)
    gain_db = np.convolve(np.pad(gain_db, (k, k), mode='edge'), ker, 'valid')
    stem_m = m * (10 ** (gain_db / 20))[:, None]
    if not cfg.get('no_music'): mix += stem_m
# ---- SFX
for ev in cfg['sfx']:
    x, _ = sf.read(f"{cfg['sfx_dir']}/{ev['name']}.wav")
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    if ev.get('hp'):
        X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)[:, None]
        x = np.fft.irfft(X / np.sqrt(1 + (ev['hp'] / np.maximum(f, 1)) ** 8), len(x), axis=0)
    if ev.get('mono'): x = np.repeat(x.mean(1, keepdims=True), 2, 1)
    x = x * 10 ** (ev['db'] / 20)
    s = int(ev['t'] * SR); e = min(N, s + len(x))
    if s < N: mix[s:e] += x[:e - s]; stem_s[s:e] += x[:e - s]
# ---- loudness normalise + true-peak-safe limiting (4x oversampled peak estimate)
L = meter.integrated_loudness(mix); G0 = 10 ** ((cfg['target_lufs'] - L) / 20); mix *= G0
ceiling = 10 ** (cfg['tp_ceiling'] / 20)
# simple look-ahead limiter on sample peaks with 4x-oversampled detection
from scipy.signal import resample_poly
det = np.abs(resample_poly(mix, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:N]
g = np.minimum(1.0, ceiling / np.maximum(det, 1e-9))
la = int(0.005 * SR)  # 5 ms look-ahead / attack
from scipy.ndimage import minimum_filter1d
gmin = minimum_filter1d(g, size=2 * la + 1)
rel = np.exp(-1 / (0.08 * SR)); out_g = np.empty(N); cur = 1.0
for i in range(N):
    cur = gmin[i] if gmin[i] < cur else gmin[i] + (cur - gmin[i]) * rel
    out_g[i] = cur
mix *= out_g[:, None]
sf.write(cfg['out'], mix.astype(np.float32), SR, subtype='FLOAT')
if cfg.get('stems_dir'):
    import os; os.makedirs(cfg['stems_dir'], exist_ok=True)
    for nm, st in (('voice_processed', stem_v), ('music_bed', stem_m), ('sound_effects', stem_s)):
        sf.write(f"{cfg['stems_dir']}/{nm}.wav", (st * G0 * out_g[:, None]).astype(np.float32), SR, subtype='PCM_24')
print('voice LUFS in', round(Lv, 1), '| mix pre-norm', round(L, 1), '| final', round(meter.integrated_loudness(mix), 2), 'LUFS | max GR dB', round(20 * np.log10(out_g.min()), 2))
