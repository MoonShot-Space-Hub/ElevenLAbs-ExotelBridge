# Parallel compositor (v2): same look as composite.py, but grade via a precomputed 7-bit 3D LUT and frames split
# across worker processes that each encode a segment; segments are concatenated losslessly at the end.
import sys, json, subprocess, os, numpy as np, cv2
cv2.setNumThreads(1)
W, H = 1080, 1920
cfg = json.load(open(sys.argv[1]))
FPS_STR = cfg.get('fps', '60000/1001'); _n, _d = (FPS_STR.split('/') + ['1'])[:2]; FPS = float(_n) / float(_d)
track = json.load(open(cfg['track'])); nsrc = len(track['top'])
hold = int(round(cfg.get('end_hold', 0) * FPS)); ntot = nsrc + hold
shots = cfg['shots']
for s in shots:
    a, b = int(s['start'] * FPS), min(nsrc, int(s['end'] * FPS) + 1)
    s['cx'] = float(np.mean(track['cx'][a:b])) if b > a else 540.0
    s['top'] = float(np.median(track['top'][a:b])) if b > a else 380.0
def shot_at(t):
    for s in shots:
        if s['start'] <= t < s['end']: return s
    return shots[-1]
def ease(u): return u * u * (3 - 2 * u)
def interp_keys(keys, t, field):
    ks = [k for k in keys if field in k]
    if not ks: return 0.0
    if t <= ks[0]['t']: return ks[0][field]
    for k0, k1 in zip(ks[:-1], ks[1:]):
        if k0['t'] <= t <= k1['t']:
            u = (t - k0['t']) / max(1e-6, k1['t'] - k0['t']); return k0[field] + (k1[field] - k0[field]) * ease(u)
    return ks[-1][field]
def camera(t):
    s = shot_at(t); u = np.clip((t - s['start']) / max(1e-6, s['end'] - s['start']), 0, 1)
    sc = s['s0'] + (s['s1'] - s['s0']) * (u if s.get('linear', True) else ease(u))
    if 'settle_from' in s:
        d = s.get('settle_dur', 0.12); v = np.clip((t - s['start']) / d, 0, 1)
        sc = s['settle_from'] + (sc - s['settle_from']) * (1 - (1 - v) ** 3)
    for bp in cfg.get('bumps', []):  # brief scale bump (accent on a stamp), no positional shake
        if bp['t'] <= t < bp['t'] + bp['dur']:
            sc *= 1 + bp['amt'] * np.sin(np.pi * (t - bp['t']) / bp['dur'])
    T = s.get('T', 330); cx = s['cx'] + s.get('dx', 0); top = s['top']
    x0 = np.clip(cx - 540 / sc, 0, W - W / sc); y0 = np.clip(top - T / sc, 0, H - H / sc)
    dx = dy = 0.0
    for sh in cfg.get('shakes', []):
        if sh['t'] <= t < sh['t'] + sh['dur']:
            k = (t - sh['t']) / sh['dur']; amp = sh['amp'] * (1 - k) ** 2
            dx += amp * np.sin(2 * np.pi * 31 * (t - sh['t'])); dy += amp * np.cos(2 * np.pi * 23 * (t - sh['t']))
    return sc, x0 - dx / sc, y0 - dy / sc
def warp(img, sc, x0, y0, interp):
    M = np.array([[sc, 0, -sc * x0], [0, sc, -sc * y0]], np.float32)
    return cv2.warpAffine(img, M, (W, H), flags=interp, borderMode=cv2.BORDER_REFLECT)
G = cfg.get('grade', {})
def grade_float(img):  # img float32 BGR 0..1 (N,1,3) — used only to build the LUT
    hls = cv2.cvtColor(img, cv2.COLOR_BGR2HLS); h, l, s = hls[..., 0], hls[..., 1], hls[..., 2]
    def hue_w(c, width): d = np.abs(((h - c + 180) % 360) - 180); return np.clip(1 - d / width, 0, 1)
    wg = hue_w(110, 45); wy = hue_w(70, 25); wb = hue_w(220, 30); ws = hue_w(20, 22) * np.clip((l - 0.25) / 0.2, 0, 1)
    s *= 1 - G.get('green_desat', 0.22) * wg - G.get('yellowgreen_desat', 0.15) * wy - G.get('blue_desat', 0.08) * wb
    h += G.get('yellowgreen_shift', 6) * wy
    hls[..., 0], hls[..., 2] = h % 360, s
    out = cv2.cvtColor(hls, cv2.COLOR_HLS2BGR)
    out = out + (ws[..., None] * G.get('skin_warm', 0.025)) * np.array([-1.0, 0.25, 0.6], np.float32)
    c = G.get('contrast', 0.08); out = np.clip(out, 0, 1); return out + c * (out - 0.5) * (1 - np.abs(2 * out - 1))
def build_lut():
    v = (np.arange(128, dtype=np.float32) * 2 + 1) / 255.0
    b, g, r = np.meshgrid(v, v, v, indexing='ij')
    img = np.stack([b, g, r], -1).reshape(-1, 1, 3)
    return (np.clip(grade_float(img).reshape(-1, 3), 0, 1) * 255 + 0.5).astype(np.uint8)
def apply_lut(lut, img8):
    q = (img8 >> 1).astype(np.int32)
    return lut[(q[..., 0] << 14) | (q[..., 1] << 7) | q[..., 2]]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = (1 - G.get('vignette', 0.18) * np.clip(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.42) / (H * 0.62)) ** 2, 0, 1.5) ** 1.3)[..., None].astype(np.float32)
del yy, xx
DLO = np.array([77, 31, 11], np.float32) / 255; DHI = np.array([181, 123, 91], np.float32) / 255
LUMW = np.array([0.114, 0.587, 0.299], np.float32)
def read_overlay(d, i):
    if not d: return None
    p = os.path.join(d, f'f_{i:05d}.png')
    return cv2.imread(p, cv2.IMREAD_UNCHANGED) if os.path.exists(p) else None
def over(base, ov):
    if ov is None: return base
    a = ov[..., 3:4].astype(np.float32) * (1 / 255.0)
    return base + (ov[..., :3].astype(np.float32) * (1 / 255.0) - base) * a
def worker(a, b, out, lut):
    sel = f"select='between(n\\,{a}\\,{min(b, nsrc) - 1})'"
    last = min(b, nsrc) - 1 if a < nsrc else nsrc - 1
    first_dec = min(a, nsrc - 1)
    sel = f"select='between(n\\,{first_dec}\\,{last})'"
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', cfg['src'], '-vf', sel, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    adec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', cfg['alpha'], '-vf', sel, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    only = cfg.get('only_frames')
    if only is None:
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', FPS_STR, '-i', '-',
                                '-c:v', 'libx264', '-preset', cfg.get('preset', 'medium'), '-crf', str(cfg.get('crf', 16)), '-pix_fmt', 'yuv420p',
                                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-threads', '2', out], stdin=subprocess.PIPE)
    ker3 = np.ones((3, 3), np.uint8); frame = alpha = None
    BACK, FRONT = cfg.get('back_dir'), cfg.get('front_dir')
    for i in range(first_dec, b):
        if i <= last and (i < nsrc):
            fb = dec.stdout.read(W * H * 3); ab = adec.stdout.read(W * H)
            frame = np.frombuffer(fb, np.uint8).reshape(H, W, 3); alpha = np.frombuffer(ab, np.uint8).reshape(H, W)
        if i < a: continue
        if only is not None and i not in only: continue
        t = i / FPS; tc = min(t, (nsrc - 1) / FPS)
        sc, x0, y0 = camera(tc)
        person8 = apply_lut(lut, warp(frame, sc, x0, y0, cv2.INTER_CUBIC))
        f = person8.astype(np.float32) * (1 / 255.0)
        am = warp(alpha, sc, x0, y0, cv2.INTER_LINEAR)
        am = cv2.GaussianBlur(cv2.erode(am, ker3), (0, 0), 1.2).astype(np.float32)[..., None] * (1 / 255.0)
        dk = interp_keys(cfg['bg'], t, 'darken'); ds = interp_keys(cfg['bg'], t, 'desat'); bl = interp_keys(cfg['bg'], t, 'blur'); du = interp_keys(cfg['bg'], t, 'duotone')
        if bl > 0.3:
            q = 4; inv = 1 - am
            fs = cv2.resize(f * inv, (W // q, H // q), interpolation=cv2.INTER_AREA); ws = cv2.resize(inv, (W // q, H // q), interpolation=cv2.INTER_AREA)
            fsb = cv2.GaussianBlur(fs, (0, 0), bl / q); wsb = cv2.GaussianBlur(ws, (0, 0), bl / q)
            if wsb.ndim == 2: wsb = wsb[..., None]
            bg = cv2.resize(fsb / np.maximum(wsb, 1e-3), (W, H), interpolation=cv2.INTER_LINEAR) * 0.85 + f * 0.15
        else: bg = f.copy()
        if ds > 0: bg = bg * (1 - ds) + bg.mean(2, keepdims=True) * ds
        bg *= VIG * (1 - dk)
        if du > 0:
            lum = np.clip(bg @ LUMW, 0, 1)[..., None]; bg = bg * (1 - du) + (DLO + (DHI - DLO) * lum) * du
        if i >= nsrc:
            k = min(1.0, (i - nsrc) / (0.35 * FPS)); ex = cfg.get('end_extra', {'darken': 0.35, 'blur': 10})
            comp = bg + (f - bg) * am
            comp = cv2.GaussianBlur(comp, (0, 0), 0.1 + ex['blur'] * k) * (1 - ex['darken'] * k)
            comp = over(comp, read_overlay(BACK, i))
        else:
            comp = over(bg, read_overlay(BACK, i)); comp = comp + (f - comp) * am
        for wh in cfg.get('whips', []):
            if wh['t'] <= t < wh['t'] + wh['dur']:
                k = 1 - (t - wh['t']) / wh['dur']; L_ = int(wh.get('blur', 90) * k ** 1.5) | 1
                if L_ > 1: comp = cv2.blur(comp, (L_, 1), borderType=cv2.BORDER_REFLECT)
                M = np.float32([[1, 0, wh.get('dir', 1) * wh.get('shift', 60) * k ** 2], [0, 1, 0]]); comp = cv2.warpAffine(comp, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        comp = over(comp, read_overlay(FRONT, i))
        for fl in cfg.get('flashes', []):
            if fl['t'] <= t < fl['t'] + fl['dur']:
                k = 1 - (t - fl['t']) / fl['dur']; comp = comp + (1 - comp) * fl.get('strength', 0.8) * k ** 2
        o8 = (np.clip(comp, 0, 1) * 255 + 0.5).astype(np.uint8)
        if only is None: enc.stdin.write(o8.tobytes())
        else: cv2.imwrite(os.path.join(cfg['out'], f'p_{i:05d}.jpg'), o8, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if only is None: enc.stdin.close(); enc.wait()
    dec.kill(); adec.kill()
if __name__ == '__main__':
    lut_path = cfg.get('lut_cache', os.path.join(os.path.dirname(cfg['out']) if cfg.get('only_frames') is None else cfg['out'], 'grade_lut.npy'))
    if len(sys.argv) > 2:   # worker mode: cfg a b segment
        a, b, seg = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        worker(a, b, seg, np.load(sys.argv[5])); sys.exit(0)
    import tempfile, time
    t0 = time.time(); lut = build_lut(); tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(sys.argv[1])))
    np.save(os.path.join(tmp, 'lut.npy'), lut)
    if cfg.get('only_frames') is not None:
        os.makedirs(cfg['out'], exist_ok=True); worker(0, ntot, None, lut); print('preview frames done'); sys.exit(0)
    NW = cfg.get('workers', 4); bounds = np.linspace(0, ntot, NW + 1).astype(int)
    procs, segs = [], []
    for k in range(NW):
        seg = os.path.join(tmp, f'seg_{k}.mp4'); segs.append(seg)
        procs.append(subprocess.Popen([sys.executable, '-I', os.path.abspath(__file__), sys.argv[1], str(bounds[k]), str(bounds[k + 1]), seg, os.path.join(tmp, 'lut.npy')]))
    rc = [p.wait() for p in procs]; assert all(r == 0 for r in rc), rc
    with open(os.path.join(tmp, 'list.txt'), 'w') as fh:
        for s in segs: fh.write(f"file '{s}'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', cfg['out']], check=True)
    print('composite done', ntot, 'frames in', round(time.time() - t0), 's')
