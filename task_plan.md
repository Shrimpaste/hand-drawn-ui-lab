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
11. Extract only tools exercised by the demos; improve reference micro-feedback — complete (awaiting live regression review).
12. Review actual repeated interaction, desktop/narrow layout, audio and reduced motion — in progress.
13. Deliver creative notes, primitive guide, demo evaluations and a verified Git checkpoint — pending.

## Original web art phase
The attached brief defines a creator's laboratory, retaining the original specimen and its provenance. New artwork must use locally authored drawing code and no reference sprites. Keep existing reference paths stable; organize new work under `primitives/` and `demos/`, with `/lab.html` as the new entry. Prefer adaptable relationships (anticipation/action/residue/quiet) over universal motion presets. Stage commits must remain reviewable and local.

## Decisions
- Use the existing empty workspace; no repository instructions found.
- Prefer a small dependency-free Canvas application where the reference supports it.
- Record evidence separately from assumptions. Keep reference attribution.

## Errors
- Initial screenshot caught a blank loading canvas; reobserve once initialized.
- Command-line HTTP request hit Vercel checkpoint; using already loaded browser debugger resources.

- Default port 5173 is already occupied; use dedicated local port 5184.
- Entrance clip expects a numeric delay, not a puppet; corrected extracted API adapter after browser diagnostic.

- In-app browser does not support Input.dispatchTouchEvent; verified narrow-screen mouse and keyboard interaction, without claiming touch-device testing.
- Detail pass attempted a nonexistent board.json path; corrected inventory to board.atlas.json.
- A single CDP await spanning the full 4.8-second opening exceeded the backend command timeout; used short stage samples and immediate state reads instead.
- Accessibility exposed aria-pressed as a checkbox while the DOM role stayed button; used the known #sound selector after checking the latest tree.
- Turning reduced motion off after a reduced-mode reset restarted the opening unintentionally; added DrawingSequence.setReduced and a regression assertion to preserve completed openings.

