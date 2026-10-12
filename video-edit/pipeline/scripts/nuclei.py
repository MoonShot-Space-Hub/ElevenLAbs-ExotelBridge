# Syllable-nucleus detection on the voice track (for word-timing captions).
import numpy as np, soundfile as sf, json, sys
x, sr = sf.read(sys.argv[1]); x = x.mean(1) if x.ndim > 1 else x
# band-pass 300-3000 Hz via FFT mask on 20 ms frames, hop 5 ms
hop = int(0.005 * sr); n = int(0.03 * sr)
win = np.hanning(n)
fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * win
sp = np.abs(np.fft.rfft(fr, axis=1)) ** 2
f = np.fft.rfftfreq(n, 1 / sr)
band = sp[:, (f > 300) & (f < 3000)].sum(1)
e = 10 * np.log10(band + 1e-12)
# smooth ~25 ms
k = np.hanning(9); k /= k.sum(); es = np.convolve(e, k, 'same')
t = np.arange(len(es)) * hop / sr + n / 2 / sr
peaks = []
for i in range(2, len(es) - 2):
    if es[i] >= es[i - 1] and es[i] > es[i + 1]:
        # prominence: drop of >=3 dB on both sides within 80 ms
        l = es[max(0, i - 16):i].min(); r = es[i + 1:i + 17].min()
        if es[i] - l >= 2.5 and es[i] - r >= 2.5 and es[i] > es.max() - 35: peaks.append(round(float(t[i]), 3))
# merge peaks closer than 70 ms
merged = []
for p in peaks:
    if merged and p - merged[-1] < 0.07: continue
    merged.append(p)
# low-energy gaps (pauses) — local minima well below the running level
gaps = []
for i in range(10, len(es) - 10):
    if es[i] == es[i - 10:i + 11].min() and es[i] < np.percentile(es, 12): gaps.append(round(float(t[i]), 3))
json.dump({'nuclei': merged, 'gaps': gaps, 'env_t0': float(t[0]), 'env_hop': hop / sr, 'env': [round(float(v), 2) for v in es]}, open(sys.argv[2], 'w'))
print(len(merged), 'nuclei;', 'rate', round(len(merged) / (len(x) / sr), 2), '/s')
print('gaps:', gaps)
