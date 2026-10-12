# 1. The song

## Write a song that can be animated

*What Are We Asking For?* teaches one idea: before you reach for a tool, ask what kind of answer you need. Each tier gets a verse: plain code for anything you can compute, a decision model to pick among choices you defined, a language model for open questions, and a human for stakes and values. The chorus is the question itself, and the final verse puts the tiers together. A few things made it easy to animate:

- **One concept per verse.** Each verse became one character's showcase, which also meant one builder agent per section later.
- **A chorus that is the core question.** It comes back three times, so it can carry a visual motif that grows each time. Ours is a shape-sorter toy: a number goes in the square hole, a choice in the triangle, an open door in the arch, and in the last chorus a heart.
- **Concrete nouns.** "Count the change and check the sum", "an inbox shouts 'last chance today!'", "join the threads" all turned straight into props: coins and receipts, shouting envelopes, red yarn on a corkboard.
- **Section tags.** Write lyrics with `[Verse 1]`, `[Chorus]`, `[Bridge]` headers. Suno uses them, and so do the scripts here.

Claude is good at the first draft of the lyrics if you hand it the source explanation and ask for that structure. Then sing it in your head and cut every line that doesn't scan.

## Generate the track

We used Suno. *What Are We Asking For?* is a voice-and-piano arrangement; an earlier song was a steady 136 BPM pop track. Both work, but they need different timing techniques (below). Download the M4A rather than an MP3: the renderer re-encodes the audio anyway, so converting first only adds a lossy pass.

## Read the song before drawing anything

### Probe it

```bash
ffprobe -hide_banner song.m4a
```

Our Suno downloads carried the lyrics twice: as a `lyrics` metadata tag and as a timed subtitle stream. Pull the subtitles out:

```bash
ffmpeg -i song.m4a -map 0:s:0 lyrics.srt
```

That gives the line-level timing for free. Check it against the audio, though. Our SRT listed "What are we asking for?" twice at the start of every chorus, but it is sung only once.

### Steady tempo: build a beat grid

If the song has a steady beat, measure it and key big moments to bars:

```bash
ffmpeg -i song.m4a -ac 1 -ar 22050 song.wav
uv run --with librosa python -c "import librosa; y, sr = librosa.load('song.wav'); print(librosa.beat.beat_track(y=y, sr=sr))"
```

Ask Claude for a per-bar energy map as well (RMS, a kick band below 150 Hz, hi-hats above 4 kHz, one row per bar). It shows where choruses peak, where a bridge drops out and where the final hits land, and so it tells you which bar each big visual event belongs on. Our pop track was a clean 136 BPM with the drums entering on the first lyric.

### Rubato: time to the words

The voice-and-piano song has no grid: librosa's beat fit drifted by ±0.25 s, which is a visibly late cut. So we keyed everything to *sung words* instead, using speech-to-text with word timestamps:

```bash
scripts/word_times.sh song.m4a work/          # 16 kHz mono WAV, then mlx-whisper large-v3-turbo with --word-timestamps
```

Whisper mishears lyrics, merges words and skips held notes, so don't use its text. Use its *times*, snapped onto the official lyrics:

```bash
python3 scripts/align_lyrics.py lyrics.txt work/song16.json lyrics.js --js LY --until 240
```

`lyrics.txt` is the lyrics as sung, with `[Section]` headers. The output gives every word a start and an end: `LY[i] = [section, start, end, line, [[t0, t1, word], …]]`. On our song, 358 of 359 words matched directly, and one ("trade-offs") was interpolated from its neighbours.

When whisper skips a stretch (it often does on quiet verses), cut that slice out with `ffmpeg -ss … -t …`, transcribe it on its own, and add the offset.

Scenes then look up the moment a word is sung by name. In the world file:

```js
// start of the first word in line i matching `word` (case and punctuation ignored)
function wq(i, word, n = 0) { … }
// line 35 is "And gives the go on the big moves": Clawd pulls the lever on "big", the rocket lifts off on "moves"
const T_PULL = wq(35, 'big') - .2, T_FIRE = wq(35, 'moves');
```

Every big event and every karaoke word landed on its sung word. That would not have happened with a beat grid on this song.
