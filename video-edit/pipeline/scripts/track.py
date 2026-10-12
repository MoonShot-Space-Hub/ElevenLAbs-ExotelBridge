# Head tracking from the person matte: per-frame head-top y and head-centre x (full-res px), smoothed.
import subprocess, numpy as np, json, sys
W, H = 270, 480; sc = 4
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
tops, cxs, faces = [], [], []
while True:
    b = p.stdout.read(W * H)
    if len(b) < W * H: break
    a = np.frombuffer(b, np.uint8).reshape(H, W) > 127
    rows = np.where(a.sum(1) >= 3)[0]
    top = rows[0] if len(rows) else 90
    band = a[top:top + 50]  # ~200 px full res: the head
    ys, xs = np.nonzero(band)
    cx = xs.mean() if len(xs) else W / 2
    tops.append(top * sc); cxs.append(cx * sc)
tops, cxs = np.array(tops, float), np.array(cxs, float)
def smooth(x, sigma_frames):
    k = np.exp(-0.5 * (np.arange(-3 * sigma_frames, 3 * sigma_frames + 1) / sigma_frames) ** 2); k /= k.sum()
    xp = np.pad(x, (len(k) // 2, len(k) // 2), mode='edge'); return np.convolve(xp, k, 'valid')
out = {'top': tops.tolist(), 'cx': cxs.tolist(), 'top_s': smooth(tops, 15).tolist(), 'cx_s': smooth(cxs, 15).tolist()}
json.dump(out, open(sys.argv[2], 'w'))
print('frames', len(tops), 'top range', tops.min(), tops.max(), 'cx range', round(cxs.min()), round(cxs.max()))
for i in range(0, len(tops), 120): print(f'{i/59.94:5.1f}s top {out["top_s"][i]:.0f} cx {out["cx_s"][i]:.0f}')
