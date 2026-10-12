// Example from "What Are We Asking For?" (see docs/5-render-and-share.md). Uses ClaudeAnimationBase's API and that
// project's world file (workshop, cogs, scaleBot, human, tierIcon). Adapt, don't drop in.

// wa_poster.js: the title card / thumbnail for "What Are We Asking For?" (wawaf.html?loop=wa_poster). The film opens on
// a near-black frame, and Slack and most players thumbnail the first frame, so the encode swaps this card in for frame 0.
// Render: node render.mjs --page=wawaf.html --loop=wa_poster --stills=1 --out=out/wa_poster
LOOPS.wa_poster = t => {
  workshop(t, { mood: 'golden', floorY: 830, winX: -999, tubeX: -999, lampX: -999 });
  const fy = 830, F = px => `800 ${px}px "WA Shantell", "Shantell Sans", "Comic Sans MS", sans-serif`;
  // title on a painted ink banner
  boilSeed('poster banner');
  paint([[170, 60], [960, 48], [1750, 60], [1780, 150], [1750, 240], [960, 252], [170, 240], [140, 150]],
    { wash: PAL.ink, washOp: 235, fill: WA.lm, fillOp: 60, tex: .7, border: 0, ink: null });
  letter('What Are We Asking For?', 960, 150, 104, "#FFD45E", { font: F(104), screen: true, stroke: PAL.ink });
  // the cast, one per tier, each over its tier icon
  const xs = [280, 730, 1210, 1645];
  cogs(t, xs[0], fy, 1.05, { eyes: 'happy', spin: 1, display: '4.20', lamp: 1 });
  scaleBot(t, xs[1], fy, .95, { tilt: .35, needle: .92, eyes: 'open',
    panL: (x, y) => envelope(t, x, y - 40, .45, { key: 'p' }), panR: (x, y) => coin(x, y - 22, 22) });
  clawd(xs[2], fy, 30, { ...feel('happy', t), view: 'front' });
  human(t, xs[3], fy, .95, { aR: .4, bR: 1.4, hR: 'thumb', eyes: 'happy', mouth: 'grin' });
  const names = ['code', 'decision model', 'language model', 'human'];
  for (const [i, k] of TIERS.entries()) {
    tierIcon(k, xs[i], fy + 72, 46);
    letter(names[i], xs[i], fy + 160, 44, PAL.cream, { font: F(44), stroke: TIER[k].dk });
  }
};
LOOPS.wa_poster.len = 4;
// The same card with a painted play button in the gap over the cast, for posting as a clickable image.
LOOPS.wa_poster_play = t => {
  LOOPS.wa_poster(t);
  const x = 985, y = 390, r = 105;
  glow(x, y, r * 2.4, '#FFF1C8', .6);
  boilSeed('poster play');
  paint(ellPts(x, y, r, r, 30), { wash: WA.sale, fill: '#B8382F', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.4 });
  paint([[x - r * .32, y - r * .5], [x + r * .55, y], [x - r * .32, y + r * .5]], { wash: PAL.cream, ink: PAL.ink, sw: .8 });
};
LOOPS.wa_poster_play.len = 4;
