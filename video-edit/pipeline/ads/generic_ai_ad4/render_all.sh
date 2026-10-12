#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad; P=$S/gen4
NF=2020
rm -rf $P/work/ov_back $P/work/ov_front
cd $P/mg
node render.mjs back $P/work/ov_back 60/1 $NF 3
node render.mjs front $P/work/ov_front 60/1 $NF 3
python3 - <<'PY'
import json
P='/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad/gen4'
c=json.load(open(P+'/work/edit_gen4.json')); c.pop('only_frames',None)
c['back_dir']=P+'/work/ov_back'; c['front_dir']=P+'/work/ov_front'; c['out']=P+'/work/video_noaudio.mp4'
json.dump(c,open(P+'/work/render_cfg.json','w'))
PY
python3 -I $S/scripts/composite2.py $P/work/render_cfg.json 2>&1 | grep -v "Broken pipe\|muxing a packet\|writing trailer\|closing file\|submitting a packet"
ffmpeg -v error -y -i $P/work/video_noaudio.mp4 -i $P/work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -t 33.6667 -movflags +faststart $P/out/Generic_AI_VBM_Ad_4_edited_master.mp4
echo "RENDER DONE"
