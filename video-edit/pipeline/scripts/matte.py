# Robust Video Matting (ONNX) -> grayscale alpha video, frame-for-frame with the source.
import sys, subprocess, numpy as np, onnxruntime as ort, time
src, out, model = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1080, 1920
so = ort.SessionOptions(); so.intra_op_num_threads = 4
sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', '60000/1001', '-i', '-',
                        '-c:v', 'ffv1', '-pix_fmt', 'gray', out], stdin=subprocess.PIPE)
rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
dr = np.array([0.25], np.float32)
n = 0; t0 = time.time()
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).transpose(2, 0, 1)[None].astype(np.float32) / 255.0
    fgr, pha, *rec = sess.run(None, {'src': img, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': dr})
    enc.stdin.write((np.clip(pha[0, 0], 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    n += 1
    if n % 100 == 0: print(n, f'{n / (time.time() - t0):.2f} fps', flush=True)
enc.stdin.close(); enc.wait(); print('done', n)
