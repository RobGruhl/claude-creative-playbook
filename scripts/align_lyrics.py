"""Give every word of a song's official lyrics a start and end time.

Whisper's word timestamps are good, but its words are not quite the lyrics: it mishears, merges and skips. This lines
up the official lyric text against whisper's words (difflib on normalised words), takes times from the matches, and
interpolates the few words it can't match from their neighbours.

    python3 align_lyrics.py lyrics.txt whisper.json out.json [--js NAME] [--until SECONDS]

lyrics.txt: the lyrics as sung, one line per line. "[Verse 1]"-style headers set the section of the lines below them
(the section name is lower-cased, e.g. "verse 1"). Blank lines are ignored. Write only what is actually sung: if the
generator's lyric file lists a line twice but the singer sings it once, delete one.

whisper.json: the output of `mlx_whisper --word-timestamps True --output-format json` (or openai-whisper's JSON).

out.json: [[section, start, end, line, [[t0, t1, word], ...]], ...]. With --js NAME it's written as a JS file instead
(`const NAME = [...]`), ready to load with a <script> tag. --until drops whisper words after that time (an outro the
model hallucinated words into, say).
"""
import argparse, difflib, json, re

ap = argparse.ArgumentParser()
ap.add_argument('lyrics'); ap.add_argument('whisper'); ap.add_argument('out')
ap.add_argument('--js'); ap.add_argument('--until', type=float, default=1e9)
a = ap.parse_args()

LY, sec = [], ''
for raw in open(a.lyrics, encoding='utf-8'):
    s = raw.strip()
    if not s: continue
    m = re.fullmatch(r'\[(.+)\]', s)
    if m: sec = m.group(1).lower(); continue
    LY.append((sec, s))

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
d = json.load(open(a.whisper, encoding='utf-8'))
ww = [w for s in d['segments'] for w in s.get('words', []) if w['start'] < a.until]
wn = [norm(w['word']) for w in ww]
lw = [(li, w) for li, (_, l) in enumerate(LY) for w in l.split()]
ln = [norm(w) for _, w in lw]

sm = difflib.SequenceMatcher(None, ln, wn, autojunk=False)
T: list = [None] * len(lw)
for i, j, n in sm.get_matching_blocks():
    for k in range(n): T[i + k] = (ww[j + k]['start'], ww[j + k]['end'])
# a run of misheard words the same length as the lyric run it replaces is almost always the same words
for op, i0, i1, j0, j1 in sm.get_opcodes():
    if op == 'replace' and i1 - i0 == j1 - j0:
        for k in range(i1 - i0): T[i0 + k] = (ww[j0 + k]['start'], ww[j0 + k]['end'])

miss = [i for i, x in enumerate(T) if x is None]
for i in miss:   # spread unmatched words evenly between their timed neighbours
    p = max((j for j in range(i) if T[j]), default=None)
    q = min((j for j in range(i + 1, len(T)) if T[j]), default=None)
    if p is None or q is None: continue
    gap = list(range(p + 1, q)); t0, t1 = T[p][1], T[q][0]; k = gap.index(i); step = (t1 - t0) / len(gap)
    T[i] = (t0 + step * k, t0 + step * (k + 1))
left = [lw[i][1] for i, x in enumerate(T) if x is None]
if left: raise SystemExit(f'no time for {left}: the lyrics start before or end after anything whisper heard')
print(f'{len(lw)} words, {len(miss)} interpolated:', [lw[i][1] for i in miss])

lines = []
for li, (sec, l) in enumerate(LY):
    idx = [i for i, (x, _) in enumerate(lw) if x == li]
    # a word ends when it ends, the next word starts, or 1.2 s later, whichever is first (whisper stretches held notes)
    words = [[round(T[i][0], 2), round(min(T[i][1], T[i + 1][0] if i + 1 < len(T) else 1e9, T[i][0] + 1.2), 2), lw[i][1]] for i in idx]
    lines.append([sec, words[0][0], words[-1][1], l, words])

with open(a.out, 'w', encoding='utf-8') as f:
    if a.js:
        f.write(f'// {a.js}[i] = [section, start, end, line, [[t0, t1, word], ...]] (seconds), from align_lyrics.py\nconst {a.js} = [\n')
        for L in lines: f.write('  ' + json.dumps(L, ensure_ascii=False) + ',\n')
        f.write('];\n')
    else:
        json.dump(lines, f, ensure_ascii=False, indent=1)
for L in lines: print(f'{L[1]:7.2f} {L[2]:7.2f}  {L[0]:10} {L[3]}')
