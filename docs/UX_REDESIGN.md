# Essenza — connected local experience

## Milestone delivered

P0 navigation, P1 Today ritual, and P2 mock Scent Studio. The next milestone is P3 Community demo. Real accounts, online social activity, weather, notifications, raw-note formulation, and production ML inference are not enabled.

### Navigation

- Four working tabs: Today, Discover, Studio, My Shelf.
- Each tab owns a native stack. Fragrance, scentlist, recipe, and journal detail screens remain inside that tab, so the tab bar stays visible.
- Profile, wear entry, scentlist editor, and Studio editor are root modal routes.
- Scentlists moved into Discover (public inspiration) and My Shelf (owned/saved lists); none were deleted.
- My Shelf sections: Parfum, Scentlists, Resep, Journal.
- UI status names: Punya = have, Wishlist = want, Pernah punya = had. Favorit remains independent.
- Shelf section and status chips share compact rows, verified on the physical device.

### Discover → Shelf

1. Open a fragrance and tap **Tambah ke My Shelf**.
2. Explicitly choose a status and format in the sheet; new items have no preselected status.
3. Save commits to disk before displaying confirmation.
4. **Lihat My Shelf** opens the matching category and highlights the fragrance.
5. **Lanjut eksplorasi** dismisses the sheet without losing the discovery position.

Navigation targets carry section, status, highlighted ID, and a request token. Consumed target params are cleared; ordinary tab visits preserve local filter state. Explicit Shelf navigation pops to its home route instead of stacking another home.

Private scentlist creation now leads to My Shelf instead of returning to public Explore where the new list would be invisible. Existing list edits return to the detail.

### Today

- Before recording: choose an occasion/mood, see a rule-based suggestion from owned items, and confirm wearing.
- Quick confirmation inherits the selected occasion; adding notes or changing the date remains optional.
- After recording: Now Wearing replaces the main recommendation prompt. The latest current-day log is shown, with an edit-note action.
- When the current log changes, Today scrolls to the top so the saved result is visible even if confirmation started lower down the page.
- Date refreshes on focus, on app resume, and once per minute while Today is focused. Quick confirmation uses the actual current date even if opened before midnight.
- Seven-day recap requires at least three distinct local dates with logs. Counts are based on stored records, not fabricated engagement.
- No streak penalties, synthetic activity, weather claims, or automatic sharing.

### Scent Studio

1. Select two different perfumes; owned fragrances are listed first.
2. Choose A dominant / balanced / B dominant.
3. Simulate a relative accord profile and inspect the explanation.
4. Name the recipe and save it to My Shelf → Resep.
5. Open, edit, delete, or remix it as a separate recipe.

Partial drafts can be saved explicitly and resumed after restart. Unsaved changes prompt before leaving. Starting another experiment while a draft exists requires a choice to resume or replace it. A failed write retains the previous persisted draft.

The current engine is mock-accord-v1: ordinal catalog accords form normalized illustrative vectors, combined with A weights of 0.7, 0.5, or 0.3. Output is deterministic. Bars describe relative strength, not confidence or chemical composition. Inputs, title, note, engine version, and updated timestamp are stored; the matching mock engine reconstructs the displayed result.

Every result remains visibly labeled demo, including saved recipes. No physical spray ratio, safety, longevity, or factual blend-compatibility claims are made. PredictionService is the boundary for a future adapter, not proof that the B2B model already supports commercial perfume layering.

### Persistence

Schema 1 data is read and migrated in memory to schema 2; existing profile, shelf, favorites, lists, and logs are preserved. Schema 2 adds recipes and a nullable Studio draft. The storage key remains unchanged (@essenza/b2c-v1) to find existing installations. The migrated state is committed on the next successful write.

Unknown versions and malformed data show recovery rather than being silently cleared. Downgrading to the old schema-1-only app is not supported; do not reset local data merely to change branches.

## Verification

Automated checks cover migration, status selection and navigation payloads, retry/failure handling, quick wear, local-day recap, Studio input validation, simulation determinism, recipe/draft persistence, edit/remix identity, and screen-level interactions. Navigation hooks are mocked in component tests; these tests are not a substitute for a complete physical-device walkthrough.

Validation completed across 13 and 15 September 2026 on Samsung SM-G990E (Android 16), using Metro on port 8083. TypeScript, all 41 tests in six suites, ESLint error checks, and the Android production JavaScript bundle passed. The production bundle check is not a release APK/signing test.

The device walkthrough exposed a Today scroll-position issue: the saved Now Wearing result could remain above the viewport. The fix scrolls to the top when the current log changes; a regression test and a repeat device walkthrough passed. Compact Shelf chips were also verified on the device.

### Physical-device checklist

- [x] Discover → detail: tab bar stays visible.
- [x] Add CK One as Wishlist / Sample → Lihat My Shelf opens Wishlist and highlights it.
- [x] Change CK One to Punya; Today includes it without duplicating the shelf item.
- [x] Confirm wearing from a scrolled Today screen; Now Wearing is immediately visible; edit and delete the QA log.
- [x] Studio: choose CK One / Light Blue, simulate balanced dominance, and save QA UX CHECK to My Shelf → Resep.
- [x] Edit the recipe to A dominant, save a draft, restart, resume, simulate, and save changes; only one recipe remains.
- [x] Delete the QA recipe and verify that no saved QA draft remains.
- [x] Remove the QA-only CK One shelf item and its two test wear logs (13 and 15 September); retain the existing profile, four original shelf entries, and Light Blue journal entry. These temporary records were deleted through the app and have no undo.

### Not yet touch-verified

- [ ] Create a private scentlist and land in My Shelf.
- [ ] Remix a recipe into a distinct saved recipe.
- [ ] Exercise the unsaved-change confirmation before leaving Studio.

These paths have automated coverage, but a physical touch walkthrough is still recommended. Live ML, community, cloud sync, iOS, and a signed release build are not established by this verification.

See B2C_MVP.md for the PowerShell environment and Metro port 8083 commands. This milestone changes JavaScript/TypeScript only; no new native dependency was added.
