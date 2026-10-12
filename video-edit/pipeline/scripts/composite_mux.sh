#!/bin/bash
# usage: composite_mux.sh <edit.json> <mix.wav> <out.mp4>  (overlays already rendered in work/ov_back, work/ov_front)
set -e
S=/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad
cfg=$(realpath $1); mixwav=$(realpath $2); out=$(realpath -m $3)
python3 - "$cfg" <<'PY'
import json, sys
S='/tmp/claude-0/-home-user-ElevenLAbs-ExotelBridge/cc2ef4c0-dbd3-5003-87b4-c73f8e7b585e/scratchpad'
c = json.load(open(sys.argv[1])); c.pop('only_frames', None)
c['back_dir'] = S+'/work/ov_back'; c['front_dir'] = S+'/work/ov_front'; c['out'] = S+'/work/video_noaudio.mp4'
c['src'] = S+'/src/input.mp4'; c['alpha'] = S+'/work/alpha.mkv'; c['track'] = S+'/work/track.json'
json.dump(c, open(S+'/work/render_cfg.json', 'w'))
PY
cd $S && python3 -I scripts/composite2.py work/render_cfg.json
ffmpeg -v error -y -i work/video_noaudio.mp4 -i $mixwav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart $out
echo "RENDER DONE $out"
