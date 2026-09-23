# Draf Strategi & Fitur Skripsi B2B (Computational Olfaction)

Dokumen ini merangkum haluan baru untuk aplikasi **Essenza**, yang kini difokuskan sebagai alat *Business-to-Business* (B2B) untuk industri parfum (Laboratorium R&D & Perfumer).

---

## 1. Visi Utama
Menjadi **"Simulator Laboratorium Penciuman Digital"** (Digital Scent Lab). Essenza membantu Perfumer mensimulasikan hasil pencampuran (*blending*) senyawa kimia murni secara komputasi sebelum melakukan eksperimen fisik yang memakan biaya dan waktu.

## 2. Keunggulan Akademis & Utama (USP)
*   **Input Saintifik:** Tidak lagi menggunakan nama parfum, melainkan struktur molekul kimia murni dalam format teks **SMILES** (Simplified Molecular-Input Line-Entry System).
*   **Prediksi Campuran (Forward Prediction):** Mampu memproses input lebih dari satu senyawa beserta bobot rasio (persentase tetesan) untuk menebak label klasifikasi aroma (Misal: 70% Floral, 30% Woody).
*   **Machine Learning (Random Forest):** Menggunakan algoritma *Random Forest* dari `scikit-learn` yang stabil dan kebal terhadap *overfitting* saat menangani data berdimensi tinggi (mengubah SMILES menjadi vektor *Morgan Fingerprints* menggunakan `RDKit`).
*   **Posisi dalam Penelitian Kelompok (Steering):** Skripsi ini merupakan bagian dari payung penelitian (group research) yang mengomparasikan berbagai arsitektur AI untuk data kimia. Model **Random Forest** (milik saya) akan dikomparasikan performanya secara *head-to-head* dengan hasil penelitian rekan tim lain yang menggunakan model **XGBoost** & **LightGBM**, dan **Neural Network (NN)**, untuk menentukan algoritma *State-of-the-Art* terbaik dalam simulasi *Olfactory*.

---

## 3. Fitur Utama & Desain UI

### A. Experiment Bench (Meja Kerja Eksperimen)
*   **Tujuan:** Area tempat *Perfumer* mencampur bahan kimia.
*   **Tampilan:**
    *   **Senyawa Picker:** *Dropdown/Search bar* untuk memilih senyawa (berdasarkan nama atau langsung *paste* kode SMILES).
    *   **Rasio Slider (Input Bobot):** Pengguna mengatur bobot setiap senyawa (misal: Senyawa A = 80%, Senyawa B = 20%).
    *   **Tombol "Predict Blend":** Memulai proses konversi *RDKit* dan menembak model *Random Forest* di backend.

### B. Lab Results (Hasil Prediksi AI)
*   **Tujuan:** Menampilkan hasil prediksi ke *Perfumer*.
*   **Tampilan:**
    *   **Radar Chart Aroma:** Visualisasi grafis persentase wangi hasil percampuran (menunjukkan dominasi bau).
    *   **Confidence Score:** Menampilkan tingkat keyakinan probabilitas (*probability score*) dari model ML.

### C. Scale-Up Calculator (Kalkulator Formulasi Produksi)
*   **Tujuan:** Fitur utilitas (Non-ML) untuk mengonversi rasio wangi yang berhasil menjadi instruksi volume absolut.
*   **Cara Kerja:**
    *   Pengguna memasukkan **Target Volume (misal: 1000 ml atau 50 gram)**.
    *   Sistem menghitung rasio hasil eksperimen (misal: 80% dan 20%) ke dalam volume nyata:
        *   Ambroxan: 800 ml
        *   Lemon: 200 ml
    *   **Kelebihan Skripsi:** Menunjukkan bahwa aplikasi sangat "Siap Pakai" untuk industri nyata (B2B), menjembatani antara eksperimen AI (*Rasio*) dan produksi fisik pabrik (*Volume Mutlak*).

### D. Lab Notebook (Riwayat Eksperimen)
*   **Tujuan:** Menyimpan data racikan yang sudah diuji secara digital.
*   **Tampilan:** Daftar log eksperimen yang bisa dilihat kembali. *Perfumer* bisa mencatat apakah tebakan AI ini akurat setelah ia meracik fisiknya di dunia nyata (berfungsi sebagai validasi *human-in-the-loop*).

---

## 4. Perubahan Teknis yang Dibutuhkan Nanti (Jangan Dieksekusi Dulu)
*(Ini adalah catatan untuk kita berdua kelak)*
1.  **Backend (`AI_PROMPT.txt`):** Harus ditulis ulang agar AI fokus membangun REST API Python dengan `FastAPI`, `RDKit`, dan `scikit-learn` (Random Forest Classifier).
2.  **Dataset:** Kita harus membuang dataset nama parfum jadi (seperti Fragrantica), dan fokus hanya menggunakan dataset kimia berlabel bau (seperti *Leffingwell* atau *GoodScents/Pyrfume*).
3.  **Frontend:** UI harus dirombak menghapus konsep "Lemari Parfum Pengguna Biasa" menjadi "Dashboard Laboratorium".
