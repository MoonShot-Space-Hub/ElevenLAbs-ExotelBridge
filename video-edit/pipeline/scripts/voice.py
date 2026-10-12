# Voice "air" restoration: parallel harmonic exciter fed from the 2.5-4.5 kHz band, high-passed above 5 kHz.
import numpy as np, soundfile as sf, sys
x, sr = sf.read(sys.argv[1]); x = x if x.ndim == 1 else x.mean(1)
target_rel = float(sys.argv[3]) if len(sys.argv) > 3 else -22.0
def fftf(x, lo=None, hi=None, order=6):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / sr); m = np.ones_like(f)
    if lo: m *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** (2 * order))
    if hi: m *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * m, len(x))
h = fftf(x, 2500, 4500)
pk = np.percentile(np.abs(h), 99.5) + 1e-9
harm = 0.6 * np.abs(h / pk) + 0.4 * np.tanh(3 * h / pk)   # even + odd harmonics
harm = fftf(harm - harm.mean(), 5000, 14000)
def band(sig, a, c):
    n = 8192; fr = np.lib.stride_tricks.sliding_window_view(sig, n)[::4096] * np.hanning(n)
    S = (np.abs(np.fft.rfft(fr, axis=1)) ** 2).mean(0); f = np.fft.rfftfreq(n, 1 / sr)
    return S[(f >= a) & (f < c)].sum()
ref = band(x, 2500, 4000); cur = band(x, 8000, 12000); hb = band(harm, 8000, 12000)
# solve gain g so that band(x + g*harm) ~ ref * 10^(target/10) (assume incoherent add)
need = max(0.0, ref * 10 ** (target_rel / 10) - cur); g = np.sqrt(need / hb) if hb > 0 else 0
y = x + g * harm
y *= np.abs(x).max() / np.abs(y).max()
sf.write(sys.argv[2], y.astype(np.float32), sr, subtype='FLOAT')
print('exciter gain', round(float(g), 4))
