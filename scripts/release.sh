#!/bin/zsh
# release.sh: encode a rendered frame sequence into a shareable MP4 that opens on a title card.
#
#   release.sh FRAMES_PATTERN AUDIO CARD.png "Title" OUT.mp4 [HEIGHT=1080] [CRF=17] [AUDIO_KBPS=192]
#   release.sh 'out/frames/f%05d.jpg' song.m4a card.png "My Song" "out/My Song.mp4"
#   release.sh 'out/frames/f%05d.jpg' song.m4a card.png "My Song" "out/My Song (phone).mp4" 540 26 96   # fits chat limits
#
# Slack, Finder and most players use the first frame as the thumbnail. A film that fades up from black gets a black
# thumbnail, so: the card covers the first second, dissolves into the film over the next, and is attached as cover art.
# The audio is untouched and the timing doesn't move.
set -e
frames=$1 audio=$2 card=$3 title=$4 out=$5 h=${6:-1080} crf=${7:-17} ab=${8:-192}
ffmpeg -y -loglevel error -stats -framerate 24 -i "$frames" -loop 1 -t 2 -framerate 24 -i "$card" -i "$audio" -i "$card" \
  -filter_complex "[1:v]format=rgba,fade=t=out:st=1:d=1:alpha=1[p];[0:v][p]overlay=eof_action=pass,scale=-2:${h},format=yuv420p[v];[3:v]scale=-2:${h}[c]" \
  -map "[v]" -map 2:a -map "[c]" -c:v:0 libx264 -preset slow -crf "$crf" -c:v:1 png -disposition:v:1 attached_pic \
  -c:a aac -b:a "${ab}k" -metadata title="$title" -movflags +faststart "$out"
ls -la "$out"
