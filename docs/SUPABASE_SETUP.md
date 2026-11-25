# Essenza MCP dengan Supabase

## Setup project development

Project development Essenza sudah memiliki migrasi `20261124123447`. Mulai dari langkah 3 jika menggunakan project tersebut. Untuk project baru, mulai dari langkah 1.

1. Buat project development di organisasi Supabase tim. Gunakan project terpisah dari database produksi.
2. Terapkan [migrasi akun](../supabase/migrations/20261124123447_essenza_account_state.sql) satu kali melalui Supabase CLI atau SQL Editor. Gunakan file yang sama saat menyiapkan database pengembangan baru.
3. Pastikan **Data API** mengekspos schema `public`. Untuk Auth, aktifkan **Email** dan pertahankan **Confirm email**. Biarkan anonymous sign-in nonaktif.
4. Buka **Connect** dan salin **Project URL** serta **Publishable key** (`sb_publishable_...`). Dari root repo, siapkan file konfigurasi lokal.

   ```powershell
   Copy-Item -LiteralPath .env.example -Destination .env
   ```

   Isi `ESSENZA_SUPABASE_URL` dan `ESSENZA_SUPABASE_PUBLISHABLE_KEY` di `.env`. Kedua nilai ini masuk ke bundle mobile. Database password, access token akun Supabase, dan secret/service-role key harus tetap di sisi server. File `.env` sudah diabaikan Git.

5. Jalankan `npm ci` dengan Node 22.11 atau lebih baru. Hentikan dan jalankan ulang Metro setiap kali mengubah `.env`. Integrasi Keychain menambah modul native, jadi pasang ulang build Android. Untuk iOS, jalankan CocoaPods dan rebuild di macOS.

SMTP bawaan Supabase membatasi penerima ke alamat anggota tim. Gunakan alamat anggota tim untuk menguji email konfirmasi. Untuk uji login dan isolasi data, admin development juga bisa membuat dua akun uji terkonfirmasi dari **Authentication → Users**. Sebelum registrasi publik, siapkan [SMTP khusus](https://supabase.com/docs/guides/auth/auth-smtp) dan Site URL HTTPS yang sesuai untuk konfirmasi.

## Android via USB

Pakai port Metro yang kosong. Contoh berikut memakai 8083 dan mengikat Metro ke loopback. Jalankan dari root repo.

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\ACER\AppData\Local\Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
Get-NetTCPConnection -State Listen -LocalPort 8081,8082,8083 -ErrorAction SilentlyContinue
adb devices -l
adb reverse tcp:8083 tcp:8083
npm.cmd start -- --port 8083
```

Di terminal kedua, ulangi tiga baris pengaturan environment lalu jalankan build.

```powershell
npm.cmd run android -- --port 8083 --no-packager --active-arch-only
```

Debug build tanpa konfigurasi Supabase bisa dipakai sebagai demo lokal dengan kredensial di [AUTH_DEVELOPMENT.md](AUTH_DEVELOPMENT.md). Koneksi cloud aktif bila URL dan publishable key valid. Release build memerlukan konfigurasi HTTPS. Siapkan signing key produksi sendiri sebelum distribusi Android karena konfigurasi Gradle bawaan memakai debug key.

## Kontrak API dan penyimpanan

| Kebutuhan | Supabase |
| --- | --- |
| Daftar, login, refresh sesi, dan logout | Auth email/password melalui `@supabase/supabase-js`. Sesi di Android Keystore atau Apple Keychain. |
| Baca koleksi akun | `GET /rest/v1/essenza_account_state` memilih `state,revision`. RLS mengizinkan pembacaan baris milik akun login. |
| Simpan perubahan | `POST /rest/v1/rpc/save_essenza_account_state` menerima `p_state`, `p_expected_revision`, dan `p_expected_user_id`. ID baris selalu diturunkan dari JWT. Parameter ID tambahan memastikan perubahan tertunda dari sesi lama tidak diterapkan ke akun baru. |

Satu snapshot JSONB privat per akun menyimpan profil, preferensi, My Shelf, favorit, journal, scentlists, dan resep Studio. Satu revisi melindungi perubahan snapshot dari penimpaan diam-diam. Jika perangkat lain lebih dulu menyimpan, aplikasi memuat revisi terbaru dan meminta pengguna mengulangi perubahan. Pembacaan awal dan penulisan membutuhkan koneksi.

Katalog dan inferensi Studio tetap lokal. Scentlist cloud bersifat privat dan memakai cover warna. Interaksi dengan kurator demo tetap simulasi, dan data demo perangkat lama tetap terpisah dari akun cloud. Google OAuth dan alur reset kata sandi belum terhubung.

## Verifikasi

- Jalankan `npm run test:ci`. Tes repository mencakup antrean, konflik revisi, penanganan kegagalan, dan identitas akun.
- Jalankan [tes SQL](../supabase/tests/essenza_account_state.sql) pada database development setelah migrasi. Skrip memakai dua akun fixture dalam transaksi yang diakhiri `ROLLBACK`.
- Di Android, masuk sebagai akun uji A, selesaikan onboarding, tambahkan parfum dan catatan pemakaian, tutup lalu buka aplikasi. Logout dan masuk sebagai akun B. Pastikan daftar awal kosong. Masuk kembali sebagai A dan periksa data awalnya.
- Untuk menguji konflik, buka akun A di dua perangkat, simpan dari perangkat pertama lalu ubah koleksi dari perangkat kedua. Perangkat kedua perlu memuat ulang data terbaru sebelum perubahan tersebut dicoba lagi.
