# Essenza B2C — local MVP

## Scope

Android-first offline demo, approved in this task. Profile/preferences, catalog, shelf, favorites, scentlists, Today recommendations, and private wear logs persist on the device. Cloud auth, live community, and sync are not implemented in this milestone.

Public scentlists are visible only in the simulated Explore on this device. Curators are explicitly labeled fixtures. Reports are local records and are not delivered to a moderator. There are no fabricated community counts, match probabilities, or weather readings.

## Implementation

- `App.js` delegates to `src/App.tsx`.
- `src/screens`: feature screens with React Navigation native stack and four tabs.
- `src/ui`: design tokens, shared components, original generic vector bottle illustrations.
- `src/domain`: typed models, catalog fixtures, validation, visibility rules, deterministic ranking.
- `src/storage`: AsyncStorage repository with serialized commit-before-publish writes and a React provider.

Storage key: `@essenza/b2c-v1`. Load validates persisted data. Unknown/corrupt data shows recovery UI without automatic overwrite. Failed writes do not publish success; subsequent operations may retry. A local repository is not a server authorization boundary.

Have/Want/Had are independent of favorites. Removing a shelf item preserves history. Wear records are private. Scentlist items are unique and ordered. Blocking hides curator content and removes bookmarks/follows. Repeat writes of the same wear operation ID are idempotent.

Recommendation defaults: liked accord +3, chosen mood +3, activity tag +2, favorite +1, unused 7 days +1, worn within one day -2. Avoided accords are excluded. Owned suggestions only include Have items; discovery excludes Have items. These are unvalidated heuristic weights, never displayed as probabilities. Metadata and activity tags remain illustrative prototype data, not verified product claims.

## Run on the connected Android phone

Install with `npm ci`. New native dependencies require rebuilding once; Metro reload alone is insufficient.

PowerShell terminal 1:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\ACER\AppData\Local\Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
Set-Location 'C:\Users\ACER\Documents\Marvel\MCP\Project'
adb reverse tcp:8083 tcp:8083
node node_modules/react-native/cli.js start --port 8083
```

PowerShell terminal 2: repeat the environment setup. `$env:` values apply only to the current terminal session; a newly opened terminal can otherwise pick Java 8 and miss ADB.

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\ACER\AppData\Local\Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
Set-Location 'C:\Users\ACER\Documents\Marvel\MCP\Project'
java -version
adb devices
adb reverse tcp:8083 tcp:8083
node node_modules/react-native/cli.js run-android --port 8083 --no-packager --active-arch-only
```

Confirm that Java reports the Android Studio JBR (Java 21 on this machine) and the phone is listed as `device`. For `unauthorized`, unlock the phone and accept USB debugging. No emulator is needed when the physical phone is connected. If Metro already runs on 8083, keep that terminal open and do not start another server on the same port.

8083 isolates the preview from pre-existing Metro servers on 8081/8082. Debug builds need Metro to load JavaScript. Local data survives restarts. iOS remains unverified and requires CocoaPods/build on a Mac.

## Verify

```powershell
npx tsc --noEmit
node node_modules/jest/bin/jest.js --runInBand
npm run lint
```

Coverage includes onboarding, storage/reload, concurrent/failed writes, invalid state, shelf transitions, wear retry/edit/delete, block visibility, scentlist ownership/order, and recommendation filtering. Runtime walkthrough: start profile → add Have item → Today → wear log → journal → create scentlist → edit/reorder → bookmark/follow fixture → restart.

## Next backend milestone

FastAPI modular monolith + PostgreSQL + Supabase Auth/Storage. Verify JWT identity and repeat ownership/visibility/block checks server-side. Never put service credentials on the phone. Offer explicit, idempotent import of local records after real sign-in; do not import fixture follows/reports as live community activity.

Planned API contracts (not running endpoints), relative to `/api/v1`:

| Domain | Endpoints |
|---|---|
| Profile | `GET/PATCH /me`, `DELETE /me`, `GET/PUT /me/preferences` |
| Catalog | `GET /fragrances`, `GET /fragrances/{id}` |
| Shelf | `GET /me/shelf`, `PUT/DELETE /me/shelf/{fragranceId}` |
| Favorites | `GET /me/favorites`, `PUT/DELETE /me/favorites/{fragranceId}` |
| Lists | `GET/POST /scentlists`, `GET/PATCH/DELETE /scentlists/{id}`, `PUT /scentlists/{id}/items` |
| Bookmarks | `GET /me/saved-scentlists`, `PUT/DELETE /me/saved-scentlists/{id}` |
| Follow | `PUT/DELETE /me/following/{userId}` |
| Journal | `GET/POST /me/wear-logs`, `GET/PATCH/DELETE /me/wear-logs/{id}` |
| Discovery | `GET /recommendations/daily`, `GET /recommendations/discovery`, `POST /recommendations/feedback` |
| Moderation | `POST /reports`, `PUT/DELETE /me/blocks/{userId}`, moderator-only review endpoints |

Then evaluate live social interactions, weekly discovery, monthly recap, and eventually Scent Blend/yearly Wrapped. Layering recipes and hybrid ML need separate validation and real interaction data.

## Verification status

- Branch: `codex/essenza-b2c`; changes remain local and uncommitted.
- TypeScript: passed.
- Jest: 13 tests passed, including multiple-scentlist order across repeated restarts.
- ESLint: no errors in changed application/test code; inline-style warnings remain.
- Android native build: successful; APK installed on Samsung SM-G990E, Android 16.
- Device smoke test (2026-09-13): Today, Discover, fragrance detail, Scentlists, and My Shelf opened on the connected phone; no AndroidRuntime or ReactNativeJS errors were present in the current app process log. Existing profile data was preserved. Full CRUD/restart touch walkthrough remains pending; automated tests do not replace that verification.
- Cloud authentication, remote API, real multi-user data, and iOS are outside this approved local-demo milestone.
