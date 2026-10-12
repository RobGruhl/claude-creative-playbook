# Lessons (things that bit us)

## Process

- **Storyboard, then a shared world file with test loops, then build.** Every problem caught in a test loop (a hand gesture that reads wrong, eyes too thick to read) would otherwise have been fixed six times, once per builder.
- **Show the plan before building.** On *What Are We Asking For?* Claude went straight from storyboard to build. It worked out, but a two-minute look at the storyboard is the cheapest moment to redirect a 4-minute film. Ask for it: "show me the storyboard before you build".
- **Key events to the music's real structure.** Use bars when the tempo is steady and sung words when it isn't. A cut 0.25 s late reads as a mistake.
- **Double-check times read from lyric files.** 1:45.08 is 105.08 s, not 101.08 s. A builder caught that one in a storyboard.
- **Lyric files list what's written, not what's sung.** Our SRT doubled the chorus's first line, but the singer sings it once.

## Engine (p5.js + p5.brush)

- **p5 owns a lot of global names.** A world helper called `cross`, `check`, `scroll` or `shadow` fails with "Cannot redefine property" or quietly replaces a browser method. Prefix or rename them (`crossMark`, `tick`, `proseScroll`, `floorShadow`).
- **Lettering sits on top of later paint.** Anything drawn with `letter()` lands above wipes and irises unless you call `flushLetters()` first.
- **Two-point curved lines draw nothing.** A p5.brush spline needs a midpoint, or the strokes simply vanish.
- **Raised arms vanish in a front view** above about 1.2 rad, because front-view arms draw behind the body. Use 0.8–1.1 for waves.
- **Several renders at once can time out** page navigation. Retries succeed.

## Shell and ffmpeg

- **In zsh, `$h[c]` is an array subscript.** Inside an ffmpeg filter string, write `${h}[c]`, or `scale=-2:$h[c]` turns into `scale=-2:` and fails with "Invalid size".
- **Don't use `-shortest` with an attached cover image.** The cover is a one-frame stream, so the output can be cut to one frame.
- **`--encode` muxes only the audio you pass it** with `--audio=`.

## Sharing

- **The first frame is the thumbnail.** If your film fades up from black, put a title card on frame 0 (see [5-render-and-share.md](5-render-and-share.md)).
- **Chat apps have upload limits.** A 4½-minute video is about 31 MB at 540p and about 60 MB at 720p.
