# Findings

- Reference: https://ballpoint-gambit.vercel.app/ (accessed 2026-10-03, Asia/Hong_Kong).
- Browser accessibility exposes one image/canvas with keyboard controls: arrows/Enter, U undo, N new game, M mute.
- First screenshot captured the cream paper background before initialized drawing.
- Workspace is empty; Node/npm/rg are available.
- Reference renders its entire scene in one Canvas 2D surface (1920×1080 backing store, 1280×720 CSS; DPR 1.5).
- Public script observed in DOM: /assets/index-BF7G8tOs.js. No stylesheet/font links observed.
- Initialized screenshot: folded paper/grain, asymmetric brown pen grid, green diagonal hatching, red/yellow versus indigo characters, edge doodles, handwritten labels.
- HTTP command-line request received Vercel Security Checkpoint. Do not bypass; inspect code already loaded in the normal working browser via supported debugger instead.
- Saved the already loaded public deployment JS via Debugger.getScriptSource (script 13); 1,346,667 characters, no source map exposed. Original screenshot saved to research/reference.jpg.
- Correction: a single HTML canvas does NOT imply Canvas 2D. Client startup requires WebGL2; loaded Three.js reports revision 186.
- Reference architecture: separate flat/world/piece/text instance batches, RGBA sprite pages and RGB time-map pages; character rigs attach eyes/arms/feet/props to body anchors. Pose sampling defaults to 12 Hz, stroke boil to 8 Hz, but the frame loop and secondary springs run continuously.
- Loaded assets: 33 JSON and 32 images, all saved locally. No source fonts or image-generation required.
- Extracted actual top-level binding dependency closure for Puppet and six animator families, excluding game/session bootstrap. Source module successfully imports in Node and outputs 12 pawn sprite instances.
- Local implementation adapts original rig instances to Canvas 2D, rather than bundling Three/WebGL. Static paper/grid layers are cached; character transforms and secondary springs update per RAF.
- Travel channels are sampled continuously while body pose changes retain 12 Hz timing, avoiding visible position jumps during unrestricted long moves.
- Local first working measurements on the user's in-app browser: approximately 240 RAF fps, mean draw ~0.98 ms, p95 draw ~1.3 ms at 1280×720 / DPR 1.5. This is observed on this device, not a cross-device guarantee.

## Detail pass evidence
- Original camera parallax: x=0.07/y=0.045 world units, exponential smoothing tau=0.35 seconds; reduced motion suppresses it.
- Opening schedule: board 0.3–3.5s, coordinates 1.4–2.3s, characters begin 1.9s with rank/column staggering, status 3.4–4.2s; interactive around 3.6s.
- Original tooltip: write 0.3s, erase 0.18s, minimum hold 0.12s; actual atlas time maps drive the strokes.
- Local effects adapter discarded `dust` because it looked for a nonexistent dust atlas entry. Original has procedural dust plus sprite puff, and sound events alongside impact events.
- Opened separate component examples with no board/game state. Original sun disc is part of static-sky while its face is an independent sprite; the example composes both.
- Tooltip mouse click/leave and keyboard focus use distinct visibility rules. Desktop click/undo/drag remain aligned during paper sway; new audio context runs after gesture.
- Browser viewport capability affected the currently active component tab; direct metrics override on inactive main changed layout but distorted the capture, and was cleared. Responsive main testing will use the isolated main tab and normal viewport capability.
