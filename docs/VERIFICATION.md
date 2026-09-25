# Pemeriksaan frontend B2B

Tanggal: 25 September 2026.

## Kode dan tes

- Kode aplikasi, layar, dan tes menggunakan JavaScript `.js`.
  Tidak ada `.ts`/`.tsx` pada sumber proyek sendiri. Konfigurasi dan dependency
  TypeScript langsung dihapus. Library React Native dapat tetap membawa
  deklarasi tipe sebagai dependency internal; itu bukan kode aplikasi Essenza.
- Node.js 24.19.0, React Native 0.86.0, React 19.2.3.
- `npm run lint`: lulus tanpa error/warning.
- `npm run test:ci`: dua suite, sembilan tes lulus.
- Tes mencakup input kosong/tidak tersedia, provenance data demo, hasil tanpa
  label, penyimpanan/pemulihan riwayat, simpan ganda, gagal tulis/hapus,
  dan pemblokiran penulisan jika riwayat belum dapat dibaca.
- Tes memakai mock storage; persistence native juga diperiksa terpisah.

## Android

- JDK 17, build debug x86_64 berhasil, dipasang pada AVD Tes_Device
  (Android 17/API 37, resolusi 1344 x 2992).
- Metro memakai Node.js 24.19.0 pada `127.0.0.1:8099`.
  Port 8084 pada mesin pengujian dipakai layanan lain. Memakai port yang sama
  pada Metro dan build menyelesaikan masalah koneksi development.
- Layar Analisis dan hasil Linalool diperiksa melalui screenshot emulator:
  header, penanda DEMO, input, label, skor, dan area scroll terbaca.
- Input kosong menampilkan pesan, pemilihan Linalool mengisi form, dan hasil
  menampilkan skor contoh floral 82%, sweet 64%, citrus 43%.
- Simpan menampilkan status tersimpan. Setelah force-stop dan membuka ulang
  aplikasi, riwayat Linalool masih tersedia dengan penanda DEMO.
- Pencarian yang tidak cocok menampilkan keadaan kosong; membersihkannya
  menampilkan kembali hasil tersimpan.
- Hasil tersimpan dapat dibuka kembali. Konfirmasi Batal mempertahankan catatan;
  konfirmasi Hapus mengembalikan riwayat ke keadaan kosong.

## Batas verifikasi

- Belum ada build rilis, pengujian iOS, atau pemeriksaan seluruh ukuran layar
  dan pengaturan aksesibilitas. Pengujian di perangkat fisik tetap diperlukan.
- API, RDKit, dan model penelitian tidak dipanggil. Keberhasilan demo bukan
  bukti bahwa integrasi backend atau prediksi model sudah selesai.
- Instalasi dependency melaporkan 20 advisory (1 low, 13 moderate, 6 high).
  Tidak dilakukan `audit fix --force` yang dapat mengganti versi secara
  tidak terkontrol. Audit dependency menjadi pemeriksaan sebelum rilis.
- APK debug memerlukan Metro; layanan prediksi dummy sendiri tidak memerlukan
  backend atau koneksi internet. Artefak build tidak dimasukkan ke Git.
