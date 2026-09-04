# Essenza Frontend

React Native app pada branch codex/project-reliability, berdasarkan origin/marvel (775b123). Checkout utama tidak diubah.

- **Molecule Analyzer:** satu SMILES â†’ API RDKit online â†’ fitur versioned â†’ seluruh model ONNX di perangkat. Hasil adalah skor model yang belum dikalibrasi, bukan kepastian persepsi manusia.
- **Explorer:** 2.029 parfum dalam katalog JSON; parfum pengguna disimpan di AsyncStorage. Ranking adalah rata-rata kekuatan accord yang dipilih, dengan tie-break rating dan pid. Taxonomy katalog berbeda dari label ML.
- Manifest aktif mencakup 25 model XGBoost historis. Model belum diganti oleh hasil tuning baru.
- Kumpulan contoh molekul berasal dari respons PubChem dengan CID, formula, SMILES, dan URL sumber. UI hanya memilih satu molekul; prediksi campuran tidak didukung.

## Setup dan verifikasi

Node >=22.13.0 sesuai dependency React Native 0.86 yang terpasang. Gunakan npm ci untuk package-lock.json. Jangan menginstal native dependency global untuk aplikasi ini.

```powershell
npm ci
npm run typecheck
npm test
npm run verify:assets
npm run preflight
```

Pada mesin migrasi ini, wrapper npx mengarah ke instalasi npm global yang hilang. Fallback yang sudah diuji tanpa mengubah sistem:

```powershell
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" ci
node node_modules/typescript/bin/tsc --noEmit
node node_modules/jest/bin/jest.js --runInBand
node scripts/verify-assets.cjs
node scripts/preflight.cjs
```

@react-native/jest-preset 0.86.0 kini menjadi dependency eksplisit. Tests memakai mock native/network, termasuk respons terlambat, error model, checksum rusak, dan operasi storage bersamaan.

## Kontrak API/model

Gradio 5.49.1 memakai /gradio_api/call/predict. src/services/InferenceService.ts menolak schema fitur berbeda, dimensi salah, NaN/Infinity, bit pecahan, atau file model dengan checksum salah. Cache disimpan per bundle ID. Setiap hasil membutuhkan seluruh model berhasil. Perubahan input dan unmount membatalkan permintaan serta mencegah hasil lama tampil; release session menunggu inferensi selesai.

Layanan publik belum diperbarui pada tahap ini. API di repo ML dan app harus dideploy/dibuild sebagai pasangan yang sesuai. Default kontrak model historis memakai RDKit 2026.03.4 dan chirality=false; fitur pada 5.091 baris molekul tunggal training historis sudah diperiksa sama persis. Eksperimen baru memakai chirality=true dan membutuhkan bundle baru.

Untuk mengimpor hasil ekspor ML yang sudah lolos parity:

```powershell
node scripts/import-models.cjs PATH_TO_VALIDATED_BUNDLE
node scripts/verify-assets.cjs
```

Importer menyalin ke folder bundle baru dan memperbarui metadata terakhir. Deploy feature_spec.json dari bundle ke API. Versi lama sengaja tetap tersimpan; sebelum packaging final, rapikan asset bundle yang tidak digunakan setelah memastikan jalur rollback. Jangan menjalankan importer pada model yang belum memiliki bukti parity seluruh label.

## Explorer dan data pengguna

src/assets/metadata/catalog_manifest.json mencatat jumlah, taxonomy, hash, dan keterbatasan sumber. Raw export serta log transformasi katalog historis belum ditemukan; jangan menyebut provenance katalog sudah sepenuhnya direproduksi. Exporter di repo ML menerima CSV dengan schema eksplisit dan membuat JSON+manifest baru tanpa mengarang bobot aroma.

Data pengguna lama berbentuk array masih dapat dibaca. Penyimpanan diperbarui ke envelope version=1 hanya saat perubahan pengguna berhasil. Operasi baca/ubah berurutan, ID unik dalam koleksi, dan data rusak ditampilkan sebagai error tanpa menimpa isi lama. Accord custom lama yang sudah tersimpan dipertahankan.

## Android

Preflight menemukan Java, Android SDK 36 dan adb; **NDK 27.1.12297006 belum tersedia**. Build APK dan uji perangkat belum dijalankan. Kompatibilitas ONNX Runtime React Native 1.19.0 dengan React Native 0.86 belum dinyatakan lulus.

Gradle maksimal dua worker, tidak parallel, heap JVM 2 GiB. Metro maksimal dua worker dan heap Node bundling 2 GiB. Hindari menjalankan build bersamaan dengan training ML. Untuk perangkat uji tertentu, pilih ABI secara eksplisit agar tidak membangun semua arsitektur sekaligus:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
cd android
.\gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a --no-daemon --max-workers=2
```

Perintah tersebut belum dijalankan; pastikan ABI perangkat sesuai dan NDK tersedia. Build release kini meminta signing release, bukan memakai debug key. Simpan ESSENZA_UPLOAD_STORE_FILE, ESSENZA_UPLOAD_STORE_PASSWORD, ESSENZA_UPLOAD_KEY_ALIAS, ESSENZA_UPLOAD_KEY_PASSWORD di user Gradle properties/CI secrets. Tidak ada key baru yang dibuat.

Sebelum rilis: fresh install, upgrade cache, single-molecule correctness, request cancellation, API downtime, offline Explorer, CRUD persistence, native/ONNX parity di perangkat, waktu dan RAM keseluruhan alur. Belum ada APK baru, signing, maupun deployment aplikasi/API pada perubahan ini. Publikasi source ke branch marvel di yogawyas/Essenza_Frontend dilakukan terpisah dari tahap tersebut.

Daftar 12 poin dan referensi penelitian/rekayasa: [status implementasi di repository ML](https://github.com/marvelkn/Perfume-MultiLabel-Classifier/blob/main/IMPLEMENTATION_STATUS.md). Laporan skripsi menunggu hasil eksperimen yang sah.

Bundle JavaScript hasil build lama telah dikeluarkan dari source assets pada worktree ini. React Native Gradle Plugin menghasilkan bundle release dari source saat build; debug menggunakan Metro. Aset ONNX historis tetap tersedia.
