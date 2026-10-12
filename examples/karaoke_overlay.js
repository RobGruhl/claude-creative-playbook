// Example from "What Are We Asking For?" (see docs/4-karaoke.md). Written against ClaudeAnimationBase's API (paint, clawd,
// letter, boilSeed, …) and that project's world file (WA_LY word times, wq(), TIER, TIERS, tierIcon, SEC). Adapt, don't drop in.

// wa_overlay.js: drawn over every shot of "What Are We Asking For?", after the shot and before the grain.
//   1. The tier ladder (right edge): a painted ladder with the four tiers as rungs, code at the bottom and the human at
//      the top. The tier the song is about lights up, so the viewer always knows where on the cascade we are.
//   2. Karaoke (on unless the URL has ?clean): a painted ink banner at the bottom; each word fills with gold as it's sung
//      (word times from whisper, wa_lyrics.js), and a tiny Clawd hops from word to word.
// Keep important action out of the bottom 130 px (the banner) and x > 1760, y 150–700 (the ladder).
(() => {
  const KARAOKE = !/clean/.test(location.search);
  const FONT = '800 50px "WA Shantell", "Shantell Sans", "Comic Sans MS", sans-serif';
  const face = new FontFace('WA Shantell', 'url(assets/fonts/ShantellSans.ttf)', { weight: '300 800' });
  document.fonts.add(face);
  const ready = face.load().catch(() => {});
  // no frame may render in a fallback font: hold the render entry points until the font is in
  for (const k of ['renderAt', 'renderSheet']) { const f = window[k]; window[k] = async (...a) => { await ready; return f(...a); }; }

  // ---------- the tier ladder ----------
  // [t0, t1, kinds lit] spans; each fades in and out over .25 s. Choruses light each tier on the word that names its
  // output (number → code, choice → dm, open door → lm), then all of them on "Match the tool".
  const SP = [[9.6, 25.9, 'code'], [26.1, 64.6, 'dm'], [92.2, 119.2, 'lm'], [146.2, 170.0, 'human'],
    [170.58, 174.0, 'code dm lm human'], [174.0, 183.9, 'code'], [183.9, 189.3, 'dm'], [189.3, 193.1, 'lm'], [193.1, 200.3, 'human']];
  // "Handing off isn't falling down": a sweep up the ladder; "bring better rules … back around": a sweep back down
  const up = wq(42, 'handing'), dn = wq(43, 'bring');
  TIERS.forEach((k, i) => SP.push([up + i * .55, up + i * .55 + 1.1, k]));
  SP.push([up + 2.2, dn, 'human']);
  TIERS.slice().reverse().forEach((k, i) => SP.push([dn + i * .9, dn + i * .9 + 1.4, k]));
  SP.push([dn + 2.7, SEC.fc, 'code']);
  for (const c of ['c1', 'c2', 'fc']) {
    const i = CH0[c] + 1, m = wq(i + 1, 'match'), end = lineEnd(CH0[c] + 5) + 1.2;
    SP.push([wq(i, 'number'), m, 'code'], [wq(i, 'choice'), m, 'dm'], [wq(i, 'door'), m, 'lm'], [m, end, c === 'fc' ? 'code dm lm human' : 'code dm lm']);
  }
  SP.push([SEC.out + .5, 262, 'code dm lm human']);
  const VIS = [[9.3, 64.7], [65.2, 91.6], [92.1, 119.3], [119.6, 145.7], [146.1, 213.8], [214.1, 240.3], [240.8, 262.5]];
  const fade = (t, a, b, f = .25) => clamp(Math.min((t - a) / f, (b - t) / f));
  function ladder(t) {
    const vis = Math.max(0, ...VIS.map(([a, b]) => fade(t, a, b, .4)));
    if (vis <= 0) return;
    const x = 1848, y0 = 640, gap = 122, slide = (1 - easeOut(vis)) * 160;
    boilSeed('ladder rails');
    for (const dx of [-30, 30]) inkLine([[x + dx + slide, y0 + 60], [x + dx + slide + 1, y0 - 1.5 * gap], [x + dx + slide, y0 - 3 * gap - 60]], 2.2, WA.wainsDk, 'ink', .2);
    TIERS.forEach((k, i) => {
      const lit = Math.max(0, ...SP.filter(s => s[2].split(' ').includes(k)).map(([a, b]) => fade(t, a, b)));
      const pop = Math.max(0, ...SP.filter(s => s[2].split(' ').includes(k) && t >= s[0]).map(([a]) => spring(t, a, 7, 16)));
      const cy = y0 - i * gap, r = 38 * (1 + .22 * lit + .12 * pop);
      if (lit > .05) glow(x + slide, cy, r * 2.6, mixCol(TIER[k].lt, '#FFFFFF', .3), .5 * lit);
      tierIcon(k, x + slide, cy, r, { lit: .25 + .75 * lit });
    });
  }

  // ---------- karaoke ----------
  // A line shows from just before its first word until just before the next line comes in.
  // Back-to-back lines hand the banner straight over (no shrink and regrow in between); after a real gap it shrinks out.
  const joined = i => i >= 0 && i + 1 < WA_LY.length && WA_LY[i][2] + 1.2 >= WA_LY[i + 1][1] - .45;
  const lineAt = t => {
    for (let i = 0; i < WA_LY.length; i++) {
      const L = WA_LY[i], next = WA_LY[i + 1], a = L[1] - .45, b = joined(i) ? next[1] - .45 : L[2] + (next ? 1.2 : 2.5);
      if (t >= a && t < b) return { L, a, b, inK: joined(i - 1) ? 1 : 0, outK: joined(i) ? 1 : 0 };
    }
    return null;
  };
  const tierOfLine = L => ({ v1: 'code', v2: 'dm', pre: 'dm', v3: 'lm', br: 'human' })[L[0]] ||
    (L[0] === 'fv' ? ['code', 'code', 'dm', 'lm', 'human', 'human', 'lm', 'code'][WA_LY.indexOf(L) - 36] : null);
  function layout(L) {
    const c = outX; c.font = FONT;
    const sp = c.measureText(' ').width, ws = L[4].map(w => ({ w: w[2], t0: w[0], t1: w[1], wd: c.measureText(w[2]).width }));
    const total = ws.reduce((p, q) => p + q.wd, 0) + sp * (ws.length - 1);
    let x = 960 - total / 2; for (const w of ws) { w.x = x; x += w.wd + sp; }
    return { ws, total };
  }
  let KAR = null;
  function banner(t) {
    KAR = null;
    const cur = lineAt(t); if (!cur) return;
    const { L, a, b, inK, outK } = cur, grow = (inK ? 1 : easeOut((t - a) / .22)) * (outK ? 1 : 1 - ease((t - (b - .15)) / .15));
    if (grow < .02) return;
    const { ws, total } = layout(L), tier = tierOfLine(L), fillCol = tier ? TIER[tier].col : PAL.clay;
    boilSeed('karaoke banner');
    const w = (total + 120) * grow, x0 = 960 - w / 2, y0 = 972;
    const pts = [[x0 + jit(6), y0 + jit(3)], [x0 + w / 2, y0 - 4 + jit(3)], [x0 + w + jit(6), y0 + jit(3)], [x0 + w + 16 + jit(6), y0 + 42],
                 [x0 + w + jit(6), y0 + 84 + jit(3)], [x0 + w / 2, y0 + 88 + jit(3)], [x0 + jit(6), y0 + 84 + jit(3)], [x0 - 16 + jit(6), y0 + 42]];
    paint(pts, { wash: PAL.ink, washOp: 225, fill: fillCol, fillOp: 70, tex: .7, border: .4, ink: null });
    KAR = { ws, grow };
    // the hopping Clawd: lands on each word as it starts, hops to the next
    if (grow > .85) {
      let i = 0; while (i + 1 < ws.length && t >= ws[i + 1].t0) i++;
      const before = t < ws[0].t0, cx = w0 => w0.x + w0.wd / 2;
      let x, hop = 0, land = 0;
      if (before) { x = ws[0].x - 40; hop = Math.abs(Math.sin((t - a) * 9)) * 6; }
      else if (i + 1 < ws.length) {
        const A = ws[i], B = ws[i + 1], d = B.t0 - A.t0, k = clamp((t - A.t0) / Math.min(d, .5)), q = clamp((t - A.t0 - Math.max(0, d - .5)) / Math.min(d, .5));
        // sit on word A, then hop to B so that it lands as B starts
        x = lerp(cx(A), cx(B), ease(q)); hop = Math.sin(Math.PI * q) * Math.min(34, 16 + (cx(B) - cx(A)) * .2); land = k < .25 ? 1 - k * 4 : 0;
      } else { x = cx(ws[i]); land = clamp(1 - (t - ws[i].t0) * 4); }
      clawd(x, y0 + 2 - hop, 4.2, { ...feel(before ? 'hopeful' : 'happy', t), sq: land * .25 - (hop > 4 ? .12 : 0), dy: 0, noShadow: true, boilKey: 'karaoke clawd', view: 'front' });
    }
  }
  function words(c) {
    if (!KAR || KAR.grow < .9) return;
    const t = T, y = 1018;
    c.font = FONT; c.textBaseline = 'middle'; c.textAlign = 'left';
    for (const w of KAR.ws) {
      const f = clamp((t - w.t0) / Math.max(.12, w.t1 - w.t0));
      c.fillStyle = PAL.cream; c.fillText(w.w, w.x, y);
      if (f > 0) { c.save(); c.beginPath(); c.rect(w.x - 2, y - 40, w.wd * f + 2, 80); c.clip(); c.fillStyle = '#FFD45E'; c.fillText(w.w, w.x, y); c.restore(); }
    }
  }

  // hook in: ladder and banner are painted after each frame's shot (screen space); the words go on in the compositor
  const dw = drawWorld;
  drawWorld = t => { dw(t); if (!window.LOOP) { ladder(t); if (KARAOKE) banner(t); flushBrush(); } };
  composite = t => {
    const c = outX;
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.drawImage(drawingContext.canvas, 0, 0, W, H);
    drawLetters(c); if (KARAOKE && !window.LOOP) words(c);
    c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0);
    c.globalCompositeOperation = 'source-over';
  };
})();
