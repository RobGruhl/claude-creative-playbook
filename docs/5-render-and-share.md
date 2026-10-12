# 5. Render and share

## Render frames

The kit renders each frame in headless Chrome. Frames are pure functions of time, so workers can take them in any order, and the job can be resumed:

```bash
node render.mjs --page=wawaf.html --frames --workers=6 --frames-dir=out/frames_wawaf
```

On an M4 Pro, frames took 50–370 ms each, and the 6,461 frames of a 4:29 video took about 20 minutes. `--page` (render a page other than `studio.html`), `--query` (extra URL switches such as `clean`) and `--frames-dir` are small additions we made to the kit's `render.mjs`.

Without a GPU, p5.brush's watercolour fills get slow. See the kit's README for `--soft-gl` and the headless Linux options.

## Encode for sharing

```bash
scripts/release.sh 'out/frames_wawaf/f%05d.jpg' song.m4a card.png \
  "What Are We Asking For? A sing-along guide to code, models and humans" "out/release/What Are We Asking For.mp4"
scripts/release.sh 'out/frames_wawaf/f%05d.jpg' song.m4a card.png \
  "What Are We Asking For? A sing-along guide to code, models and humans" "out/release/What Are We Asking For (phone).mp4" 540 26 96
```

| copy | settings | size for 4:29 |
|---|---|---|
| full | 1080p, CRF 17, AAC 192k | ~520 MB |
| phone / chat | 540p, CRF 26, AAC 96k | ~31 MB |

The 540p copy is the one to drop into Slack or send to a phone. 720p still came out at about 60 MB.

## Fix the black thumbnail

Slack (and Finder, and most players) uses the **first frame** as the video's thumbnail. Our film fades up from dark ink, so a pasted video showed as a black rectangle. The fix:

1. **Make a title card** in the film's own style, as an extra scene: the cast lined up over their tier icons under a painted title banner. It's a loop, so it renders like any other frame:

   ```bash
   node render.mjs --page=wawaf.html --loop=wa_poster --stills=1 --out=out/wa_poster
   ```

   See [examples/title_card.js](../examples/title_card.js).
2. **Open the film on it.** `release.sh` lays the card over the first second and dissolves it into the film over the next second. The audio and the timing are untouched.
3. **Attach it as cover art** (`-disposition:v:1 attached_pic`), for the players that use one.
4. **Make a clickable thumbnail.** A second loop (`wa_poster_play`) paints a play button onto the card. Post that image with a link to the video wherever an embedded player isn't available.

![The title card](../images/poster.jpg)

## Name it

The file name is the title people see in Slack. Use the hook plus what it teaches, for example *What Are We Asking For - a sing-along guide to code, models and humans.mp4*. Keep `?` and `/` out of file names, and put the exact title, punctuation included, in the `title` metadata.
