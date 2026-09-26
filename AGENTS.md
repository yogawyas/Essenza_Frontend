# Essenza Lab — React Native B2B

User: Yoga. Scope: a laboratory demonstrator for the odor labels of one molecule.

- Never invent or guess Yoga's intended design, asset, screen, behavior, or
  project state. Inspect the exact referenced branch, file, screenshot, and
  existing asset first. If more than one interpretation remains and it would
  change the result, ask Yoga before editing.
- Reuse the exact project asset or design Yoga identifies. Do not redraw,
  replace, or "improve" it from memory unless Yoga explicitly requests that.
- Clearly separate verified facts, inferences, proposals, and unknowns. Never
  claim a test, device run, push, or visual check without direct evidence.

- `Yoga` carries this B2B app. Do not push this work to `main` unless Yoga
  explicitly changes that decision. Never change or push to
  `codex/essenza-b2c`; it belongs to a separate B2C project.
- The app uses React Native with JavaScript (`.js` for screens, logic, and tests).
  Yoga explicitly requested JavaScript. Do not introduce TypeScript or TSX.
  `App.js` is the entry bridge. Do not substitute a website.
- Current delivery is an offline demo. All aroma scores are explicitly labeled
  dummy, including saved history. No backend/API/model is called.
- The demo accepts only the fixed example SMILES. Basic input checks are not
  RDKit validation. Do not fabricate predictions for other inputs.
- `src/services/demoPrediction.js` is the replaceable service boundary. Its
  response shape is a UI contract, not a finalized backend API contract.
- Research model candidate: RF + ML-SMOTE, 143 target labels, 2048 Morgan bits
  plus MolWt and MolLogP. The demo fixture ID is not the research model ID.
- Do not add mixture prediction, shopping, dupe matching, fragrance wardrobes,
  public communities, or claims of safety, longevity, or calibrated certainty.
- The B2B app uses application ID `com.essenza.lab` and storage namespace
  `@essenza/b2b-lab-v1`. Never migrate or clear B2C data.
- Use the root ESSENZA_TRACKER.md when available. Keep frontend completion
  separate from the pending backend integration. Existing project deadlines
  stay in force unless Yoga explicitly revises them.
- Verify changes with lint, relevant tests, and Android when available.
  Never claim a device or iOS check that was not performed.
