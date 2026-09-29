# Verifikasi integrasi dan alur B2B Essenza Lab

Tanggal: 29 September 2026.

## Model dan API

- Sumber: frozen run `perfume-five-grouped-v7-m2048-d8/lgbm_D`, **109 label, 2.056 fitur**. Exporter memeriksa checksum model asli, mengonversi 109 ONNX, dan membandingkan output tiap ONNX dengan model LightGBM pada 32 vektor training beku. Seluruh hasil melewati toleransi `rtol=1e-5`, `atol=1e-6`, dan keputusan ambang 0,5 sama.
- `python -m unittest feature_api.test_app -v`: **4 tes lulus** (hash vektor RDKit Vanillin sesuai referensi beku, SMILES/campuran/skema salah ditolak, nama Vanillin sama dengan SMILES, serta respons PubChem yang disimulasikan). Proses keluar bersih dengan kode 0.
- `GET /health` dan `POST /fingerprint` dipakai oleh aplikasi fisik. Pencarian nama contoh Vanillin diproses lokal. Pencarian nama lain via PubChem belum bisa diverifikasi pada jaringan pengujian karena layanan mengembalikan 503.

## JavaScript dan Android

- `npm run lint`: lulus tanpa error; peringatan komponen tab yang sudah ada diperbaiki.
- `npm run test:ci -- --silent`: **5 suite, 19 tes lulus**, termasuk pilihan katalog yang mengirim SMILES tepat, tutorial saat pertama dibuka, CRUD Koleksi beserta kegagalan penyimpanan, alur hasil/riwayat, dan validasi alamat API. `npm run lint` lulus.
- Android debug build akhir **BUILD SUCCESSFUL** dengan ONNX Runtime Android 1.17.0; task `verifyV7Models` memeriksa keberadaan dan SHA-256 semua 109 ONNX sebelum APK dibuat. APK debug akhir dipasang ulang pada Samsung SM-G990E (`RRCT903AH2M`), aplikasi `com.essenza.lab`, dan halaman utama tampil normal. APK debug universal sekitar **257,6 MB**; aset ONNX mentah sekitar **152,2 MB**.
- Input SMILES Vanillin di HP menghasilkan **16 label**, teratas Vanilla **0,99**, Gourmand **0,96**, Caramel **0,96**, Creamy **0,95**. Jumlah label dan pembulatan skor cocok dengan inferensi Python v7 pada molekul yang sama. [Screenshot HP](verification-phone-v7.png).
- Hasil Vanillin tersimpan, tetap ada setelah force-stop dan buka ulang, lalu muncul di tab Riwayat.
- Endpoint API dengan **nama senyawa** “Vanillin” pernah diuji dan menghasilkan fitur yang sama dengan SMILES-nya; UI B2B sekarang memilih SMILES dari katalog agar identitas molekul tidak ambigu. Tombol **Simpan & tes koneksi** memeriksa bahwa layanan dan paket model cocok.
- Alur B2B terbaru diuji di Samsung SM-G990E: tutorial empat langkah muncul saat pertama dibuka, sorotan mengikuti katalog/tombol prediksi/tab Koleksi/tab Panduan, dan dapat dibuka ulang dari Panduan. [Screenshot tutorial di HP](verification-phone-tutorial.png).
- Katalog lokal menampilkan **6.686 pilihan** dan pilihan cepat Vanillin; memilihnya mengisi struktur `COc1cc(C=O)ccc1O` tanpa mengetik nama bebas. Prediksi nyata menghasilkan **16 label**, teratas Vanilla **0,99**, sama dengan verifikasi sebelumnya.
- Vanillin berhasil disimpan ke Koleksi, catatan `Rak_A` berhasil diedit lewat modal saat keyboard terbuka, dan **Analisis ulang** dari Koleksi menghasilkan kembali 16 label dengan Vanilla **0,99**. Dialog hapus berhasil mengembalikan Koleksi ke **0 senyawa** setelah data uji dibersihkan. Modal awal menutup tombol simpan saat keyboard terbuka; layout diperbaiki dan diuji ulang di HP.

## Batas yang masih ada

Uji ini memakai API Python pada PC melalui USB `adb reverse`. Pemakaian mandiri memerlukan hosting HTTPS untuk API fitur dan pengisian alamatnya pada bagian pengelola di Panduan. Tidak ada server publik atau pengujian deployment, iOS, maupun APK release dengan kunci produksi. Katalog berasal dari dataset final dan tidak menjamin semua pilihan tersedia secara komersial atau punya performa prediksi yang sama; struktur lain perlu mode SMILES lanjutan. Aset ONNX diabaikan Git sehingga harus diekspor dari frozen run v7 pada checkout/build baru. Jangan menyebut alur ini sepenuhnya offline; hanya inferensi ONNX yang berjalan lokal.
