# Essenza Lab — analisis aroma senyawa untuk pengguna B2B

Aplikasi React Native B2B untuk memprediksi label aroma **satu molekul**. Layar utama menawarkan dua cara input: pilih dari katalog **6.686 senyawa bernama**, atau ketik nama/rumus kimia. Input bebas dicocokkan ke katalog terlebih dahulu, lalu PubChem bila belum ditemukan; pengguna wajib memilih struktur hasil pencarian sebelum prediksi. SMILES murni ada di input lanjutan. API Python/RDKit menghasilkan **2.048 bit Morgan Fingerprint + 8 deskriptor** sesuai skema eksperimen final v7. **109 model LightGBM D** yang diekspor ke ONNX berjalan di Android. Label muncul jika skor masing-masing mencapai **0,5**. Skor bukan persentase komposisi aroma. Istilah versi dan teknologi model tidak ditampilkan pada alur pengguna.

Saat pertama dibuka, aplikasi menampilkan tutorial lima langkah dengan sorotan dan panah. Tutorial dapat diulang dari tab Panduan. Setiap prediksi yang berhasil otomatis dicatat di **Riwayat** (maksimal 100 hasil lokal); bila penyimpanan gagal, hasil tetap ditampilkan dengan tombol coba simpan lagi. **Koleksi** hanya berisi senyawa yang dipilih pengguna untuk disimpan (maksimal 200), lengkap dengan nama panggilan/catatan dan opsi analisis ulang. Layar Analisis tidak lagi menampilkan bagian Pilihan cepat di bawah formulir.

Riset dan training tetap berada di repositori `Perfume-MultiLabel-Classifier`; kode di sini hanya untuk integrasi aplikasi. Backend riset tidak diubah. Versi B2C berada di branch terpisah `codex/essenza-b2c` dan tidak terpengaruh.

## Uji API lewat Vercel Hobby

Entrypoint root `app.py` mengarah ke `feature_api.app:app`; `requirements.txt` root memakai paket yang sama dengan API lokal. Di Vercel, impor repo ini sebagai proyek **FastAPI** dengan Root Directory kosong dan Python 3.12. Tetapkan branch produksi ke `marvel` pada **Settings → Environments → Production → Branch Tracking**, karena Vercel biasanya memilih `main` secara default. Setelah deploy, pastikan `GET /health` mengembalikan `status: ok` beserta `feature_schema_id` yang cocok dengan manifest aplikasi. Isi alamat HTTPS dasar di **Panduan → Pengaturan koneksi**.

Vercel Hobby hanya untuk demo pribadi/nonkomersial. API tetap memerlukan internet untuk pencarian senyawa di luar katalog dan APK release belum menyimpan URL publik bawaan sampai layanan live terverifikasi.

## Menjalankan di HP Android

Persyaratan: Node.js >=22.11, JDK 17+, Android SDK/ADB, Python 3.12 dengan paket pada `feature_api/requirements.txt`, serta aset ONNX v7 di `android/app/src/main/assets/models/v7/`. Aset ONNX berukuran sekitar 152 MB, diabaikan Git, dan harus diekspor dari frozen run v7 sebelum build pada checkout baru. Manifest JSON yang cocok ada di `src/assets/metadata/v7_model_manifest.json`. Build akan gagal bila aset hilang atau checksum tidak cocok.

```powershell
npm ci
python -m pip install -r feature_api/requirements.txt
python -m uvicorn feature_api.app:app --host 127.0.0.1 --port 8000
```

Jika shim `npm` pada PC ini menunjuk ke lokasi yang rusak, jalankan npm lewat `C:\Program Files\nodejs\node.exe` dengan argumen `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`. Untuk error panjang path Gradle di Windows, petakan root frontend ke drive pendek dengan `subst X: (Resolve-Path .).Path` lalu jalankan Gradle dari `X:\android`.

Di terminal lain:

```powershell
adb reverse tcp:8000 tcp:8000
adb reverse tcp:8099 tcp:8099
npm start -- --host 127.0.0.1 --port 8099
```

Build dan pasang melalui terminal ketiga. Pada PC ini setel JDK Android Studio dan Android SDK dahulu:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\ACER\AppData\Local\Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
cd android
.\gradlew.bat :app:installDebug -PreactNativeDevServerPort=8099 -PreactNativeDevServerIp=localhost
adb shell am start -n com.essenza.lab/com.essenza.app.MainActivity
```

Pada tab **Panduan → Pengaturan koneksi** (bagian pengelola), alamat default debug ialah `http://127.0.0.1:8000`. Tekan **Simpan & tes koneksi**. Untuk pemakaian tanpa USB, host API di server HTTPS lalu isi alamat dasarnya di sana. Build release tidak memiliki alamat default: operator perlu mengisinya. Layanan API harus tetap tersedia untuk prediksi baru; ONNX dijalankan lokal setelah fitur diterima. Hosting API merupakan pekerjaan berikutnya dan belum dilakukan.

## Membangun ulang katalog senyawa

Katalog dibekukan dalam `src/assets/catalog/compounds.json` agar pilihan nama tersedia tanpa pencarian eksternal. Generator membaca `records.csv` dan metadata sumber dari repo riset **secara read-only**, memeriksa checksum, lalu menggabungkan nama dengan SMILES kanonis. Angka 6.686 adalah ukuran katalog yang berasal dari dataset final, **bukan** batas semua struktur yang dapat diproses model. Input nama/rumus memakai `POST /resolve`; rumus seperti `C2H6O` dapat mengembalikan beberapa isomer. Sejumlah nama awam Indonesia dikurasi sebagai alias; nama yang belum dikenal mungkin perlu ejaan kimia/Inggris yang lebih spesifik. `Air` dan `CO2` dikenali tetapi tidak dikirim ke prediksi aroma. Nama di luar katalog membutuhkan akses internet dari server ke PubChem. Struktur lain dapat dicoba di mode SMILES lanjutan.

```powershell
python scripts/build-compound-catalog.py --backend-root 'C:\Users\ACER\Documents\Marvel\Skripsi\Project Skripsi\Perfume-MultiLabel-Classifier'
```

## Mengekspor ONNX dari run final

Exporter membaca `inference_bundle.json`, SHA-256 model asli, `features.npz`, dan `splits.json` dari run v7. Ia **tidak melatih ulang** model. Setiap model ONNX dibandingkan dengan prediksi model asli pada 32 vektor beku, termasuk keputusan ambang 0,5. Paket ekspor dipin pada `scripts/requirements-export.txt`.

```powershell
$v7 = 'C:\Users\ACER\Documents\Marvel\Skripsi\Project Skripsi\Perfume-MultiLabel-Classifier\.local-tools\campus-transfer-full-20260909\perfume-campus-grouped-v7-m2048-d8\perfume-campus-grouped-v7-m2048-d8'
python -m pip install -r scripts/requirements-export.txt
python scripts/export-v7-onnx.py `
  --run "$v7\runs\perfume-five-grouped-v7-m2048-d8" `
  --features "$v7\data\builds\perfume-m2048-d8-v7\features.npz" `
  --splits "$v7\data\builds\perfume-five-grouped-v2\splits.json"
```

Exporter menolak menimpa aset yang sudah ada. Bila melakukan ekspor ulang, simpan atau hapus hasil lama secara sengaja dahulu dan pastikan manifest baru ikut dibawa ke aplikasi serta API.

## Pemeriksaan

```powershell
npm run lint
npm run test:ci
python -m unittest feature_api.test_app -v
```

Lihat [alur dan batas model](docs/B2B_LAB.md) serta [hasil verifikasi](docs/VERIFICATION.md). `com.essenza.lab` dan namespace riwayat B2B terpisah dari aplikasi B2C. iOS belum diuji dan native bridge ONNX saat ini khusus Android.
