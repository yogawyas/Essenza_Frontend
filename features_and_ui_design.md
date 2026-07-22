# Fitur & Desain Antarmuka Essenza ("Spotify-nya Parfum")

Berikut adalah penjabaran fitur Essenza yang dirancang 100% untuk B2C (Konsumen), beserta bayangan desain UI/UX-nya untuk memberikan pengalaman seperti menggunakan Spotify atau aplikasi gaya hidup modern.

---

## 1. Onboarding & Pembuatan "Scent DNA" (Mirip Spotify 'Pilih Artis Favorit')
*   **Tujuan:** Mengumpulkan data preferensi awal pengguna untuk melatih *Random Forest* tanpa membuat pengguna merasa sedang mengisi formulir kaku.
*   **Tampilan UI/UX:** 
    *   Saat pertama kali mendaftar, layar dipenuhi oleh **Bubble interaktif** berisi gambar parfum ikonik atau ilustrasi suasana (misal: "Pantai Tropis", "Kabin Kayu", "Toko Roti").
    *   Pengguna diminta mengetuk minimal 3 *bubble* yang mereka suka. *Bubble* yang dipilih akan membesar dan menyala.
    *   Setelah selesai, muncul animasi *loading* elegan berbunyi: *"Membangun Scent DNA Anda..."* sebelum masuk ke Beranda.

## 2. Beranda Utama (Home - "Discover Your Next Signature Scent")
*   **Tujuan:** Menampilkan rekomendasi harian berbasis ML dan memudahkan penemuan parfum baru.
*   **Tampilan UI/UX:**
    *   **Daily Mix:** Baris horizontal (*Carousel*) bergaya *cover* album bertuliskan **"Scent Mix for You"**. Berisi 5 parfum yang direkomendasikan hari itu.
    *   **Skor Kecocokan (Match Score):** Di pojok setiap kartu parfum, terdapat indikator lingkaran persentase berwarna hijau menyala (misal: **"92% Match"**).
    *   **Trending Dupes:** *Carousel* terpisah yang menampilkan parfum lokal alternatif yang sedang ramai di-upvote oleh komunitas minggu ini.

## 3. Halaman Detail Parfum & "Dupe Radar" (Mirip "Now Playing")
*   **Tujuan:** Menampilkan detail komposisi (*notes*) dan jembatan menuju monetisasi (*Affiliate*).
*   **Tampilan UI/UX:**
    *   Gambar botol parfum mendominasi layar dengan latar belakang gradien yang menyesuaikan warna botol utama (adaptif seperti UI Spotify).
    *   **Scent DNA Visual:** Alih-alih daftar teks panjang, *notes* ditampilkan sebagai **Radar Chart** (Grafik Jaring Laba-laba) untuk menunjukkan dominasi wangi (Woody, Citrus, Floral, Sweet).
    *   **Dupe Radar (Tombol FAB):** Tombol melayang di bawah layar. Jika ditekan, akan memunculkan laci dari bawah (*Bottom Sheet*) berisi daftar parfum lokal/terjangkau yang 90%+ mirip.
    *   **Tombol Konversi:** Tombol besar bertuliskan **"Beli di Shopee/Tokopedia"** di sebelah tombol *Add to Wardrobe*.

## 4. Virtual Perfume Wardrobe (Mirip Halaman "Your Library")
*   **Tujuan:** Lemari digital tempat pengguna mencatat koleksi mereka (yang menjadi sumber data utama aplikasi).
*   **Tampilan UI/UX:**
    *   Terdapat 3 *Tab* navigasi: **"Have"** (Koleksi Saat Ini), **"Had"** (Pernah Punya), **"Want"** (Wishlist).
    *   Tampilannya *grid* estetis menampilkan foto-foto botol parfum.
    *   Di bagian atas layar, terdapat ringkasan AI: *"Koleksimu didominasi oleh wangi Vanilla (40%) dan White Floral (30%)."*

## 5. Mix & Match / Layering Studio (Mirip Fitur "Blend")
*   **Tujuan:** Fitur andalan yang menyarankan pengguna menyemprotkan dua parfum berbeda secara bersamaan untuk menghasilkan wangi unik.
*   **Tampilan UI/UX:**
    *   Layar interaktif (*drag-and-drop*). Pengguna menyeret dua parfum dari lemari digital mereka ke lingkaran di tengah layar.
    *   Muncul animasi percampuran warna, diikuti hasil prediksi model: *"Percampuran ini sangat cocok! Menghasilkan aroma mirip [Parfum Mahal X] dengan ketahanan 8 jam."*

## 6. Komunitas & Validasi Dupe (Validasi Data Latih)
*   **Tujuan:** Mengumpulkan *labeled data* (kemiripan/dupe) dari pengguna secara organik untuk melatih ulang model Random Forest agar semakin presisi.
*   **Tampilan UI/UX:**
    *   Setiap kali pengguna melihat daftar rekomendasi *dupe*, terdapat pertanyaan *pop-up* sederhana bergaya Tinder: *"Apakah parfum ini mirip dengan aslinya? 👍 Mirip | 👎 Beda Jauh"*
    *   Terdapat indikator sosial di setiap *dupe* (misal: "Disetujui oleh 450 orang").

---

## 7. Penyesuaian Kode Frontend Saat Ini (`App.js`)
Setelah meninjau kode `App.js` versi sekarang, berikut adalah fitur-fitur yang **harus dihapus atau dirombak total** agar sesuai dengan visi 100% B2C ("Spotify-nya Parfum"):

**❌ Yang Harus Dihapus:**
1.  **Mode Chemist / Pro Mode:** Antarmuka yang memungkinkan input rumus kimia (SMILES) seperti `CC(=CCC/C(=C/CO)C)C`. Ini terlalu rumit untuk pengguna awam dan lebih cocok untuk B2B/Pakar.
2.  **Data Molekul (`NOTE_MOLECULES`):** Data senyawa seperti *Linalool, Geraniol, Eugenol* tidak lagi relevan. Pengguna B2C hanya peduli pada kategori wangi yang mudah dipahami (Floral, Woody, Sweet, dll).
3.  **Teks "Scent Profile Predictor" yang Kaku:** Harus diganti dengan *tagline* yang lebih gaya hidup, misalnya *"Discover Your Signature Scent"*.

**🔄 Yang Harus Disinkronkan / Ditambahkan:**
1.  **Ubah Alur Awal (State):** Daripada langsung masuk ke pencarian wangi, aplikasi harus dibuka dengan **Halaman Onboarding (Pilih Bubble Notes/Parfum)** untuk membangun *Scent DNA* awal mereka.
2.  **Tambahkan Mock Data "Virtual Wardrobe":** Buat *state* baru di React Native (misal: `const [wardrobe, setWardrobe] = useState([])`) agar pengguna bisa menyimpan `PERFUME_DB` ke dalam koleksi pribadi mereka.
3.  **Ubah Tampilan Hasil (Rekomendasi):** Hasil rekomendasi jangan hanya ditampilkan sebagai daftar (*list*) sederhana, tapi diubah menjadi desain *Carousel* horizontal ala "Daily Mix" di Spotify.
