import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import manifest from '../assets/metadata/v7_model_manifest.json';
import { loadFeatureApiUrl, saveFeatureApiUrl, validateFeatureApiUrl } from '../services/featureApiConfig';
import { useTutorial } from '../tutorial/TutorialProvider';
import { Button, Notice, Page } from '../ui/components';
import { Icon } from '../ui/Icon';
import { colors, s, sans } from '../ui/theme';

export function GuideScreen() {
  const navigation = useNavigation();
  const tutorial = useTutorial();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    loadFeatureApiUrl().then(value => setApiUrl(value || ''))
      .catch(error => setApiStatus(error.message));
  }, []);
  const checkApi = async () => {
    setChecking(true);
    setApiStatus(null);
    try {
      const url = validateFeatureApiUrl(apiUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      let response;
      try {
        response = await fetch(url + '/health', { signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
      const health = await response.json();
      if (!response.ok || health.status !== 'ok' ||
          health.model_id !== manifest.model_id ||
          health.bundle_id !== manifest.bundle_id ||
          health.feature_schema_id !== manifest.feature_schema_id) {
        throw new Error('Layanan belum cocok dengan aplikasi ini. Hubungi pengelola.');
      }
      await saveFeatureApiUrl(url);
      setApiStatus('Koneksi siap dipakai.');
    } catch (error) {
      setApiStatus(error.message || 'Koneksi belum berhasil.');
    } finally {
      setChecking(false);
    }
  };
  const replayTutorial = () => {
    navigation.navigate('Analysis');
    tutorial.openTutorial();
  };
  return (
    <Page>
      <View style={s.stack}>
        <Text style={s.eyebrow}>BANTUAN ESSENZA</Text>
        <Text style={s.title}>Cara pakai, tanpa ribet.</Text>
        <Text style={s.body}>
          Essenza membantu melihat kemungkinan karakter aroma dari satu senyawa.
        </Text>
        <Button label="Ulangi tutorial" icon="book" onPress={replayTutorial} />
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Tiga langkah utama</Text>
        {[
          ['01', 'Pilih atau cari senyawa', 'Pilih dari katalog atau ketik nama/rumus. Kalau hasilnya lebih dari satu, cek rumus dan struktur sebelum memilih. SMILES ada di input lanjutan.'],
          ['02', 'Lihat aromanya', 'Tekan Prediksi aroma. Beberapa karakter aroma bisa muncul sekaligus.'],
          ['03', 'Cek lagi kapan saja', 'Hasil prediksi otomatis masuk Riwayat. Koleksi hanya berisi senyawa yang Anda pilih untuk disimpan.'],
        ].map(([number, title, description]) => (
          <View style={styles.step} key={number}>
            <Text style={styles.number}>{number}</Text>
            <View style={s.grow}>
              <Text style={s.label}>{title}</Text>
              <Text style={s.body}>{description}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Tentang nama dan rumus</Text>
        <Text style={s.body}>
          Nama umum dicocokkan ke katalog, lalu PubChem jika belum ada. Satu rumus bisa punya beberapa molekul berbeda, jadi aplikasi meminta Anda memilih strukturnya.
        </Text>
        <Text style={s.body}>
          Air dan CO2 bisa ditemukan, tetapi bukan bahan aroma yang cocok untuk prediksi model ini. Senyawa organik di luar katalog dapat dicoba, dengan hasil yang perlu dicek langsung.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Cara membaca hasil</Text>
        <Text style={s.body}>
          Satu senyawa bisa punya beberapa karakter aroma. Skor menunjukkan
          seberapa kuat sistem memilih tiap label, bukan persentase isi bahan.
        </Text>
        <Text style={s.body}>
          Hasil ini perkiraan awal. Bau nyata bisa berbeda dan tetap perlu dicek
          langsung, terutama jika bahan akan dipakai dalam racikan.
        </Text>
      </View>
      <Notice>
        Prediksi baru perlu koneksi ke layanan analisis Essenza. Koleksi dan
        Riwayat yang sudah tersimpan tetap bisa dibuka di perangkat ini.
      </Notice>
      <View style={s.card}>
        <Text style={s.heading}>Batas penggunaan</Text>
        <Text style={s.body}>
          Essenza menilai satu senyawa, bukan resep atau campuran parfum.
          Aplikasi tidak menilai keamanan, ketahanan, atau intensitas parfum.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={settingsOpen ? 'Tutup pengaturan koneksi' : 'Buka pengaturan koneksi'}
        onPress={() => setSettingsOpen(value => !value)}
        style={styles.settingsHeader}
      >
        <View style={s.grow}>
          <Text style={s.label}>Pengaturan koneksi</Text>
          <Text style={s.small}>Untuk pengelola aplikasi</Text>
        </View>
        <Icon name="chevron" size={20} />
      </Pressable>
      {settingsOpen && <View style={s.card}>
        <Text style={s.body}>
          Isi alamat layanan dari pengelola. Saat uji lewat USB, gunakan
          localhost:8000 dan jalankan adb reverse untuk port 8000.
        </Text>
        <TextInput
          accessibilityLabel="Alamat layanan analisis"
          value={apiUrl}
          onChangeText={text => { setApiUrl(text); setApiStatus(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://api-contoh.domain"
          placeholderTextColor={colors.muted}
          style={s.field}
        />
        <Button label="Simpan & tes koneksi" onPress={checkApi} loading={checking} />
        {apiStatus && <Notice error={apiStatus !== 'Koneksi siap dipakai.'}>
          {apiStatus}
        </Notice>}
      </View>}
      <Text style={styles.footer}>ESSENZA / DIGITAL SCENT LAB</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 6 },
  number: { fontFamily: sans, fontSize: 12, fontWeight: '600', color: colors.green,
    backgroundColor: colors.pale, padding: 9, borderRadius: 9 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line,
    borderRadius: 14, padding: 17 },
  footer: { ...s.small, textAlign: 'center', letterSpacing: 1, lineHeight: 23 },
});
