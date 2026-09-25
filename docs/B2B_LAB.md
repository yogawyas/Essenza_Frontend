# Essenza Lab — demo B2B

Tanggal: 25 September 2026.

Essenza adalah prototipe laboratorium aroma digital untuk meninjau aroma satu
molekul. Versi ini memakai data dummy lokal; integrasi backend ditunda sesuai
permintaan Yoga. Tidak ada training, inferensi RF, validasi RDKit, atau permintaan
API saat aplikasi dijalankan.

## Layar dan alur

1. Analisis: beri nama sampel (opsional), pilih salah satu dari empat contoh
   SMILES, lalu tekan `Lihat contoh hasil`.
2. Hasil: baca label serta confidence score contoh, SMILES masukan, dan status
   validasi. Simpan hasil ke riwayat jika diperlukan.
3. Riwayat: cari nama, SMILES, atau label, buka hasil, dan hapus satu catatan
   dengan konfirmasi. Data disimpan lokal dan tetap tersedia setelah restart.
4. Panduan: cara penggunaan, makna skor, konteks model penelitian, dan batasnya.

Semua layar hasil dan catatan tersimpan berlabel DEMO. Persentase hanya angka
ilustratif; tidak menunjukkan kadar bahan, kekuatan aroma, atau akurasi model.
Contoh tanpa label menguji empty state dan tidak menyatakan etanol tidak beraroma.
Nama sampel adalah catatan pengguna, bukan identifikasi kimia otomatis.

## Struktur kode

- `src/App.js`: navigasi tab dan halaman hasil.
- `src/screens/`: Analisis, Hasil, Riwayat, dan Panduan.
- `src/ui/`: tema hijau/putih hangat, ikon, dan komponen bersama.
- `src/domain/analysis.js`: pemeriksaan input dan format data saat aplikasi berjalan.
- `src/services/demoPrediction.js`: empat contoh tetap dan service demo.
- `src/storage/`: validasi data tersimpan dan antrean penulisan riwayat.

SMILES di luar contoh menghasilkan pesan belum tersedia, bukan hasil acak.
`canonicalSmiles` bernilai null dan `structureValidated` bernilai false karena
RDKit belum dihubungkan. Skema service masih kontrak UI sementara; saat API
dibuat, petakan respons yang benar dan tambahkan validasi respons server.

Penyimpanan menggunakan `@essenza/b2b-lab-v1`, maksimal 100 hasil. Jika penuh,
pengguna memilih catatan yang dihapus; aplikasi tidak membuang riwayat otomatis.
Jika data rusak/gagal dibaca, simpan dan hapus diblokir sampai muat ulang berhasil.
Jika penulisan gagal, UI tidak mengaku berhasil dan pengguna bisa mencoba lagi.

## Identitas aplikasi dan branch

Android/iOS bundle ID versi B2B: `com.essenza.lab`, nama tampilan `Essenza Lab`.
Ini memisahkan instalasi dari aplikasi B2C `com.essenza.app`. Nama modul native
tetap Essenza agar bootstrap React Native yang ada tetap cocok.

Pengembangan B2B disimpan hanya di branch `Yoga`. Branch `codex/essenza-b2c`
dipertahankan untuk proyek terpisah. Layar dan dokumentasi B2C lama di Yoga
dikeluarkan dari versi aktif; dapat dipulihkan lewat riwayat Git.

## Pemeriksaan manual

- Input kosong, input tidak dikenal, serta pemilihan setiap contoh.
- Loading, navigasi kembali, dan berganti tab saat loading.
- Hasil dengan beberapa label dan tanpa label.
- Simpan, buka riwayat, cari, restart aplikasi, dan buka kembali.
- Hapus dengan Batal/Hapus; kegagalan storage harus menampilkan pesan.
- Keyboard, layar kecil, font lebih besar, dan label demo tidak terpotong.

Lihat README untuk perintah menjalankan dan `VERIFICATION.md` untuk bukti aktual.
