# 🌿 Essenza Frontend

Aplikasi mobile React Native untuk skripsi mengenai Prediksi Multi-Label Profil Aroma menggunakan *Machine Learning* dan *Morgan Fingerprint*.

Repository ini adalah tempat di mana UI (User Interface) aplikasi disatukan dengan *logic* backend prediksi ML.

## 🚀 Fitur Utama
1. **Chemist Mode (Active):** Memprediksi profil aroma senyawa secara langsung (on-device) berdasarkan input *SMILES string*.
   - **Alur Kerja:**
     1. User memasukkan *SMILES string*.
     2. App memanggil API Railway (dari repo `Perfume-MultiLabel-Classifier`) untuk mengekstrak vektor *Morgan Fingerprint* dan 5 deskriptor fisika karena RDKit tidak berjalan secara native di React Native.
     3. Vektor fitur diumpankan ke **25 model XGBoost (format ONNX)** yang berada secara lokal (*on-device*) di dalam HP.
     4. ONNX Runtime memberikan skor probabilitas untuk 25 label aroma.
2. **Explorer Mode (Coming Soon):** Rekomendasi parfum berdasarkan kombinasi label aroma favorit (*Odor Notes*).

## 🛠️ Stack Teknologi
- **Frontend:** React Native (v0.86), React Native Reanimated.
- **On-Device ML:** `onnxruntime-react-native` (Microsoft ONNX Runtime).
- **Backend API:** `axios`, `react-native-fs`.

## 📁 Struktur Folder Relevan
- `android/app/src/main/assets/models/`: Tempat 25 file `.onnx` (model ML).
- `src/services/InferenceService.ts`: Jantung utama aplikasi. Menangani fetching API Railway dan eksekusi model ONNX secara on-device.
- `src/assets/metadata/xgb_meta.json`: Metadata threshold dan thresholds dari 25 model XGBoost.
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
