# Fitur & Desain Antarmuka Essenza ("Digital Scent Lab")

Berikut adalah penjabaran fitur Essenza yang telah difokuskan menjadi **Sistem Prediksi Pencampuran Aroma Berbasis SMILES**. Desain antarmukanya berfokus pada pengalaman "Eksperimen Laboratorium Digital", dengan tetap mempertahankan estetika mewah dan elegan (Dark Mode & Emas).

---

## 1. Onboarding & Pengenalan Lab
*   **Tujuan:** Mengenalkan pengguna pada konsep eksperimen wewangian secara digital.
*   **Tampilan UI/UX:** 
    *   Tampilan elegan dengan palet warna hitam dan emas.
    *   Pengguna disambut dengan teks: *"Welcome to the Digital Scent Lab. Discover what happens when you mix molecules."*
    *   Animasi struktur molekul/SMILES sederhana (berbentuk garis dan heksagon) yang bersinar di latar belakang.

## 2. Experiment Bench (Halaman Utama)
*   **Tujuan:** Area kerja utama tempat pengguna melakukan simulasi percampuran *notes*/senyawa.
*   **Tampilan UI/UX:**
    *   **Molecule Picker:** Daftar kartu *notes* (Vanilla, Linalool, Citrus, dll). Pengguna bisa memilih 2 atau lebih notes.
    *   **Ratio Sliders:** Setiap notes yang dipilih akan memunculkan *slider* interaktif. Pengguna bisa mengatur persentase (misalnya: 60% Vanillin, 40% Bergamot).
    *   **Tombol "Predict Mixture":** Tombol emas di tengah bawah layar. Saat ditekan, sistem backend memproses struktur SMILES dan meneruskannya ke algoritma Random Forest. Animasi *loading* elegan berbunyi *"Simulating Chemical Interactions..."*.

## 3. Lab Results (Hasil Prediksi AI)
*   **Tujuan:** Menampilkan hasil prediksi Machine Learning berdasarkan campuran SMILES dari pengguna.
*   **Tampilan UI/UX:**
    *   **Odor Profile Radar:** Menampilkan *Radar Chart* yang memvisualisasikan keluarga aroma dominan (contoh: ujung jaring tertarik ke arah Woody 70%, Floral 20%, Sweet 10%).
    *   **Compound Match:** Daftar parfum komersial (dari dataset FragDB) yang komposisi kimianya paling mendekati profil hasil campuran eksperimen pengguna (misal: *"Prediksi: Campuran Anda memiliki 92% kecocokan dengan profil aroma YSL Black Opium"*).
    *   Terdapat tombol **"Save to Notebook"** untuk menyimpan hasil eksperimen.

## 4. Lab Notebook (Pengganti Wardrobe)
*   **Tujuan:** Lemari/Jurnal digital tempat pengguna menyimpan log catatan riwayat eksperimen (racikan) mereka.
*   **Tampilan UI/UX:**
    *   Daftar (*list*) berbentuk jurnal/buku catatan elegan. 
    *   Setiap kartu entri bertuliskan nama eksperimen (misal: "Experiment #04 - Sweet Wood"), menampilkan rasio inputnya, dan hasil prediksinya.
    *   Pengguna dapat memberi catatan manual pada log tersebut.

## 5. Peer Validation (Fitur Komunitas)
*   **Tujuan:** Validasi algoritma dari pengguna sungguhan (*Human-in-the-loop*).
*   **Tampilan UI/UX:**
    *   Area publik di mana pengguna bisa mempublikasikan hasil eksperimen mereka.
    *   Pengguna lain bisa melihat hasil tersebut dan memberikan *Vote* (Validasi): *"Apakah racikan ini secara logika wangi masuk akal? 👍 Ya | 👎 Tidak"*.
    *   Data ini akan digunakan untuk menyempurnakan bobot prediksi Random Forest di masa depan.

---

## 7. Penyesuaian Kode Frontend Saat Ini (`App.js`)

**🔄 Yang Harus Dirombak:**
1.  **Navigasi Utama:** Ubah nama *tab* navigasi dari `Home` dan `Wardrobe` menjadi `ExperimentBench` dan `LabNotebook`.
2.  **Layar Utama:** Hapus `HomeScreen.js` yang lama (berisi Daily Mix). Buat layar baru bernama `ExperimentBenchScreen.js` yang mengakomodasi pemilihan notes dan pengaturan persentase (Sliders).
3.  **Tampilan Hasil:** Sesuaikan `PerfumeDetailScreen.js` menjadi `LabResultScreen.js` yang menonjolkan visualisasi *Radar Chart* dari profil wangi hasil eksperimen.
