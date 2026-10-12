#!/bin/zsh
# word_times.sh SONG OUTDIR: whisper word timestamps for a song (Apple Silicon; mlx-whisper installed with pipx).
#   pipx install mlx-whisper
# Writes OUTDIR/song16.json. Feed it to align_lyrics.py with the official lyrics.
set -e
song=$1 dir=${2:-.}; mkdir -p "$dir"
ffmpeg -y -loglevel error -i "$song" -ac 1 -ar 16000 "$dir/song16.wav"
mlx_whisper "$dir/song16.wav" --model mlx-community/whisper-large-v3-turbo --word-timestamps True \
  --output-format json --output-dir "$dir" --language en
# Re-check a stretch whisper skipped (common on held notes and quiet verses): transcribe just that slice, then add
# the slice's start time to its word times.
#   ffmpeg -ss 91 -t 30 -i "$dir/song16.wav" "$dir/slice.wav" && mlx_whisper "$dir/slice.wav" ...
