import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Notice, Page } from '../ui/components';
import { colors, s, sans } from '../ui/theme';
export function GuideScreen() {
  return (
    <Page>
      <View style={s.stack}>
        <Text style={s.eyebrow}>MENGENAL ESSENZA</Text>
        <Text style={s.title}>Dari struktur,{'\n'}menuju profil aroma.</Text>
        <Text style={s.body}>
          Ruang kerja digital untuk membantu peninjauan awal aroma satu molekul
          dalam konteks laboratorium parfum.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Cara menggunakan demo</Text>
        {[
          [
            '01',
            'Pilih molekul contoh',
            'Buka tab Analisis dan pilih contoh. SMILES akan terisi otomatis; nama sampel dapat Anda ubah.',
          ],
          [
            '02',
            'Tinjau profil aroma',
            'Tekan Lihat contoh hasil. Baca label aroma dan confidence score pada halaman hasil.',
          ],
          [
            '03',
            'Simpan catatan analisis',
            'Simpan hasil untuk membukanya kembali melalui Riwayat. Data tersimpan di perangkat ini.',
          ],
        ].map(([number, title, body]) => (
          <View style={styles.step} key={number}>
            <Text style={styles.number}>{number}</Text>
            <View style={s.grow}>
              <Text style={s.label}>{title}</Text>
              <Text style={s.body}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Notice>
        Mode demo bekerja tanpa internet. Label dan skor adalah contoh tampilan.
        Aplikasi belum menjalankan model atau validasi kimia RDKit.
      </Notice>
      <View style={s.card}>
        <Text style={s.heading}>Apa yang dibaca dari hasil?</Text>
        <Text style={s.body}>
          Satu molekul dapat memiliki beberapa label aroma sekaligus. Pada model
          yang akan dihubungkan, confidence score menunjukkan skor prediksi
          untuk masing-masing label.
        </Text>
        <Text style={s.body}>
          Skor tidak menunjukkan konsentrasi, kekuatan aroma, keamanan bahan,
          atau persentase resep. Skor yang tinggi juga tidak menjamin prediksi
          benar.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.eyebrow}>MODEL PENELITIAN · BELUM TERHUBUNG</Text>
        <Text style={s.heading}>Random Forest + ML-SMOTE</Text>
        <Text style={s.body}>
          Kandidat model B dari eksperimen awal. Masukannya adalah satu SMILES,
          dengan 2.048 bit Morgan Fingerprint serta MolWt dan MolLogP.
        </Text>
        <View style={styles.metrics}>
          <View style={s.grow}>
            <Text style={styles.metric}>143</Text>
            <Text style={s.small}>label aroma target</Text>
          </View>
          <View style={s.grow}>
            <Text style={styles.metric}>2.050</Text>
            <Text style={s.small}>fitur masukan</Text>
          </View>
        </View>
        <Text style={s.small}>
          Angka di atas menjelaskan model penelitian. Contoh demo tidak dihitung
          oleh model tersebut. ML-SMOTE digunakan saat training, bukan saat
          menerima SMILES pengguna.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Batas penggunaan</Text>
        <Text style={s.body}>
          Essenza berfokus pada molekul tunggal. Hasilnya adalah informasi awal
          untuk ditinjau lebih lanjut oleh pengguna laboratorium.
        </Text>
        <Text style={s.body}>
          Model tidak memprediksi aroma akhir campuran, interaksi bahan,
          ketahanan parfum, atau keamanan formulasi. Penilaian ahli dan
          pengujian fisik tetap diperlukan.
        </Text>
      </View>
      <Text style={styles.footer}>
        ESSENZA / DIGITAL SCENT LAB{'\n'}Prototipe B2B · Demo lokal 1.0
      </Text>
    </Page>
  );
}
const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    paddingVertical: 6,
  },
  number: {
    fontFamily: sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
    backgroundColor: colors.pale,
    padding: 9,
    borderRadius: 9,
  },
  metrics: {
    flexDirection: 'row',
    backgroundColor: colors.pale,
    borderRadius: 13,
    padding: 18,
    gap: 12,
  },
  metric: {
    fontFamily: sans,
    fontSize: 27,
    color: colors.ink,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  footer: { ...s.small, textAlign: 'center', letterSpacing: 1, lineHeight: 23 },
});
