# Alur masuk selama development

Untuk akun sungguhan dan Data API, ikuti [panduan Supabase](SUPABASE_SETUP.md). Catatan ini mendokumentasikan debug build dengan `ESSENZA_LOCAL_DEMO=true`.

Semua file baru untuk alur ini menggunakan JavaScript (`.js`).

- Setiap aplikasi dimulai ulang, animasi logo dari `LaunchSplashScreen.js` diputar.
- Selama belum ada sesi login, setelah animasi logo selalu muncul desain `assets/Design/SplashScreen.svg`. Jadi kedua splash tetap digunakan secara berurutan.
- Geser dari area bawah ke atas untuk membuka login. Flag pernah swipe dicatat, tetapi tidak melewati splash desain sebelum login berhasil.
- Gesture dikenali dari arah gerakan, tanpa menunggu koordinat awal `y0` yang baru tersedia setelah gesture diterima. Splash dan login berbagi progres animasi: splash bergerak ke atas dan login mengikuti jari dari bawah, seolah kedua halaman tersambung. Swipe pendek mengembalikan kedua halaman ke posisi semula; jika penyimpanan gagal, intro tetap dapat dicoba lagi.
- Tombol kembali dari login ke intro membalik animasi vertikal. Login dan register bergeser ke samping saat berpindah atau kembali, dengan isi form tetap tersimpan selama alur tersebut. Setelah login berhasil, halaman masuk memudar menuju onboarding bila profil belum lengkap atau Beranda bila sudah lengkap. Halaman dalam aplikasi juga memakai transisi stack dan tab.
- Background splash animasi logo memakai `#192F24`.
- Animasi logo baru memudar setelah halaman tujuan selesai dimuat dan menerima layout. Pada posisi diam, halaman login/register memakai posisi dan opacity eksplisit agar nilai animasi lama tidak menyembunyikan halaman setelah startup atau Fast Refresh.
- Pembungkus login/register diberi `position: 'absolute'` serta `top/right/bottom/left: 0` secara eksplisit. React Native 0.86 tidak mengekspor `StyleSheet.absoluteFillObject`; menyebarkan nilai yang tidak tersedia itu membuat pembungkus kehilangan ukuran, sehingga form bisa memiliki tinggi nol.
- Login dummy: email **essenza@test.com**, kata sandi **12345678**.
- Sesi dummy tersimpan lokal. Setelah profil dilengkapi, aplikasi yang dibuka ulang menuju Beranda setelah animasi logo.
- Halaman register dapat dicoba dengan nama, email valid, kata sandi minimal 8 karakter, serta konfirmasi yang sama. Registrasi demo mengembalikan pengguna ke formulir login dengan banner berhasil. Kredensial registrasi hanya berlaku dalam sesi aplikasi itu sampai login pertama.
- Di mode demo, tombol Google dan lupa kata sandi menampilkan informasi bahwa fitur tersebut tidak tersedia.
- Teks kebijakan mengikuti desain; tujuan tautannya belum diberikan.

Ilustrasi intro, header, judul, label Google, dan banner berhasil menggunakan SVG dari ekspor final. Kolom isian, tombol, navigasi, dan gesture adalah komponen React Native yang berfungsi. Pada layar pendek atau saat keyboard terbuka, form dapat digulir.

Status intro memakai `@essenza/intro-seen-v1`; sesi dummy memakai `@essenza/auth-session-v1`. Hanya sesi login yang valid dapat melewati splash desain. Kata sandi tidak disimpan. Koleksi lama tetap menggunakan penyimpanan yang sudah ada. Tombol Log Out di Setelan menghapus sesi login. Koleksi lokal tetap tersimpan.

Mode cloud memakai Supabase Auth melalui `src/backend/auth.js`.
