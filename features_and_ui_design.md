# Alur fitur yang berlaku

Home membuka Explorer atau Molecule Analyzer.

Explorer mencari nama/brand, memfilter accord dari taxonomy katalog, dan mengelola koleksi pengguna. Nilai pencocokan adalah mean selected accord strength pada skala 0â€“100; bukan cosine, hasil model molekul, atau probabilitas menyukai parfum. Hasil filter dibersihkan ketika pilihan berubah. Error katalog/storage ditampilkan dan data rusak tidak ditimpa.

Molecule Analyzer menerima satu struktur SMILES atau satu contoh PubChem. API menghasilkan fitur; perangkat menjalankan semua model dari manifest. Respons dari input lama tidak dapat memperbarui hasil input baru. Skor di atas threshold dilabeli sebagai prediksi model, dengan keterangan bahwa skor belum dikalibrasi. Kegagalan satu model membatalkan keseluruhan hasil. Tidak ada filter berat molekul yang diklaim menentukan volatilitas secara pasti.

Perangkat memerlukan internet untuk menghitung fitur molekul baru. Explorer dan inferensi ONNX setelah fitur tersedia berjalan lokal. SMILES dikirim ke layanan fitur; aplikasi tidak boleh mengklaim seluruh alur analisis sepenuhnya offline atau sepenuhnya privat.

Desain visual yang ada dipertahankan. Validasi Android/aksesibilitas pada perangkat masih menjadi tahap berikutnya; hasil unit test dengan mock tidak menggantikannya.
