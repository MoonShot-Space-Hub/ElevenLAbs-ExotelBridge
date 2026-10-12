import numpy as np, soundfile as sf, sys
for p in sys.argv[1:]:
    x, sr = sf.read(p); x = x.mean(1) if x.ndim > 1 else x
    n = 8192; fr = np.lib.stride_tricks.sliding_window_view(x, n)[::4096] * np.hanning(n)
    S = (np.abs(np.fft.rfft(fr, axis=1)) ** 2).mean(0); f = np.fft.rfftfreq(n, 1 / sr)
    def b(a, c): return 10 * np.log10(S[(f >= a) & (f < c)].sum() + 1e-20)
    ref = b(2500, 4000)
    print(p.split('/')[-1][:28].ljust(28), ' '.join(f'{a}-{c}:{b(a, c) - ref:+.1f}' for a, c in [(60, 100), (200, 400), (400, 1000), (1000, 2500), (4000, 8000), (8000, 12000)]))
