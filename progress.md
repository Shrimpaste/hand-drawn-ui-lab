# Progress

- Started browser inspection and public client-source inventory.
- Read computer-use and planning-with-files skills.
- Original scene successfully observed; public client script identified.
- Saved original assets, resolved motion dependency closure with Acorn and eslint-scope, and verified one extracted puppet.
- Implemented local scene and verified click selection, free movement and undo in the browser. Fixed entrance API adapter and full viewport paper coverage.
- Added reusable Character, continuousTravel and drawCharacter API; 15 regression tests passed. Desktop drag/undo/sleep/wake/gag confirmed in the live browser.
- Final verification: 15 tests pass; syntax checks pass. Desktop and 390×844 narrow-screen click/keyboard checks pass; no narrow-screen horizontal overflow.
- Desktop final sample: ~240 RAF fps, 1.155 ms average frame submission/update, 1.4 ms p95. Resource timing showed no external runtime resources.
- Sleep state changed [w-pawn] → [] on wake; browser controls are disabled until initialization completes.
- Saved final desktop/mobile screenshots and research/validation.json; restored viewport override, closed the reference tab, and left the local preview visible and marked as a deliverable.
- Completed README, research/analysis.md and reusable src/character.js API. Server process 41932 serves 127.0.0.1:5184.

## 2026-10-03 detail and reuse pass
- User prioritizes paper sway, initial stroke drawing, illustrated options with writing/erasing labels and stronger hover/travel feedback. Danger/capture reactions remain outside this pass.
- Continuing the existing local playground and skill workflow; inspecting the original source and live scene before adapting reusable components.
- Implemented src/ink.js, paper-motion.js, illustrated-control.js and feedback.js. Atlas now loads red-channel time maps and reveals bounded display-resolution rasters; no per-frame full-size image copies.
- Main scene uses matching inverse paper transform for picking, opening choreography and illustrated options. Added components.html as a game-independent reuse gallery.
- First live check has no new console errors; idle frame update/draw stays ~1.12ms. Fixed icon sizing to honor the cast atlas global pixels-per-unit value.
- Captured opening at 0.8/2.6/3.4/4.85s: actual borders, grid, hatching and character parts progressively draw. Peak sampled p95 update/draw submission 4ms at 1280×800, then ~1.9ms after completion.
- Hover label sampled mid-write at progress .445 and erased to 0 after leaving. Fixed pointer-created focus retaining the tooltip; keyboard focus-visible remains supported.
- Browser verified paper affine sway, selection/move e4, undo g2 and king drag to d4 with correct inverse hit testing. AudioContext reached running; impact/sound/particle counts advanced.
- README and research/design-language.md now describe the reusable APIs, asset authoring format, design rules and current simplifications.
- Final 19 tests and syntax checks pass. Verified desktop and 390×844 main UI, gallery narrow layout without horizontal overflow, keyboard focus writing, reduced reset/full-display behavior, and reduced-off preserving a completed opening.
- Final browser logs: zero new errors; all runtime resources localhost. Default DPR 1.5 final snapshot: mean update/submission 1.94ms, p95 2.6ms at backing store 1920×1200.
- Saved research/detail-validation.json, detail-opening-validation.json, detail-final.png, detail-mobile.png and components.png. Cleared temporary device metrics and viewport override; closed temporary research/gallery tabs, kept main local preview visible and marked deliverable.

## 2026-10-03 original web art phase
- Initialized main; baseline 19cf5a1, tag baseline/ballpoint-lab, 19 tests pass. Dependencies/logs/raw public bundle ignored. Uses existing Git author configuration.
- Audited authored modules, extraction tool, tests, styles, asset/research inventory and vendor core pipeline. REPO_MAP.md records provenance, coupling and usable creative relationships.
- Chose original Gallery, Living Notebook and six-material Motion Studies as required three creations; new artwork will be authored Canvas paths, without reference sprites. Retain old routes and vendor module.
- Three original scenes implemented: Gallery with reversible handwritten annotation and inertia; editable/persistent Notebook with check/cross-out/erase/rename/add/undo/reorder; material motion with separate paper/leaf/bell/stone/lamp/creature grammar and semantic Foley.
- Added authored sketch, lettering, spring/action, residue/trail and audio tools. Shared host is limited to canvas/DOM input/resize/lifecycle. Gallery's first live view renders correctly with no console errors; artwork is original, without atlas requests.
- Original live re-observation required mouseMoved before press because its input uses pointer awareness; confirmed c2-c4 movement shows a trail behind the subject and destination outline during travel. Treat this as narrative evidence, not a timing prescription.
- 25 tests pass, including irregular/repeated inertia, semantic beat crossings, distinct material trajectories, independently decaying travel marks, bounded residues, notebook mutation/undo/persistence and stroke-attached imperfections.
- Fixed task undo overwriting a separately edited note; updated dynamic accessible labels and expanded mobile notebook spacing. Generic InkTransition/PaperMotion now live in primitives with backward-compatible src exports.
- Reference micro-feedback now uses passed-point birth times for trails, a brief ground impact ring below the actor, and softer semantic Foley with pitch/gain variation and distinct erase filtering. Vendor rig/animator source remains unchanged.
- Reference browser is newly loading; previous browser tabs/server process no longer exist. Restart loopback server after adding dot-file protection.
