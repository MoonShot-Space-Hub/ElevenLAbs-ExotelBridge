#!/bin/bash
# usage: qa_sheets.sh <video.mp4> <outdir>   -> 4 fps timestamped contact sheets (12 frames each) + full-res keyframes every 1 s
set -e
v=$1; o=$2; rm -rf $o; mkdir -p $o/sheets $o/full
ffmpeg -v error -i $v -vf "fps=4,scale=360:-1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.75,tile=6x2" $o/sheets/sheet_%02d.jpg
ffmpeg -v error -i $v -vf "fps=1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=10:y=10:fontsize=34:fontcolor=yellow:box=1:boxcolor=black@0.75" -q:v 3 $o/full/full_%02d.jpg
ls $o/sheets | wc -l; ls $o/full | wc -l
