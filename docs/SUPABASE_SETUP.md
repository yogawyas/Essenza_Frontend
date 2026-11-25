# Essenza MCP dengan Supabase

## Jalankan setelah fetch

Checkout `Essenza-MCP`, jalankan `npm ci` dengan Node 22.11 atau lebih baru, lalu rebuild Android atau iOS. Debug build langsung memakai project Supabase development bersama. Konfigurasinya berisi Project URL dan **publishable key**, dengan akses data dibatasi oleh RLS. Migrasi `20261124123447` sudah diterapkan di project tersebut.

Setiap anggota tim masuk memakai akun sendiri. Google Provider perlu diaktifkan satu kali oleh pemilik project. Setelah itu, anggota tim dapat login Google tanpa menyalin Client Secret atau mengubah konfigurasi lokal.

## Pakai project sendiri atau siapkan release

1. Buat project development di organisasi Supabase tim. Gunakan project terpisah dari database produksi.
2. Terapkan [migrasi akun](../supabase/migrations/20261124123447_essenza_account_state.sql) satu kali melalui Supabase CLI atau SQL Editor. Gunakan file yang sama saat menyiapkan database pengembangan baru.
3. Pastikan **Data API** mengekspos schema `public`. Untuk Auth, aktifkan **Email** dan pertahankan **Confirm email**. Biarkan anonymous sign-in nonaktif.
4. Buka **Connect** dan salin **Project URL** serta **Publishable key** (`sb_publishable_...`). Dari root repo, siapkan file konfigurasi lokal.

   ```powershell
   Copy-Item -LiteralPath .env.example -Destination .env
   ```

   Isi `ESSENZA_SUPABASE_URL` dan `ESSENZA_SUPABASE_PUBLISHABLE_KEY` di `.env`. Kedua nilai ini masuk ke bundle mobile. Database password, access token akun Supabase, dan secret/service-role key harus tetap di sisi server. File `.env` sudah diabaikan Git.

5. Hentikan dan jalankan ulang Metro setiap kali mengubah `.env`. Jalankan CocoaPods di macOS sebelum rebuild iOS.

SMTP bawaan Supabase membatasi penerima ke alamat anggota tim. Gunakan alamat anggota tim untuk menguji email konfirmasi. Untuk uji login dan isolasi data, admin development juga bisa membuat dua akun uji terkonfirmasi dari **Authentication → Users**. Sebelum registrasi publik, siapkan [SMTP khusus](https://supabase.com/docs/guides/auth/auth-smtp) dan Site URL HTTPS yang sesuai untuk konfirmasi.

## Aktifkan Google satu kali per project

1. Di **Google Auth Platform → Clients**, buat kredensial OAuth tipe **Web application** pada project milik tim. Pakai callback Supabase project tersebut sebagai **Authorized redirect URI**. Untuk development bersama, nilainya `https://axoltjflgfycfathqued.supabase.co/auth/v1/callback`. Di **Data Access**, pastikan scope identitas `openid`, email, dan profil tersedia.
2. Di **Supabase → Auth → Sign In / Providers → Google**, aktifkan provider dan isi **Client ID** serta **Client Secret** dari Google. Simpan secret di Supabase.
3. Di **Supabase → Auth → URL Configuration → Redirect URLs**, tambahkan persis `com.essenza.app://auth/callback`. App memakai browser sistem, meminta akses dasar identitas, dan menukar kode lewat PKCE S256.
4. Pastikan pengaturan **Audience** di Google mengizinkan akun anggota tim. Uji dengan memilih akun di Google, kembali ke aplikasi, lalu simpan dan buka ulang satu item koleksi. Untuk menguji penautan identitas, gunakan alamat Google yang sama dengan akun email Essenza yang sudah terverifikasi dan periksa koleksi yang sudah ada.

[Panduan Google Provider Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google) · [Pengaturan Google OAuth Audience](https://support.google.com/cloud/answer/15549945)

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

Untuk mode demo lokal, set `ESSENZA_LOCAL_DEMO=true` di `.env` pada debug build. Kredensial demo ada di [AUTH_DEVELOPMENT.md](AUTH_DEVELOPMENT.md). Release build memerlukan konfigurasi HTTPS eksplisit. Siapkan signing key produksi sendiri sebelum distribusi Android karena konfigurasi Gradle bawaan memakai debug key.

## Kontrak API dan penyimpanan

| Kebutuhan | Supabase |
| --- | --- |
| Daftar, login, refresh sesi, dan logout | Auth email/password dan Google melalui `@supabase/supabase-js`. Sesi di Android Keystore atau Apple Keychain. |
| Baca koleksi akun | `GET /rest/v1/essenza_account_state` memilih `state,revision`. RLS mengizinkan pembacaan baris milik akun login. |
| Simpan perubahan | `POST /rest/v1/rpc/save_essenza_account_state` menerima `p_state`, `p_expected_revision`, dan `p_expected_user_id`. ID baris selalu diturunkan dari JWT. Parameter ID tambahan memastikan perubahan tertunda dari sesi lama tidak diterapkan ke akun baru. |

Satu snapshot JSONB privat per akun menyimpan profil, preferensi, My Shelf, favorit, journal, scentlists, dan resep Studio. Satu revisi melindungi perubahan snapshot dari penimpaan diam-diam. Jika perangkat lain lebih dulu menyimpan, aplikasi memuat revisi terbaru dan meminta pengguna mengulangi perubahan. Pembacaan awal dan penulisan membutuhkan koneksi.

Katalog dan inferensi Studio tetap lokal. Scentlist cloud bersifat privat dan memakai cover warna. Interaksi dengan kurator demo tetap simulasi, dan data demo perangkat lama tetap terpisah dari akun cloud. Alur reset kata sandi belum terhubung.

## Verifikasi

- Jalankan `npm run test:ci`. Tes repository mencakup antrean, konflik revisi, penanganan kegagalan, dan identitas akun.
- Jalankan [tes SQL](../supabase/tests/essenza_account_state.sql) pada database development setelah migrasi. Skrip memakai dua akun fixture dalam transaksi yang diakhiri `ROLLBACK`.
- Di Android, masuk sebagai akun uji A, selesaikan onboarding, tambahkan parfum dan catatan pemakaian, tutup lalu buka aplikasi. Logout dan masuk sebagai akun B. Pastikan daftar awal kosong. Masuk kembali sebagai A dan periksa data awalnya.
- Untuk menguji konflik, buka akun A di dua perangkat, simpan dari perangkat pertama lalu ubah koleksi dari perangkat kedua. Perangkat kedua perlu memuat ulang data terbaru sebelum perubahan tersebut dicoba lagi.
