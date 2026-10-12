#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad; S2=$S/vbm
NF=2999
rm -rf $S2/work/ov_back $S2/work/ov_front
cd $S2/mg
node render.mjs back $S2/work/ov_back 60000/1001 $NF 3
node render.mjs front $S2/work/ov_front 60000/1001 $NF 3
python3 - <<'PY'
import json
S2='/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad/vbm'
c=json.load(open(S2+'/work/edit_vbm.json')); c.pop('only_frames',None)
c['back_dir']=S2+'/work/ov_back'; c['front_dir']=S2+'/work/ov_front'; c['out']=S2+'/work/video_noaudio.mp4'
json.dump(c,open(S2+'/work/render_cfg.json','w'))
PY
python3 -I $S/scripts/composite2.py $S2/work/render_cfg.json 2>&1 | grep -v "Broken pipe\|muxing a packet\|writing trailer\|closing file\|submitting a packet"
python3 -I $S/scripts/mix.py $S2/work/mix_vbm.json
ffmpeg -v error -y -i $S2/work/video_noaudio.mp4 -i $S2/work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -t 50.0333 -movflags +faststart $S2/out/VBM_AD_ST-1_edited_master.mp4
echo "RENDER DONE"
