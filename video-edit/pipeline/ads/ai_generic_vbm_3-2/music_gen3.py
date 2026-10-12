# Procedural music bed v2 — arranged to the script (no sidechain pumping; section changes on script beats).
# 103 BPM, A minor / C major (Am7 - Fmaj7 - C - G). Usage: music2.py out.wav total_dur end_speech
import numpy as np, soundfile as sf, sys
SR = 48000; BPM = 103.0; BEAT = 60 / BPM; BAR = 4 * BEAT
DUR = float(sys.argv[2]); END_SPEECH = float(sys.argv[3]); N = int(DUR * SR)
rng = np.random.default_rng(23)
BREAK0, BREAK1 = 8.40, 16.05
REGRID = 16.05
SH16 = 45.10; ARP = 18.00; LIFT = 45.05
RES = END_SPEECH                         # resolve hit
def grid_time(k_beats, origin): return origin + k_beats * BEAT
def midi(m): return 440 * 2 ** ((m - 69) / 12)
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67]]
L = np.zeros(N + SR * 3); R = np.zeros(N + SR * 3)
def addst(x, start, g=1.0, p=0.0):
    s = int(start * SR)
    if s < 0: x = x[-s:]; s = 0
    if s >= len(L) or len(x) == 0: return
    e = min(len(L), s + len(x)); a = (p + 1) * np.pi / 4
    L[s:e] += g * np.cos(a) * x[:e - s]; R[s:e] += g * np.sin(a) * x[:e - s]
def fftf(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** order)
    if hi: m *= 1 / (1 + (f / hi) ** order)
    return np.fft.irfft(X * m, len(x))
def saw(f, n, ph=0.0): t = np.arange(n) / SR; return 2 * ((f * t + ph) % 1.0) - 1
def chord_at(t):
    origin = 0.0 if t < REGRID else REGRID
    return CH[int((t - origin) // BAR) % 4]
# ---- pad (per bar of the active grid)
def bars(origin, a, b):
    k = 0
    while True:
        t = origin + k * BAR
        if t >= b: break
        if t + BAR > a: yield t
        k += 1
segments = [(0.0, 0.0, REGRID), (REGRID, REGRID, DUR + 2)]
for origin, a, b in segments:
    for t0 in bars(origin, a, b):
        ts, te = max(t0, a), min(t0 + BAR, b)
        n = int((te - ts + 0.5) * SR); t = np.arange(n) / SR; ch = chord_at(ts + 0.01)
        x = sum(saw(midi(m) * 2 ** (d / 12), n, rng.random()) for m in ch for d in (-0.09, 0.0, 0.08))
        env = np.minimum(1, t / (0.05 if ts == a else 0.3)) * np.where(t > te - ts, np.maximum(0, 1 - (t - (te - ts)) / 0.5), 1)
        brk = BREAK0 <= ts + 0.01 < BREAK1
        x = fftf(x * env, 100, 650 if brk else 1500, 2) * (0.055 if brk else 0.045)
        addst(x, ts, 1.0, -0.3); addst(np.roll(x, 240), ts, 1.0, 0.3)
# ---- shimmer: airy high pad (fills the 5-12 kHz the voice lacks), always on, softer in break
n = N + SR; t = np.arange(n) / SR
sh = fftf(rng.standard_normal(n), 6000, 12000, 2) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) ** 2)
tone = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in (2637, 3136, 3951)) * 0.15
shim = (sh * 0.012 + fftf(tone, 2000, None) * 0.010)
brkmask = np.where((t >= BREAK0) & (t < BREAK1), 0.6, 1.0)
addst(shim * brkmask, 0.0, 1.0, -0.5); addst(np.roll(shim, 997) * brkmask, 0.0, 1.0, 0.5)
# ---- drums
def kick():
    n = int(0.42 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(46 + 90 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.15)
    knock = fftf(rng.standard_normal(n), 150, 400) * np.exp(-t / 0.012) * 0.6   # audible on phone speakers
    return np.tanh(1.8 * (body + knock)) * 0.5
def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    e = sum(np.exp(-np.maximum(0, t - o) / 0.006) * (t >= o) for o in (0, 0.011, 0.022)) * 0.6 + np.exp(-np.maximum(0, t - 0.03) / 0.08) * (t >= 0.03)
    return fftf(x * e, 1000, 7000) * 0.16
def hat(dec=0.014, g=0.085):
    n = int(0.12 * SR); t = np.arange(n) / SR; return fftf(rng.standard_normal(n), 7500, 16000) * np.exp(-t / dec) * g
def shaker(g=0.035):
    n = int(0.07 * SR); t = np.arange(n) / SR; return fftf(rng.standard_normal(n), 5000, 13000) * np.sin(np.pi * t / t[-1]) ** 2 * g
K, C, H, HO = kick(), clap(), hat(), hat(0.08, 0.06)
def drums(origin, a, b):
    k = 0
    while True:
        tb = origin + k * BEAT
        if tb >= b: break
        if tb >= a:
            addst(K, tb, 1.0)
            if k % 2 == 1: addst(C, tb, 1.0, 0.05)
            addst(H, tb + BEAT / 2, 1.0, 0.25); addst(H, tb, 0.45, -0.2)
            if k % 8 == 7: addst(HO, tb + BEAT / 2, 1.0, 0.3)
            for q in ((0.25, 0.75) if tb < SH16 else (0.25, 0.5, 0.75)): addst(shaker(0.03 if tb < SH16 else 0.04), tb + q * BEAT, 1.0, -0.35)
        k += 1
drums(0.0, 0.0, BREAK0)
drums(REGRID, REGRID, RES)
# ---- bass (root, 8ths) — off during break
def bass(origin, a, b):
    k = 0
    while True:
        tt = origin + k * BEAT / 2
        if tt >= b: break
        if tt >= a:
            f = midi(chord_at(tt + 0.01)[0] - 12); n = int(BEAT / 2 * SR); t = np.arange(n) / SR
            x = np.tanh(1.4 * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t))) * np.minimum(1, t / 0.008) * np.exp(-t / 0.2) * 0.13
            addst(x, tt, 1.0)
        k += 1
bass(0.0, 0.0, BREAK0); bass(REGRID, REGRID, RES)
# ---- arp texture from 'ABCT with AI'
def arp(origin, a, b):
    k = 0; pat = [0, 2, 1, 3, 2, 1, 3, 2]
    while True:
        tt = origin + k * BEAT / 2
        if tt >= b: break
        if tt >= a:
            m = chord_at(tt + 0.01)[pat[k % 8]] + 24; n = int(0.3 * SR); t = np.arange(n) / SR
            x = (np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(4 * np.pi * midi(m) * t)) * np.exp(-t / 0.07) * 0.03
            addst(x, tt, 1.0, 0.4 if k % 2 else -0.4); addst(x * 0.35, tt + 0.75 * BEAT, 1.0, -0.4 if k % 2 else 0.4)
        k += 1
arp(REGRID, ARP, RES)
# ---- transitions: reverse swell into the break and into the regrid downbeat; resolve hit at the end
def swell(d, lo=2500): n = int(d * SR); t = np.arange(n) / SR; return fftf(rng.standard_normal(n), lo, 14000) * (t / d) ** 3 * 0.10
addst(swell(0.9), BREAK0 - 0.9, 1.0); addst(swell(1.2), REGRID - 1.2, 1.0)
n = int(3.0 * SR); t = np.arange(n) / SR
res = sum(saw(midi(m) * 2 ** (d / 12), n, rng.random()) for m in (45, 57, 60, 64, 69) for d in (-0.07, 0.07))
res = fftf(res, 60, 2200, 2) * np.exp(-t / 1.1) * 0.06 + np.tanh(2 * np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.4)) * 0.35
addst(res, RES, 1.0)
L, R = L[:N], R[:N]
mix = np.stack([L, R], 1)
# section gain map (in-bed arrangement dynamics; the mixer sets the level under voice)
tt = np.arange(N) / SR
g = np.ones(N); g[tt >= LIFT] = 10 ** (2 / 20)
fo = int(0.6 * SR); g[-fo:] *= np.linspace(1, 0, fo) ** 2
mix *= g[:, None]
# voice pocket: -5 dB bell around 2 kHz (1-4 kHz), HP 35 Hz
for c in range(2):
    X = np.fft.rfft(mix[:, c]); f = np.fft.rfftfreq(N, 1 / SR)
    bell = 1 - (1 - 10 ** (-5 / 20)) * np.exp(-0.5 * (np.log2(np.maximum(f, 1) / 2000) / 0.85) ** 2)
    mix[:, c] = np.fft.irfft(X * bell / (1 + (35 / np.maximum(f, 1)) ** 4), N)
mix /= np.abs(mix).max() / 0.7
sf.write(sys.argv[1], mix.astype(np.float32), SR, subtype='PCM_24')
print('music v2', DUR, 's')
