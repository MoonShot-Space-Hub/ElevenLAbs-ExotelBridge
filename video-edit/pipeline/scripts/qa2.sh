#!/bin/bash
# usage: qa2.sh <projdir> <edit.json> <out.jpg> <times...> — renders overlays + composite for given times and tiles them
P=$(realpath $1); cfg=$(realpath $2); out=$(realpath -m $3); shift 3
S=/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad
FPSV=${FPSV:-60000/1001}; frames=$(FPSV=$FPSV python3 -c "import sys,os; FPSV=eval(os.environ.get('FPSV','60000/1001')); print(' '.join(str(round(float(t)*FPSV)) for t in sys.argv[1:]))" "$@")
rm -rf $P/work/qa_back $P/work/qa_front $P/work/qa_comp
node $S/scripts/qa_frames.mjs $P/mg/page.html back $P/work/qa_back $frames
node $S/scripts/qa_frames.mjs $P/mg/page.html front $P/work/qa_front $frames
python3 - "$cfg" "$P" $frames <<'PY'
import json, sys
c = json.load(open(sys.argv[1])); P = sys.argv[2]; c['only_frames'] = [int(x) for x in sys.argv[3:]]
c['back_dir'] = P+'/work/qa_back'; c['front_dir'] = P+'/work/qa_front'; c['out'] = P+'/work/qa_comp'
json.dump(c, open(P+'/work/qa_cfg.json', 'w'))
PY
python3 -I $S/scripts/composite2.py $P/work/qa_cfg.json > /dev/null 2>&1
FPSV=$FPSV python3 - "$out" "$P" <<'PY'
import sys, glob
from PIL import Image, ImageDraw, ImageFont
fs = sorted(glob.glob(sys.argv[2]+'/work/qa_comp/p_*.jpg')); W, H = 360, 640; cols = min(6, len(fs)); rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * H), 'black'); d = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
for k, f in enumerate(fs):
    im = Image.open(f).resize((W, H)); x, y = (k % cols) * W, (k // cols) * H; sheet.paste(im, (x, y))
    i = int(f.split('_')[-1][:5]); d.rectangle([x, y, x + 110, y + 30], fill='black'); d.text((x + 6, y + 3), f'{i/float(eval(__import__("os").environ.get("FPSV","60000/1001"))):.2f}s', fill='yellow', font=font)
sheet.save(sys.argv[1], quality=88)
PY
