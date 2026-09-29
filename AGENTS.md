# Essenza Lab — React Native B2B

Scope: alat bantu klasifikasi label aroma **satu molekul**. Branch kerja `Yoga`; jangan mengubah atau push branch B2C `codex/essenza-b2c` tanpa instruksi Yoga.

- Periksa branch, file, aset, dan status proyek sebelum mengubah desain atau perilaku. Jangan mengarang fakta, hasil tes, atau keputusan pengguna; bila pilihan penting masih ambigu, tanyakan.
- Gunakan aset yang sudah dipilih Yoga. Jangan menggambar ulang atau mengganti aset tanpa permintaan.
- Gunakan JavaScript untuk layar, logika, dan tes. Native bridge ONNX Android memakai Kotlin. Jangan mengklaim iOS sudah diuji.
- Versi aktif: **v7 LightGBM D, 109 label, 2.048 bit Morgan + 8 deskriptor RDKit = 2.056 fitur**. Ambang label 0,5. Jangan mengganti dengan v6, model 25 label, atau RF 143 label.
- Riset dan training pada `Perfume-MultiLabel-Classifier` merupakan sumber beku. Jangan ubah logika training, data, evaluasi, atau model. Kode API aplikasi ada di `feature_api/` frontend.
- Jangan membuat prediksi dummy tampak sebagai hasil model. Tandai riwayat demo lama sebagai DEMO. Jangan menafsirkan skor sebagai komposisi, kekuatan, keamanan, atau akurasi terkalibrasi.
- Pertahankan identitas B2B `com.essenza.lab` dan namespace penyimpanan tersendiri agar B2C `com.essenza.app` tidak terganggu.
- Perubahan model atau skema fitur harus divalidasi ulang terhadap manifest, API, dan ONNX. Periksa hash serta kesetaraan inferensi sebelum build.
- Verifikasi dengan lint, tes relevan, dan Android jika tersedia. Laporkan batas yang belum diuji secara jujur.
