# Essenza B2B Product Roadmap

Dokumen ini adalah sumber keputusan produk, urutan implementasi, status pekerjaan, dan hubungan aplikasi dengan penelitian skripsi. Baca dokumen ini sebelum memulai pekerjaan pada repository. Perbarui setelah implementasi atau keputusan produk berubah.

## Metadata

| Atribut | Nilai |
| --- | --- |
| Pemilik penelitian | Marvel Kevin Nathanael |
| Produk | Essenza, prototipe Android berbasis React Native |
| Target pengguna | UMKM atau peracik parfum independen yang memakai bahan aroma dengan identitas senyawa yang diketahui |
| Repository ML | `Perfume-MultiLabel-Classifier` |
| Fokus penelitian | Perbandingan XGBoost dan LightGBM untuk klasifikasi aroma multi-label |
| Unit prediksi tervalidasi | Satu molekul terhubung yang direpresentasikan sebagai SMILES |
| Status dokumen | Rencana implementasi; fitur formulasi B2B belum diimplementasikan |
| Terakhir diperbarui | 5 September 2026 |

Dokumen ide partner di `C:\Users\ACER\Downloads\AGENTS.md` merupakan referensi brainstorming. Pernyataan tentang Random Forest, Classifier Chains, atau identitas Yoga bukan keputusan penelitian ini dan tidak menggantikan konteks di atas.

## Visi Produk

Essenza membantu peracik parfum:

1. menemukan dan memeriksa bahan dengan identitas molekul yang jelas;
2. melihat prediksi label aroma setiap molekul;
3. menyusun serta menghitung rancangan formulasi;
4. membandingkan bahan atau versi formula; dan
5. menyimpan catatan hasil percobaan fisik.

Produk adalah alat bantu eksplorasi dan dokumentasi. Produk belum menggantikan GC-MS, GC-olfactometry, evaluasi sensori, pemeriksaan keselamatan bahan, atau keputusan ahli parfum.

## Realitas Model dan Batas Klaim

Pipeline ilmiah saat ini:

```text
SMILES satu molekul
  -> validasi dan kanonisasi RDKit
  -> Morgan fingerprint 2.048 bit + 5 deskriptor
  -> 2.053 fitur float32
  -> 25 model biner XGBoost atau LightGBM
  -> skor dan threshold per label aroma
```

Model adalah prediktor maju: **molekul menjadi skor label aroma**. Model bukan prediktor invers yang menghasilkan resep dari target aroma.

Ketentuan tampilan dan bahasa produk:

- Skor model bukan persentase komposisi, kekuatan bau, atau probabilitas persepsi manusia yang sudah terkalibrasi.
- Prediksi dapat mempunyai banyak label dan nilainya tidak harus berjumlah 100%.
- Persentase pada formula menyatakan proporsi bahan dengan basis yang dipilih, bukan persentase karakter aroma.
- Beberapa bahan disimpan sebagai daftar komponen. Mencampurkan bahan tidak otomatis menghasilkan senyawa baru atau satu SMILES baru.
- Senyawa baru hanya boleh dianalisis apabila struktur produk kimianya memang diketahui dan diberikan sebagai SMILES tersendiri. Aplikasi tidak memprediksi reaksi kimia.
- Essential oil, bibit parfum, atau premix dengan komposisi tidak diketahui tidak boleh diwakili sebagai satu molekul hanya berdasarkan nama dagang.
- Top, middle, base note, volatilitas, ketahanan, keamanan, dan performa campuran bukan keluaran model saat ini.

## Input dan Output yang Direncanakan

### Input satu bahan

Pengguna dapat memilih bahan dari pustaka atau memasukkan SMILES secara manual. Pencarian nama melalui PubChem boleh digunakan untuk membantu menemukan kandidat, tetapi identitas yang ambigu harus ditolak atau diminta menggunakan SMILES terverifikasi.

```ts
type Compound = {
  id: string;
  displayName: string;
  canonicalSmiles: string;
  molecularFormula: string | null;
  molecularWeight: number | null;
  sourceName: string;
  sourceUrl: string;
  identityStatus: "verified" | "user_provided";
};
```

### Input formulasi

Pengguna dapat menambahkan banyak senyawa. Setiap komponen tetap mempunyai identitas dan SMILES sendiri.

```ts
type FormulaComponent = {
  compoundId: string;
  amountPercent: number;
  basis: "mass";
};

type Formulation = {
  id: string;
  name: string;
  version: number;
  batchMassGrams: number;
  components: FormulaComponent[];
  status: "draft" | "physically_tested";
};
```

MVP memakai persen massa. Konversi volume hanya boleh ditambahkan jika densitas bahan atau larutan stok tersedia dan sumber nilainya dicatat.

### Output analisis molekul

Frontend perlu menyimpan seluruh skor label, termasuk skor di bawah threshold, agar bahan dapat dibandingkan dan metode agregasi dapat dihitung tanpa kehilangan informasi.

```ts
type MoleculeAnalysis = {
  compoundId: string;
  canonicalSmiles: string;
  featureSchemaId: string;
  bundleId: string;
  scoreKind: "uncalibrated_label_score";
  labels: Array<{
    label: string;
    score: number;
    threshold: number;
    selected: boolean;
  }>;
};
```

UI menggunakan istilah **skor model**. UI tidak menampilkan `80% floral` hanya karena skor label bernilai `0.80`.

## Alur Pengguna MVP

```text
Pustaka Bahan
  -> pilih atau tambahkan senyawa terverifikasi
  -> lihat analisis setiap molekul
  -> masukkan bahan ke Meja Formulasi
  -> tentukan proporsi dan ukuran batch
  -> simpan versi formula
  -> catat hasil percobaan fisik di Buku Percobaan
```

Empat layar inti:

| Layar | Tanggung jawab |
| --- | --- |
| Pustaka Bahan | Cari bahan, lihat identitas, sumber, SMILES, dan status dukungan prediksi. |
| Meja Formulasi | Kelola komponen, proporsi massa, total 100%, ukuran batch, dan duplikasi versi. |
| Analisis Bahan | Tampilkan seluruh skor aroma per molekul dan perbandingan antarbahan. |
| Buku Percobaan | Simpan snapshot formula, versi model, catatan fisik, dan status pengujian. |

Diagram batang berurutan menjadi tampilan utama skor. Radar chart bersifat opsional, memakai sumbu tetap, dan tetap diberi label `skor model`.

## Arsitektur dan Integrasi

Arsitektur yang dipertahankan:

```text
React Native
  -> API menghitung fitur RDKit dari satu SMILES
  -> frontend memeriksa feature_schema_id
  -> ONNX Runtime menjalankan model pada ponsel
  -> frontend menyimpan hasil bersama bundle_id
```

REST API yang dituju:

```http
POST /fingerprint
Content-Type: application/json
```

```json
{
  "smiles": "COC1=C(C=CC(=C1)C=O)O",
  "feature_schema_id": "ID_DARI_MANIFEST_MODEL"
}
```

Respons memuat SMILES kanonik, rumus, berat molekul, spesifikasi dan ID fitur, serta vektor berisi 2.053 nilai. Rasio formula, ukuran batch, dan catatan pengguna tidak dikirim ke API fitur.

Modul target:

| Modul | Tanggung jawab |
| --- | --- |
| `CompoundRepository` | Katalog bahan, identitas, jenis bahan, dan provenance. |
| `FeatureApiClient` | REST, timeout, pembatalan, error, dan kecocokan skema fitur. |
| `InferenceService` | ONNX serta seluruh skor label dan metadata bundle. |
| `FormulationService` | Validasi komponen, proporsi, basis, batch, dan versi. |
| `ProfileAggregationService` | Estimasi campuran eksperimental yang mempunyai versi metode. |
| `ExperimentRepository` | Formula, snapshot analisis, catatan, dan migrasi penyimpanan. |

Cache fitur harus dikunci oleh SMILES kanonik dan `feature_schema_id`. Cache analisis harus dikunci oleh identitas fitur dan `bundle_id`. Riwayat eksperimen menyimpan snapshot sehingga tidak berubah diam-diam ketika model diperbarui.

## Estimasi Campuran Eksperimental

Metode awal yang boleh diteliti setelah MVP menggunakan rata-rata tertimbang skor komponen:

```text
estimasi_label[j] = jumlah(weight[i] * score[i][j])
jumlah(weight) = 1
```

Metode ini harus:

- memakai seluruh skor sebelum threshold;
- menyimpan `method_id`, versi, basis proporsi, bundle model, dan skor komponen;
- menampilkan penjelasan bahwa hasil merupakan estimasi dari profil komponen;
- tidak memakai threshold molekul sebagai threshold campuran tanpa validasi; dan
- tidak disebut prediksi campuran tervalidasi sebelum dibandingkan dengan data atau pengujian campuran.

Metode tidak memodelkan reaksi, interaksi nonlinear, pelarut, konsentrasi udara, penguapan, temperatur, efek waktu, suppression, masking, atau emergence.

Dasar penelitian yang mendukung eksplorasi, beserta batasnya:

- Keller et al. (2017) mendukung prediksi persepsi dari fitur kimia molekul tunggal: https://doi.org/10.1126/science.aal2014
- Hamel et al. (2024) mendukung data olfaksi yang terstruktur dan dapat ditelusuri melalui Pyrfume: https://doi.org/10.1038/s41597-024-04051-z
- Suh et al. (2025) mendukung klasifikasi multi-label dan perbandingan model berbasis fingerprint untuk odor decoding: https://doi.org/10.1038/s42004-025-01651-7
- Dhurandhar et al. (2023) memakai profil semantik komponen dan model tambahan untuk diskriminabilitas campuran: https://doi.org/10.1093/chemse/bjad018
- Ravia et al. (2020) mempelajari kemiripan campuran melalui data persepsi manusia: https://doi.org/10.1038/s41586-020-2891-7
- Pellegrino et al. (2026) melaporkan baseline linear profil komponen pada data campuran, tetapi masih berupa preprint: https://doi.org/10.64898/2026.07.03.736426
- Rodrigues et al. (2021) menjelaskan bahwa performa parfum juga melibatkan kesetimbangan cair-uap, difusi, ambang deteksi, dan psikofisika: https://doi.org/10.3390/molecules26113095

## Pencarian Berbasis Target Aroma

Tahap awal bukan generator resep. Pengguna memilih label target, lalu aplikasi memberi peringkat bahan yang sudah dianalisis berdasarkan kecocokan skor maju. Hasil disebut **kandidat bahan untuk diuji**.

Pencarian rasio formula baru dilakukan setelah metode campuran mempunyai fungsi penilaian dan evaluasi yang memadai. Sistem pencarian harus membatasi kandidat pada bahan yang tersedia dan tidak mengklaim menemukan formula optimal secara sensori.

## Roadmap Implementasi

Arti status:

- `SELESAI`: kriteria penerimaan terpenuhi dan bukti dicatat.
- `AKTIF`: sedang dikerjakan.
- `BERIKUTNYA`: prioritas implementasi berikut.
- `RENCANA`: sudah didefinisikan tetapi belum menjadi prioritas terdekat.
- `TERTUNDA`: menunggu dependency atau bukti lain.

### Tahap 0 — Fondasi model yang dapat dipercaya

| ID | Status | Pekerjaan | Kriteria penerimaan / bukti |
| --- | --- | --- | --- |
| P0.1 | TERTUNDA | Jalankan eksperimen XGBoost dan LightGBM terbaru | Baseline, studi Optuna, fitting, dan test lengkap. Training saat ini belum dimulai karena sensor suhu CPU belum tersedia. |
| P0.2 | TERTUNDA | Pilih dan ekspor bundle model | Kandidat dipilih dari validasi, ekspor seluruh label lolos parity Python-ONNX, manifest lengkap. Bergantung pada P0.1. |
| P0.3 | BERIKUTNYA | Ubah inferensi agar mengembalikan seluruh skor | Semua model mengembalikan skor, threshold, dan status selected; test mencakup skor di bawah threshold. Dapat dikerjakan dengan bundle historis lalu diverifikasi ulang pada bundle baru. |
| P0.4 | BERIKUTNYA | Sederhanakan klien fitur ke REST `/fingerprint` | Request, respons, timeout, pembatalan, error 422/503, dan mismatch skema diuji. |
| P0.5 | TERTUNDA | Validasi Android aktual | Build berhasil, fresh install, cache upgrade, inferensi, parity, latensi, RAM, dan kondisi jaringan diuji. NDK dan kompatibilitas native masih perlu disiapkan. |

### Tahap 1 — MVP B2B

| ID | Status | Pekerjaan | Kriteria penerimaan / bukti |
| --- | --- | --- | --- |
| M1.1 | RENCANA | Definisikan model domain bahan dan formula | Tipe memisahkan senyawa tunggal, larutan stok, dan bahan komposisi tidak diketahui. |
| M1.2 | RENCANA | Bangun Pustaka Bahan | Ada pencarian, provenance, status identitas, SMILES, serta jalur input manual yang tervalidasi. |
| M1.3 | RENCANA | Bangun Meja Formulasi | Banyak komponen, total proporsi tervalidasi, basis massa, ukuran batch, dan duplikasi versi bekerja. |
| M1.4 | RENCANA | Bangun Analisis Bahan | Seluruh skor ditampilkan sebagai skor model; perbandingan antarbahan tidak menyatakan skor sebagai persen kekuatan. |
| M1.5 | RENCANA | Tambahkan kalkulator scale-up | Gram per bahan konsisten dengan persen massa dan ukuran batch; pembulatan diuji. |
| M1.6 | RENCANA | Bangun Buku Percobaan | Formula, versi, snapshot model, catatan fisik, dan status pengujian tersimpan serta dapat dipulihkan. |
| M1.7 | RENCANA | Tambahkan migrasi storage | Data lama tetap aman; operasi bersamaan tidak menghilangkan perubahan; data rusak tidak ditimpa. |
| M1.8 | RENCANA | Uji alur MVP | Unit/integration test lulus, lalu tugas utama diuji pada perangkat dan dengan calon pengguna. |

### Tahap 2 — Estimasi dan pencarian eksperimental

| ID | Status | Pekerjaan | Kriteria penerimaan / bukti |
| --- | --- | --- | --- |
| E2.1 | RENCANA | Implementasi baseline agregasi tertimbang | Metode terversi, deterministik, memakai seluruh skor, dan menyimpan provenance. |
| E2.2 | RENCANA | UI estimasi profil formula | Komponen dan bobot dapat ditelusuri; batas ilmiah selalu terlihat. |
| E2.3 | RENCANA | Evaluasi baseline campuran | Protokol, data campuran, target, metrik, dan hasil tersedia sebelum klaim prediktif dibuat. |
| E2.4 | TERTUNDA | Pencarian kandidat bahan dari target | Memakai katalog bahan yang sudah dianalisis dan menghasilkan kandidat untuk diuji. Bergantung pada P0.3 dan M1.2. |
| E2.5 | TERTUNDA | Pencarian rasio | Hanya dimulai jika fungsi penilaian campuran sudah dievaluasi. Bergantung pada E2.3. |

## Bottleneck dan Risiko yang Harus Dilacak

1. Model baru belum dilatih dan aplikasi masih memakai bundle XGBoost historis.
2. API serta bundle aplikasi dapat berbeda pada konfigurasi kiralitas; `feature_schema_id` wajib cocok.
3. Kontrak inferensi saat ini membuang skor di bawah threshold.
4. Katalog sekarang berisi produk parfum, bukan pustaka bahan B2B yang provenance-nya lengkap.
5. Bahan bernama dagang dapat berupa campuran dan tidak selalu mempunyai satu SMILES.
6. Tidak ada dataset campuran di pipeline utama untuk menguji persentase atau interaksi bahan.
7. Skor classifier belum dikalibrasi sebagai intensitas atau probabilitas persepsi manusia.
8. Build dan pengujian Android terbaru belum tersedia.
9. Manfaat bagi UMKM perlu didukung wawancara atau uji tugas, bukan diasumsikan dari performa model.

## Kesesuaian dengan Skripsi

Laporan saat ini membatasi ruang lingkup ilmiah pada prediksi label aroma molekul tunggal. Workbench, kalkulator, dan notebook dapat dijelaskan sebagai penerapan hasil model dalam alur kerja pengguna.

Jika estimasi campuran hanya menjadi fitur demonstrasi, laporan harus menyebutnya pendekatan eksperimental dan memisahkannya dari hasil evaluasi XGBoost-LightGBM. Jika akurasi campuran dijadikan kontribusi ilmiah, penelitian membutuhkan rumusan masalah, data, metodologi, dan evaluasi campuran baru.

Evaluasi dipisahkan menurut tujuan:

| Klaim | Bukti yang diperlukan |
| --- | --- |
| Kinerja model molekul | Validasi dan test XGBoost-LightGBM pada seluruh label. |
| Kesesuaian implementasi mobile | Parity Python-ONNX-perangkat, latensi, RAM, dan pengujian kondisi gagal. |
| Ketepatan formulasi | Unit test proporsi, basis, pembulatan, versi, dan penyimpanan. |
| Kegunaan untuk peracik | Keberhasilan tugas, waktu, kesalahan, pemahaman skor, dan umpan balik calon pengguna. |
| Prediksi campuran | Data campuran atau pengujian sensori dengan komposisi dan kondisi yang tercatat. |

Setelah implementasi serta bukti berubah, perbarui Bab I, Bab III, Bab IV, abstrak, dan simpulan sesuai status sebenarnya.

## Prosedur Pemeliharaan Roadmap

Sebelum mulai bekerja:

1. baca dokumen ini dan `README.md`;
2. periksa branch dan status Git;
3. pilih ID pekerjaan yang akan dikerjakan;
4. verifikasi dependency dan batas klaim yang terkait; dan
5. jangan menggabungkan keputusan partner yang bertentangan tanpa keputusan baru dari pemilik proyek.

Setelah bekerja:

1. ubah status pekerjaan;
2. tulis bukti pengujian atau alasan pekerjaan masih tertunda;
3. catat berkas utama yang berubah;
4. tambahkan keputusan teknis atau produk baru;
5. perbarui tanggal dan changelog; dan
6. pastikan README atau laporan ikut diselaraskan jika perilaku yang terlihat pengguna berubah.

Format bukti yang disarankan:

```text
Bukti: <perintah atau metode validasi>
Hasil: <lulus/gagal dan angka penting>
Berkas: <daftar berkas utama>
Catatan: <batas atau pekerjaan lanjutan>
```

## Changelog

### 5 September 2026

- Membuat roadmap berdasarkan audit implementasi dan brainstorming produk B2B.
- Mengonfirmasi target pengguna memakai bahan aroma/senyawa dengan identitas yang diketahui.
- Menetapkan bahwa formula dapat mempunyai banyak komponen, tetapi setiap komponen mempertahankan SMILES sendiri.
- Menetapkan bahwa keluaran aroma adalah skor model, bukan persentase kekuatan bau.
- Menetapkan empat layar MVP: Pustaka Bahan, Meja Formulasi, Analisis Bahan, dan Buku Percobaan.
- Menempatkan estimasi campuran tertimbang setelah fondasi prediksi molekul dan MVP dasar.
- Belum ada kode fitur formulasi yang diubah pada pembuatan dokumen ini.
