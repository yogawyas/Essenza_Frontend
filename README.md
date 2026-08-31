# 🌿 Essenza Frontend

Aplikasi mobile React Native untuk skripsi mengenai Prediksi Multi-Label Profil Aroma menggunakan *Machine Learning* dan *Morgan Fingerprint*.

Repository ini adalah tempat di mana UI (User Interface) aplikasi disatukan dengan *logic* backend prediksi ML.

## 🚀 Fitur Utama
1. **Chemist Mode (Active):** Memprediksi profil aroma senyawa secara langsung (on-device) berdasarkan input *SMILES string*.
   - **Alur Kerja:**
     1. User memasukkan *SMILES string*.
     2. App memanggil Hugging Face Space `marvelkn/essenza-fingerprint-api` melalui protokol antrean Gradio untuk mengekstrak 2.048-bit *Morgan Fingerprint* dan 5 deskriptor fisika. RDKit tidak berjalan secara native di React Native.
     3. Vektor 2.053 fitur diumpankan ke **110 model XGBoost (format ONNX)** yang berada secara lokal (*on-device*) di dalam HP.
     4. ONNX Runtime memberikan skor probabilitas untuk 110 label aroma tanpa mengirim inferensi model ke server.
2. **Explorer Mode (Active):** Rekomendasi parfum berdasarkan kombinasi label aroma favorit menggunakan basis data SQLite lokal.

## 🛠️ Stack Teknologi
- **Frontend:** React Native (v0.86), React Native Reanimated.
- **On-Device ML:** `onnxruntime-react-native` (Microsoft ONNX Runtime).
- **Backend API:** `axios` ke Hugging Face Gradio queue (`/call/predict`).
- **File/model access:** `react-native-fs`.

## 📁 Struktur Folder Relevan
- `android/app/src/main/assets/models/`: Tempat 110 file `.onnx` (model ML).
- `src/services/InferenceService.ts`: Menangani antrean fingerprint API Hugging Face dan eksekusi model ONNX secara on-device.
- `src/assets/metadata/xgb_meta.json`: Metadata threshold dari 110 model XGBoost.
- `App.js`: Komponen UI utama (termasuk Chemist Mode dan Error Handling Modal).

## 🧪 Cara Menjalankan Aplikasi
1. Pastikan Metro Bundler sedang berjalan (port 8081 bebas).
2. Jalankan perintah di bawah untuk me-compile dan meng-install ke Android:
```bash
npm install
cd android && ./gradlew clean installDebug
```

> **Catatan:** Jangan menjalankan `npm run android` langsung jika Metro belum menyala, karena fitur interaktif prompt port RN 0.86 dapat membuat build tertahan (hang).

---
*(Proyek ini merupakan iterasi akhir yang menggabungkan desain UI awal dengan backend dari repository `AromaML` yang sudah usang).*
