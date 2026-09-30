# Verifikasi integrasi dan alur B2B Essenza Lab

Tanggal: 29 September 2026.

## Model dan API

- Sumber: frozen run `perfume-five-grouped-v7-m2048-d8/lgbm_D`, **109 label, 2.056 fitur**. Exporter memeriksa checksum model asli, mengonversi 109 ONNX, dan membandingkan output tiap ONNX dengan model LightGBM pada 32 vektor training beku. Seluruh hasil melewati toleransi `rtol=1e-5`, `atol=1e-6`, dan keputusan ambang 0,5 sama.
- `python -B -m unittest feature_api.test_app -v`: **7 tes lulus** (termasuk hash vektor RDKit beku, struktur salah/campuran, nama katalog, rumus dengan dua isomer, dan respons PubChem yang disimulasikan).
- `GET /health`, `POST /resolve`, dan `POST /fingerprint` dipakai oleh aplikasi fisik. Pencarian katalog berlangsung lokal. Pencarian eksternal `acetaminophen` ke PubChem berhasil mengembalikan SMILES dan CID saat diuji dari server lokal.

## JavaScript dan Android

- `npm run lint`: lulus tanpa error; peringatan komponen tab yang sudah ada diperbaiki.
- `npm test -- --runInBand`: **5 suite, 22 tes lulus**, termasuk konfirmasi kandidat rumus, pembatalan pilihan setelah input diubah, dan penolakan prediksi contoh non-aroma. `npm run lint` lulus.
- Android debug build akhir **BUILD SUCCESSFUL** dengan ONNX Runtime Android 1.17.0; task `verifyV7Models` memeriksa keberadaan dan SHA-256 semua 109 ONNX sebelum APK dibuat. APK debug akhir dipasang ulang pada Samsung SM-G990E (`RRCT903AH2M`), aplikasi `com.essenza.lab`, dan halaman utama tampil normal. APK debug universal sekitar **257,6 MB**; aset ONNX mentah sekitar **152,2 MB**.
- Input SMILES Vanillin di HP menghasilkan **16 label**, teratas Vanilla **0,99**, Gourmand **0,96**, Caramel **0,96**, Creamy **0,95**. Jumlah label dan pembulatan skor cocok dengan inferensi Python v7 pada molekul yang sama. [Screenshot HP](verification-phone-v7.png).
- Hasil Vanillin tersimpan, tetap ada setelah force-stop dan buka ulang, lalu muncul di tab Riwayat.
- Endpoint API dengan **nama senyawa** “Vanillin” pernah diuji dan menghasilkan fitur yang sama dengan SMILES-nya; UI B2B sekarang memilih SMILES dari katalog agar identitas molekul tidak ambigu. Tombol **Simpan & tes koneksi** memeriksa bahwa layanan dan paket model cocok.
- Alur B2B diuji di Samsung SM-G990E: tutorial sekarang lima langkah, termasuk mode nama/rumus. Sorotan katalog dan dua pilihan utama tampil normal; tutorial dapat dibuka ulang dari Panduan. [Screenshot tutorial versi sebelumnya](verification-phone-tutorial.png).
- Katalog lokal menampilkan **6.686 pilihan** dan pilihan cepat Vanillin; memilihnya mengisi struktur `COc1cc(C=O)ccc1O` tanpa mengetik nama bebas. Prediksi nyata menghasilkan **16 label**, teratas Vanilla **0,99**, sama dengan verifikasi sebelumnya.
- Vanillin berhasil disimpan ke Koleksi, catatan `Rak_A` berhasil diedit lewat modal saat keyboard terbuka, dan **Analisis ulang** dari Koleksi menghasilkan kembali 16 label dengan Vanilla **0,99**. Dialog hapus berhasil mengembalikan Koleksi ke **0 senyawa** setelah data uji dibersihkan. Modal awal menutup tombol simpan saat keyboard terbuka; layout diperbaiki dan diuji ulang di HP.
- Mode **Nama / rumus** diuji di HP melalui Metro dari branch `marvel` dan API lokal: input `C2H6O` menampilkan **Dimethyl ether (COC)** dan **Ethanol (CCO)** ([layar kandidat](verification-phone-formula-candidates.png)). Setelah Ethanol dipilih, prediksi ONNX benar-benar berjalan dan layar hasil menampilkan **7 label** (teratas Ethereal **0,95**; [layar hasil](verification-phone-formula-result.png)). Ini memvalidasi alur pilih kandidat → ekstraksi fitur → inferensi lokal.

## Pembaruan Riwayat otomatis — 30 September 2026

- `npm test -- --runInBand`: **5 suite, 23 tes lulus**. Skenario baru memastikan setiap inferensi sukses langsung ditulis ke Riwayat, dua inferensi menghasilkan dua catatan, analisis ulang dari Koleksi juga dicatat, kegagalan simpan dapat dicoba ulang tanpa menjalankan ML lagi, dan kegagalan inferensi tidak membuat catatan. `npm run lint` lulus.
- Di Samsung SM-G990E melalui Metro dan API USB, Vanillin dianalisis tanpa menekan tombol simpan. Layar hasil menampilkan **Tercatat di Riwayat**; tab Riwayat menampilkan entri Vanillin terbaru, sedangkan Koleksi tetap **0 senyawa**. Bagian **Pilihan cepat** di bawah formulir Analisis sudah dihapus; pilihan cepat di dalam modal katalog tetap tersedia sebagai alat navigasi daftar.

## Batas yang masih ada

Uji ini memakai API Python pada PC melalui USB `adb reverse`. Pemakaian mandiri memerlukan hosting HTTPS untuk API fitur dan pengisian alamatnya pada bagian pengelola di Panduan. Nama di luar katalog membutuhkan akses PubChem dari server; ketersediaannya belum diuji secara terus-menerus. Tidak ada server publik atau pengujian deployment, iOS, maupun APK release dengan kunci produksi. Katalog berasal dari dataset final dan tidak menjamin semua pilihan tersedia secara komersial atau punya performa prediksi yang sama. Aset ONNX diabaikan Git sehingga harus diekspor dari frozen run v7 pada checkout/build baru. Jangan menyebut alur ini sepenuhnya offline; hanya inferensi ONNX yang berjalan lokal.
