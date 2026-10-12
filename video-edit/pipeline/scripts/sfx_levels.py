# Per-event SFX loudness vs local voice loudness: peak 100 ms short-term (K-weighted) of the SFX vs the voice's 3 s loudness.
import numpy as np, soundfile as sf, json, sys, pyloudnorm as pyln
cfg = json.load(open(sys.argv[1])); SR = 48000
v, _ = sf.read(sys.argv[2]); meter = pyln.Meter(SR); blk = pyln.Meter(SR, block_size=0.1)
def kweight(x):
    for f in meter._filters.values(): x = f.apply_filter(x)
    return x
res = []
for e in cfg['sfx']:
    x, _ = sf.read(f"{cfg['sfx_dir']}/{e['name']}.wav"); x = x if x.ndim == 2 else np.stack([x, x], 1)
    if e.get('hp'):
        X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)[:, None]; x = np.fft.irfft(X / np.sqrt(1 + (e['hp'] / np.maximum(f, 1)) ** 8), len(x), axis=0)
    x = x * 10 ** (e['db'] / 20)
    xk = kweight(x.copy()); p = (xk ** 2).sum(1); w = int(0.1 * SR)
    ms = np.convolve(p, np.ones(w) / w, 'valid'); sfx_peak = -0.691 + 10 * np.log10(ms.max() + 1e-12)
    a = int(max(0, e['t'] - 1.5) * SR); b = int(min(35.7, e['t'] + 1.5) * SR)
    vl = meter.integrated_loudness(v[a:b]) if b - a > SR else -99
    res.append((e['t'], e['name'], e['db'], round(sfx_peak, 1), round(vl, 1), round(sfx_peak - vl, 1)))
for r in res: print(f"{r[0]:6.2f} {r[1]:15s} gain {r[2]:4d}  sfx_peak100ms {r[3]:6.1f}  voice3s {r[4]:6.1f}  rel {r[5]:+5.1f} LU")
