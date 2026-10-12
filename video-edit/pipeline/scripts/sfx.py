# Procedural sound-effects library (48 kHz stereo WAV). All sounds synthesized from scratch -> no licensing issues.
import numpy as np, soundfile as sf, os, sys
SR = 48000
rng = np.random.default_rng(7)
def t_(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a, d, s, r, sl=0.6):
    a, d, r = int(a * SR), int(d * SR), int(r * SR); s_ = max(0, n - a - d - r)
    return np.concatenate([np.linspace(0, 1, a, False) ** 1.5, np.linspace(1, sl, d, False), np.full(s_, sl), np.linspace(sl, 0, r) ** 2])[:n]
def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = (1 - a) * x[i] + a * z; y[i] = z
    return y
def svf(x, fc, q=0.7, mode='bp'):
    """Chamberlin state-variable filter with per-sample cutoff array."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    low = band = 0.0; out = np.empty_like(x); damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = x[i] - low - damp * band; band += f * high; low += f * band
        out[i] = band if mode == 'bp' else (low if mode == 'lp' else high)
    return out
def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def reverb(x, rt=0.6, mix=0.18, pre=0.012, bright=6000):
    n = int(rt * SR * 1.2); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / (rt * SR))
    ir = fft_filter(ir, 200, bright); ir /= np.sqrt((ir ** 2).sum())
    pad = int(pre * SR)
    wetL = np.convolve(x, ir)[:len(x) + n]; irR = np.roll(ir, 37)
    wetR = np.convolve(x, irR)[:len(x) + n]
    dry = np.concatenate([x, np.zeros(n)])
    L = dry + mix * np.concatenate([np.zeros(pad), wetL])[:len(dry)]
    R = dry + mix * np.concatenate([np.zeros(pad), wetR])[:len(dry)]
    return np.stack([L, R], 1)
def pan(x, p):  # p in [-1,1], array or scalar; equal-power
    p = np.broadcast_to(np.asarray(p, float), x.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)
def norm(x, peak_db=-1.0):
    x = x - x.mean(0); p = np.abs(x).max(); return x / p * 10 ** (peak_db / 20) if p > 0 else x
def trim(x, thr=1e-4):
    idx = np.where(np.abs(x).max(1) > thr)[0]; return x[:idx[-1] + 1] if len(idx) else x
def save(name, x):
    x = trim(norm(x if x.ndim == 2 else np.stack([x, x], 1)))
    sf.write(os.path.join(OUT, name + '.wav'), x.astype(np.float32), SR, subtype='PCM_24')

def whoosh(d=0.7, f0=300, f1=4000, peak=0.6, q=1.2, pan_from=-0.6, pan_to=0.6, air=0.35):
    t = t_(d); n = len(t); x = rng.standard_normal(n)
    u = t / d; shape = np.where(u < peak, (u / peak) ** 2.2, (1 - (u - peak) / (1 - peak)) ** 1.6)
    fc = f0 * (f1 / f0) ** np.clip(u / peak, 0, 1) if f1 > f0 else f0 * (f1 / f0) ** u
    y = svf(x, fc, q) * shape + air * fft_filter(x, 3000, 12000) * shape ** 2
    return reverb(pan(y, np.linspace(pan_from, pan_to, n))[:, 0] * 0 + y, 0.5, 0.12) if False else pan(y, np.linspace(pan_from, pan_to, n))
def swoosh_short():
    return whoosh(0.32, 600, 6000, 0.45, 1.6, -0.3, 0.3, 0.5)
def whoosh_deep():
    w = whoosh(0.9, 120, 1800, 0.55, 0.9, -0.5, 0.5, 0.15)
    t = t_(0.9); sub = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 45, len(t))) / SR) * np.exp(-((t - 0.5) / 0.18) ** 2) * 0.5
    return w + pan(sub, 0)
def pop(f0=900, f1=260, d=0.09, bright=0.25):
    t = t_(d); ph = 2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / d)) / SR
    y = np.sin(ph) * np.exp(-t / (d * 0.28)) + bright * fft_filter(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.004)
    return reverb(y, 0.25, 0.1)
def click_ui():
    t = t_(0.06); y = fft_filter(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.0025)
    y += 0.5 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.006); y += 0.35 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.01)
    return reverb(y, 0.2, 0.08)
def mouse_click():
    a = click_ui(); b = click_ui() * 0.7; gap = int(0.075 * SR)
    out = np.zeros((len(a) + gap, 2)); out[:len(a)] += a; out[gap:gap + len(b)] += b[:len(out) - gap]; return out
def bell(f=1320, d=1.6, partials=((1, 1, 1), (2.0, 0.45, 0.6), (2.76, 0.3, 0.45), (5.4, 0.16, 0.25), (8.93, 0.07, 0.15))):
    t = t_(d); y = np.zeros_like(t)
    for r, a, dec in partials: y += a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6)) * np.exp(-t / (d * dec * 0.35))
    y *= np.minimum(1, t / 0.002)
    return reverb(y, 1.2, 0.22)
def ding(): return bell(1568, 1.4)
def chime_success():
    a = bell(1046.5, 1.4); b = bell(1568, 1.6); c = bell(2093, 1.6)
    out = np.zeros((len(c) + int(0.22 * SR), 2)); out[:len(a)] += a * 0.8; o = int(0.09 * SR); out[o:o + len(b)] += b * 0.75
    o2 = int(0.18 * SR); out[o2:o2 + len(c)] += c * 0.6; return out
def riser(d=2.0, f0=200, f1=2400):
    t = t_(d); u = t / d
    noise = svf(rng.standard_normal(len(t)), 400 * (8000 / 400) ** u, 1.5) * u ** 2.5
    tone = sum(np.sin(2 * np.pi * np.cumsum(f0 * k * (f1 / f0) ** (u ** 1.5)) / SR) / k for k in (1, 2, 3)) * u ** 3 * 0.25
    y = noise * 0.9 + tone; y *= np.where(u > 0.97, (1 - u) / 0.03, 1)
    return reverb(y, 0.8, 0.2)
def impact(d=1.6):
    t = t_(d); sub = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.45)
    hit = fft_filter(rng.standard_normal(len(t)), 80, 5000) * np.exp(-t / 0.03) * 0.8
    body = fft_filter(rng.standard_normal(len(t)), 60, 400) * np.exp(-t / 0.25) * 0.4
    y = np.tanh(1.6 * (sub + hit + body)); return reverb(y, 1.6, 0.25, bright=3000)
def tick():
    t = t_(0.03); y = np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.003) + 0.4 * fft_filter(rng.standard_normal(len(t)), 4000, 12000) * np.exp(-t / 0.0015)
    return reverb(y, 0.15, 0.05)
def counter_roll(d=0.9, start_rate=7, end_rate=22):
    out = np.zeros((int((d + 0.1) * SR), 2)); tk = tick(); tt = 0.0; k = 0
    while tt < d:
        o = int(tt * SR); g = 0.55 + 0.45 * (tt / d)
        out[o:o + len(tk)] += tk[:len(out) - o] * g * (1 if k % 2 else 0.85)
        rate = start_rate + (end_rate - start_rate) * (tt / d); tt += 1 / rate; k += 1
    return out
def stamp():
    t = t_(0.5); thud = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t / 0.04) + 70) / SR) * np.exp(-t / 0.06)
    slap = fft_filter(rng.standard_normal(len(t)), 300, 6000) * np.exp(-t / 0.012)
    return reverb(np.tanh(2.2 * (thud * 0.9 + slap * 0.8)), 0.35, 0.15)
def scribble(d=0.45):
    t = t_(d); x = rng.standard_normal(len(t)); am = 0.55 + 0.45 * np.sin(2 * np.pi * 13 * t) ** 2
    y = svf(x, 2500 + 1200 * np.sin(2 * np.pi * 9 * t), 2.5) * am * env_adsr(len(t), 0.02, 0.05, 0, 0.12, 0.9)
    return reverb(y, 0.2, 0.08)
def buzz_soft():  # gentle "wrong" bonk, not harsh
    t = t_(0.28); y = (np.sin(2 * np.pi * 196 * t) + 0.5 * np.sin(2 * np.pi * 185 * t)) * np.exp(-t / 0.09)
    y = onepole_lp(np.tanh(2.5 * y), 1800); return reverb(y, 0.3, 0.12)
def shutter():
    t = t_(0.18); a = fft_filter(rng.standard_normal(len(t)), 1500, 9000) * (np.exp(-t / 0.006) + 0.6 * np.exp(-np.maximum(0, t - 0.07) / 0.008) * (t > 0.07))
    return reverb(a, 0.2, 0.08)
def notification():
    a = bell(1760, 0.6, ((1, 1, 1), (2, 0.3, 0.5))); b = bell(2637, 0.9, ((1, 1, 1), (2, 0.25, 0.5)))
    out = np.zeros((len(b) + int(0.12 * SR), 2)); out[:len(a)] += a; o = int(0.12 * SR); out[o:o + len(b)] += b * 0.9; return out
def glitch(d=0.25):
    t = t_(d); y = np.sign(np.sin(2 * np.pi * (300 + 900 * (rng.random(len(t)) > 0.97).cumsum() % 5 * 120) * t)) * 0.4
    y *= (rng.random(len(t) // 480 + 1).repeat(480)[:len(t)] > 0.35); y = fft_filter(y, 200, 7000) * env_adsr(len(t), 0.002, 0.02, 0.8, 0.05, 0.7)
    return pan(y, 0)
def soft_hit():  # tonal pluck for text accents
    t = t_(0.6); y = sum(np.sin(2 * np.pi * 523.25 * k * t) * np.exp(-t * (6 + 4 * k)) / k for k in (1, 2, 3, 4))
    return reverb(y * np.minimum(1, t / 0.003), 0.7, 0.2)

if __name__ == '__main__':
    OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
    lib = {'whoosh': whoosh(), 'whoosh_rev': whoosh(0.7, 4000, 300, 0.8, 1.2, 0.6, -0.6), 'swoosh_short': swoosh_short(),
           'whoosh_deep': whoosh_deep(), 'pop': pop(), 'pop_high': pop(1400, 500, 0.07), 'pop_low': pop(600, 180, 0.12, 0.15),
           'click': click_ui(), 'mouse_click': mouse_click(), 'ding': ding(), 'chime_success': chime_success(), 'riser': riser(),
           'riser_short': riser(1.0, 300, 2000), 'impact': impact(), 'tick': tick(), 'counter_roll': counter_roll(), 'stamp': stamp(),
           'scribble': scribble(), 'buzz_soft': buzz_soft(), 'shutter': shutter(), 'notification': notification(), 'glitch': glitch(),
           'soft_hit': soft_hit()}
    for k, v in lib.items(): save(k, v); print(k, round(len(v) / SR, 2), 's')
