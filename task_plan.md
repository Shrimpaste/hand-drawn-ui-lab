# Hand-drawn interaction study

Goal: Inspect Ballpoint Gambit's public client UI and build a locally runnable minimal reproduction of its drawing and fluid interaction, without chess rules.

## Phases
1. Inspect public page, client assets and motion behavior — complete.
2. Extract a small drawing/motion API and implement a local playground — complete.
3. Verify interactions, responsive layout and frame behavior in the browser — complete.
4. Deliver runnable source, observed architecture and use instructions — complete.
5. Inspect paper parallax, stroke reveal, tooltip handwriting and feedback — complete.
6. Implement reusable paper, draw/erase, illustrated controls and feedback modules — complete.
7. Verify revised interaction and document reuse for other projects — complete.
8. Initialize local Git, verify and tag the reference baseline — complete (`19cf5a1`, `baseline/ballpoint-lab`).
9. Audit every authored module and map reference/general/scene coupling — complete.
10. Build original Gallery, Living Notebook and material Motion Studies, allowing scene-specific code — complete.
11. Extract only tools exercised by the demos; improve reference micro-feedback — complete (original move/undo and component collect/undo regression verified).
12. Review actual repeated interaction, desktop/narrow layout, audio and reduced motion — complete.
13. Deliver creative notes, primitive guide, demo evaluations and a verified Git checkpoint — complete (`baseline/original-studies`, 25 tests; desktop/narrow screenshots and browser evidence saved).

## Original web art phase
The attached brief defines a creator's laboratory, retaining the original specimen and its provenance. New artwork must use locally authored drawing code and no reference sprites. Keep existing reference paths stable; organize new work under `primitives/` and `demos/`, with `/lab.html` as the new entry. Prefer adaptable relationships (anticipation/action/residue/quiet) over universal motion presets. Stage commits must remain reviewable and local.

## Decisions
- Use the existing empty workspace; no repository instructions found.
- Prefer a small dependency-free Canvas application where the reference supports it.
- Record evidence separately from assumptions. Keep reference attribution.

## Scene rebuild — user correction, 2026-10-03

The previous original demos are a directional failure. Preserve their Git history but rebuild Gallery and Material as playable scenes. Visual quality, real lettering, bounded line boil and action-matched sound must be reviewed independently before whole-scene delivery.

14. Document failure and scene/interaction sketches — complete (FAILURE_ANALYSIS.md, SCENE_PLAN.md).
15. Re-observe reference; develop dense original art, controlled contour boil, authored handwriting and Foley locally — complete (enlarged drawing bench reviewed).
16. Build Gallery with walking guide, exhibition space and close observation — complete (three interior picture interactions added).
17. Build Material theatre with spatial composition and connected object responses — complete.
18. Review enlarged artwork, full scenes, repeated interaction, keyboard/narrow screen and sound — complete (32 tests, foreground 10-cycle Gallery, repeated material input, mute/ink, desktop/narrow and reduced mode).
19. Deliver handwriting/micro-life/audio notes and commit reviewed scene checkpoint — complete (`baseline/playable-scenes`; six required records, screenshots, scene-validation.json and Foley audition).

## Errors
- Documentation patch used an incorrect heading anchor in PRIMITIVES.md; rejected before writes. Read the real headings and applied exact updates.
- A later formatted table spacing anchor also failed; no writes. Applied source changes separately and literal documentation text replacement.
- Browser repetition initially failed to settle because the local tab was background-throttled while reference remained open. Closed the completed reference tab and brought the local tab to front; a 700ms sample then advanced scene time by 698ms. Re-run affected browser checks in foreground.
- New Foley buffer test found NaN at the very last paper/eraser sample because a fractional power saw a tiny negative sine after floating-point rounding. Clamp the envelope to nonnegative and taper the final 4ms.
- Scene rebuild patch attempted delete/add on the same HTML path; rejected before any write. Reissued additions once and replaced HTML using literal file content.
- Initial screenshot caught a blank loading canvas; reobserve once initialized.
- Command-line HTTP request hit Vercel checkpoint; using already loaded browser debugger resources.

- Default port 5173 is already occupied; use dedicated local port 5184.
- Entrance clip expects a numeric delay, not a puppet; corrected extracted API adapter after browser diagnostic.

- In-app browser does not support Input.dispatchTouchEvent; verified narrow-screen mouse and keyboard interaction, without claiming touch-device testing.
- Detail pass attempted a nonexistent board.json path; corrected inventory to board.atlas.json.
- A single CDP await spanning the full 4.8-second opening exceeded the backend command timeout; used short stage samples and immediate state reads instead.
- Accessibility exposed aria-pressed as a checkbox while the DOM role stayed button; used the known #sound selector after checking the latest tree.
- Turning reduced motion off after a reduced-mode reset restarted the opening unintentionally; added DrawingSequence.setReduced and a regression assertion to preserve completed openings.


- README replacement patch rejected delete/add of the same path; preserved old README under reference and rewrote root file once using a literal here-string.

## Spatial and character refinement — user correction, 2026-10-03
20. Compare reference character shapes, continuous poses, state clips and stroke reveal — complete (12 rigs, eight source action families, pipeline/idle/spring/ant coordinator audit).
21. Replace guide art and locomotion; soften material-colored contours and improve object finish — complete (new drawing/anchors, actual Puppet and pawn reactions, continuous distance gait).
22. Rebuild Gallery as a depth-sorted, traversable exhibition courtyard; improve attic perspective — complete (shared ground projection, roof/plinth/wall planes, furniture and depth sorting).
23. Add genuine line/fill scene draw-on and sleep/nervous/ant-carry demonstrations — complete (baked Canvas stroke-time maps, automatic idle sleep/wake, original twelve-character states).
24. Visually review desktop/mobile, uninterrupted interactions, original component states; commit local checkpoint — complete (37 tests, screenshots/refined-validation.json; baseline/spatial-characters).
- 20 source audit complete: twelve rigs/eight action families sampled; source scheduler, layering, idle, attachments, springs and ant coordinator examined. User steering incorporated into GuideMotion actual engine reuse.
