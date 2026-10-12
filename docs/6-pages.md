# 6. The page is the medium

Every video here is really a single web page: an HTML file that loads p5.js and the scene scripts and paints frame *t* when asked. That one decision makes everything else easy, and the same habits make good standalone pages and sites.

## One page per piece

Each song gets its own page and config (`wawaf.html`, `src/config_wawaf.js`) next to the kit's `studio.html`. Earlier projects keep working untouched, and the renderer takes `--page=` to choose which page to render. The page lists its scripts in order: config, then the engine, then lyrics, then the world file, then one file per section, then the overlay.

## URL switches instead of build flags

The page reads its query string, so you can preview, test and render variants of the same page without editing code:

| URL | does |
|---|---|
| `wawaf.html` | scrubbable preview with a time slider |
| `wawaf.html?t=65` | jump to 1:05 |
| `wawaf.html?loop=wa_cast` | play a test loop instead of the film (cast sheet, props, title card) |
| `wawaf.html?clean` | the film without the karaoke |
| `render.mjs --query=clean` | the renderer appends the same switches |

Claude can open any of these in Chrome and look, which is much faster than a full render.

## Rules that keep pages reliable

- **Pure functions of state.** A frame depends only on *t*, and a page view should depend only on its URL and data. Then anything can be rendered, tested or linked directly.
- **Nothing critical from the network.** On an earlier video, pages hung for 60 s and timed out because a Google Font sometimes never finished loading while several renders ran at once. Ship fonts as local files and wait on them explicitly.
- **Pin exact library versions** (or vendor them, as the kit does with `node_modules`) so a page that works today still works next year.
- **Design for the place it will be seen.** The video plays in a Slack thumbnail and on a phone, so we made a 540p copy and a title card. A page should likewise work at phone width without sideways scrolling.

## Sharing a page

For a one-off interactive page (an explainer, a dashboard, a scrubbable preview), ask Claude to build it as a single self-contained HTML file and publish it as a Claude artifact. That gives you a private link you can share, with nothing to deploy. For something that lives longer, put it in a repo and serve it with GitHub Pages.
