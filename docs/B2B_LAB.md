# Alur teknis Essenza Lab untuk pengguna B2B

Tanggal: 30 September 2026.

1. Pengguna memilih senyawa dari katalog lokal **6.686 molekul** atau mengetik nama/rumus pada mode input bebas. Mode kedua memanggil `POST /resolve`: nama dicocokkan secara tepat dengan nama/alias katalog terlebih dahulu, lalu dicari di PubChem jika belum ada; rumus dicocokkan dengan struktur katalog dan dapat menghasilkan beberapa isomer. Pengguna harus memilih satu kandidat sebelum prediksi. `Air` dan `CO2` dikenali sebagai contoh senyawa di luar cakupan aroma dan tidak diprediksi. Input SMILES murni tersedia di bagian lanjutan.
2. `feature_api/app.py` memvalidasi satu molekul dengan RDKit, mengkanonisasi SMILES, lalu menghasilkan vektor `float32` berisi **2.048 bit Morgan radius 2 tanpa chirality** dan delapan deskriptor sesuai urutan manifest v7.
3. Aplikasi membandingkan `model_id`, `bundle_id`, `feature_schema_id`, panjang dan nilai vektor. Native bridge Android memeriksa SHA-256 setiap aset ONNX dan menjalankan **109 model LightGBM D**. Kegagalan satu model membatalkan seluruh prediksi; tidak ada hasil parsial.
4. Setelah inferensi berhasil, hasil beserta input, SMILES kanonis, waktu, dan identitas model otomatis ditulis ke Riwayat lokal sebelum layar hasil dibuka. Jika penyimpanan gagal, layar hasil tetap tersedia dan menawarkan coba simpan lagi; kegagalan inferensi tidak membuat catatan. Layar hasil menampilkan label dengan skor >= **0,5** dan menyediakan seluruh 109 skor. Koleksi tetap bersifat manual: pengguna memilih senyawa untuk disimpan, dapat menambah nama panggilan/catatan, menghapusnya, dan memprediksi ulang dari struktur tersimpan. Analisis ulang juga otomatis menghasilkan entri Riwayat baru.

API hanya mengekstraksi fitur; **inferensi ML berlangsung di perangkat**. Model dan skema fitur diambil dari frozen run `perfume-five-grouped-v7-m2048-d8/lgbm_D`. Katalog 6.686 molekul adalah himpunan pilihan yang punya metadata nama, **bukan batas domain input model**. Model v6/25 label/RF 143 label bukan versi aktif. Aplikasi ini tidak mencampur bahan, menyarankan resep, memperkirakan intensitas, atau menilai keamanan. Skor belum dikalibrasi dan bukan persentase kadar aroma. Versi model dan istilah teknis disembunyikan dari alur pengguna, tetapi tetap dicatat untuk audit internal.

Komponen utama:

- `feature_api/app.py`: endpoint `GET /health`, `POST /resolve`, dan `POST /fingerprint`.
- `scripts/export-v7-onnx.py`: ekspor dan uji kesetaraan model.
- `src/services/v7Prediction.js`: validasi kontrak API, antrean inferensi, hasil dan error.
- `src/services/featureApiConfig.js`: alamat API tersimpan terpisah dari riwayat.
- `scripts/build-compound-catalog.py` dan `src/assets/catalog/compounds.json`: pilihan senyawa lokal yang dapat direproduksi dari dataset beku, tanpa mengubah backend riset.
- `android/app/src/main/java/com/com.essenza.app/EssenzaOnnxModule.kt`: inferensi ONNX Android.
- `src/screens/`: Analisis, Hasil, Koleksi, Riwayat, Panduan. `src/storage/` menyimpan maksimal 200 senyawa dan 100 hasil dalam namespace terpisah.
- `src/tutorial/`: tutorial lima langkah saat pertama dibuka dan dapat diulang dari Panduan.

Keberhasilan di HP melalui USB menggunakan `adb reverse` membuktikan alur lokal, belum membuktikan ketahanan server HTTPS atau kompatibilitas iOS. Input nama di luar katalog juga membutuhkan akses PubChem dari server; bila tidak tersedia, pencarian itu akan gagal dengan pesan jelas. Prediksi baru masih membutuhkan layanan fitur; Koleksi dan Riwayat tersimpan lokal. Rumus molekul tidak menentukan satu struktur secara unik, dan model v7 tetap memiliki batas dataset dan validasi yang perlu dijelaskan terpisah pada skripsi.
