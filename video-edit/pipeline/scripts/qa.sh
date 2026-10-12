#!/bin/bash
# usage: qa.sh <edit.json> <out.jpg> <times...>  — renders overlays + composite for the given times and tiles them
S=/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad
cfg=$1; out=$2; shift 2
frames=$(python3 -c "import sys; print(' '.join(str(round(float(t)*60000/1001)) for t in sys.argv[1:]))" "$@")
rm -rf $S/work/qa_back $S/work/qa_front $S/work/qa_comp
node $S/scripts/qa_frames.mjs $S/mg/page.html back $S/work/qa_back $frames
node $S/scripts/qa_frames.mjs $S/mg/page.html front $S/work/qa_front $frames
python3 - "$cfg" $frames <<'PY'
import json, sys
c = json.load(open(sys.argv[1])); c['only_frames'] = [int(x) for x in sys.argv[2:]]
S='/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad'
c['back_dir'] = S+'/work/qa_back'; c['front_dir'] = S+'/work/qa_front'; c['out'] = S+'/work/qa_comp'
json.dump(c, open(S+'/work/qa_cfg.json', 'w'))
PY
cd $S && python3 -I scripts/composite2.py work/qa_cfg.json > /dev/null
python3 - "$out" <<'PY'
import sys, glob
from PIL import Image, ImageDraw, ImageFont
S='/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad'
fs = sorted(glob.glob(S+'/work/qa_comp/p_*.jpg')); W, H = 360, 640; cols = min(6, len(fs)); rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * H), 'black'); d = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
for k, f in enumerate(fs):
    im = Image.open(f).resize((W, H)); x, y = (k % cols) * W, (k // cols) * H; sheet.paste(im, (x, y))
    i = int(f.split('_')[-1][:5]); d.rectangle([x, y, x + 110, y + 30], fill='black'); d.text((x + 6, y + 3), f'{i/59.94:.2f}s', fill='yellow', font=font)
sheet.save(sys.argv[1], quality=88)
PY
