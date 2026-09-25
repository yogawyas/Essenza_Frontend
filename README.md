# Essenza Lab

React Native B2B demonstrator untuk analisis aroma satu molekul.
Branch `Yoga` dan `main` berisi versi laboratorium; versi konsumen tetap ada di
`codex/essenza-b2c`.

Saat ini aplikasi memakai **data dummy lokal**, tanpa backend/API. Label dan skor
ditandai DEMO pada hasil maupun riwayat. Pilih contoh Linalool, Geraniol, Vanillin,
atau contoh tanpa label untuk menguji alur. Input lain tidak menghasilkan prediksi.

## Menjalankan Android

Siapkan Node.js >=22.11, JDK 17, Android SDK, serta emulator atau perangkat Android.
Gunakan versi Node yang memenuhi persyaratan React Native 0.86 di package.json.

```powershell
npm ci
npm start -- --host 127.0.0.1 --port 8099
```

Pada terminal lain, dengan emulator/perangkat terhubung:

```powershell
npm run android -- --port 8099 --appId com.essenza.lab
```

Jika Metro tidak terhubung pada Windows dengan beberapa adaptor jaringan,
gunakan alamat localhost secara eksplisit (Metro tetap berjalan di terminal lain):

```powershell
adb reverse tcp:8099 tcp:8099
cd android
.\gradlew.bat :app:installDebug -PreactNativeDevServerPort=8099 -PreactNativeDevServerIp=localhost
adb shell am start -n com.essenza.lab/com.essenza.app.MainActivity
```

Nama instalasi: **Essenza Lab**. ID `com.essenza.lab` berbeda dari versi B2C,
sehingga keduanya dapat dipasang berdampingan. Riwayat B2B juga memakai namespace
penyimpanan sendiri dan tidak membaca atau menghapus data B2C.

Port 8099 dipilih karena port 8084 sedang dipakai aplikasi lain saat pengujian.
Jika memakai port lain, samakan angkanya pada Metro, build, dan `adb reverse`.

## Memeriksa kode

```powershell
npm run lint
npm run test:ci
```

Layar, logika, dan tes ditulis dalam JavaScript `.js` (React Native).
`App.js` memanggil `src/App.js`. Service dummy dapat diganti setelah kontrak API
disepakati; saat itu validasi RDKit dilakukan backend dan respons diverifikasi.

## iOS

Kode iOS tetap tersedia dengan bundle ID `com.essenza.lab`. Build memerlukan macOS,
Xcode, dan instalasi Pods. Pengujian iOS belum dilakukan pada lingkungan Windows.

## Dokumentasi

- [Alur, batas demo, dan struktur kode](docs/B2B_LAB.md)
- [Bukti pemeriksaan](docs/VERIFICATION.md)
- [Steering frontend](AGENTS.md)

Aplikasi tidak memprediksi aroma campuran atau memberikan penilaian keamanan
bahan. Model penelitian RF + ML-SMOTE belum dihubungkan pada versi ini.
