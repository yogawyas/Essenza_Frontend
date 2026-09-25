import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLab } from '../storage/LabProvider';
import {
  Button,
  dateLabel,
  Notice,
  Page,
  SectionTitle,
} from '../ui/components';
import { colors, s } from '../ui/theme';
export function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const lab = useLab();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const saved = lab.records.some(record => record.id === result.id);
  const labels = [...result.labels].sort((a, b) => b.score - a.score);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await lab.save(result);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Gagal menyimpan. Coba lagi.',
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = () =>
    Alert.alert(
      'Hapus hasil demo?',
      'Hasil ini akan dihapus dari riwayat perangkat.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            lab
              .remove(result.id)
              .then(() => navigation.goBack())
              .catch(() => {
                setError('Hasil belum terhapus. Silakan coba lagi.');
                setBusy(false);
              });
          },
        },
      ],
    );
  return (
    <Page back={() => navigation.goBack()} title="Hasil analisis">
      <View style={s.stack}>
        <Text style={s.eyebrow}>PROFIL AROMA · DATA CONTOH</Text>
        <Text style={s.title}>{result.sampleName}</Text>
        <Text style={s.small}>
          {dateLabel(result.createdAt)} · Molekul tunggal
        </Text>
      </View>
      <Notice>
        Label dan confidence score di halaman ini adalah data dummy untuk
        demonstrasi, bukan hasil model penelitian.
      </Notice>
      <View style={s.card}>
        <SectionTitle
          number="01"
          title="Label aroma"
          detail={`${labels.length} label`}
        />
        <Text style={s.small}>
          Contoh confidence score, diurutkan dari yang tertinggi.
        </Text>
        {labels.length ? (
          labels.map((item, index) => (
            <View
              key={item.label}
              style={styles.scoreRow}
              accessible
              accessibilityLabel={`${item.label}, skor contoh ${Math.round(
                item.score * 100,
              )} persen`}
            >
              <View style={s.between}>
                <View style={s.row}>
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor:
                          index === 0
                            ? colors.green
                            : index === 1
                            ? '#849F83'
                            : colors.gold,
                      },
                    ]}
                  />
                  <Text style={styles.aroma}>{item.label}</Text>
                </View>
                <Text style={styles.score}>
                  {Math.round(item.score * 100)}
                  <Text style={s.small}>%</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${item.score * 100}%`,
                      backgroundColor:
                        index === 0
                          ? colors.green
                          : index === 1
                          ? '#849F83'
                          : colors.gold,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={s.heading}>Tidak ada label ditampilkan</Text>
            <Text style={s.body}>
              Ini contoh hasil kosong. Hasil tanpa label tidak berarti molekul
              pasti tidak beraroma.
            </Text>
          </View>
        )}
        <View style={s.divider} />
        <Text style={s.small}>
          Skor tiap label berdiri sendiri, sehingga totalnya tidak harus 100%.
          Skor bukan ukuran kekuatan aroma, komposisi campuran, atau jaminan
          ketepatan.
        </Text>
      </View>
      <View style={s.card}>
        <SectionTitle number="02" title="Detail analisis" />
        <Text style={s.label}>SMILES masukan</Text>
        <Text selectable style={s.mono}>
          {result.inputSmiles}
        </Text>
        <View style={s.divider} />
        <View style={s.between}>
          <Text style={s.small}>Sumber hasil</Text>
          <Text style={s.label}>Data dummy lokal</Text>
        </View>
        <View style={s.between}>
          <Text style={s.small}>Validasi RDKit</Text>
          <Text style={s.label}>Belum dilakukan</Text>
        </View>
        <Text style={s.small}>
          SMILES kanonis belum tersedia. Model RF + ML-SMOTE dan API belum
          terhubung ke aplikasi ini.
        </Text>
      </View>
      {lab.error && (
        <>
          <Notice error>{lab.error}</Notice>
          <Button label="Muat ulang riwayat" secondary onPress={lab.reload} />
        </>
      )}
      {error && <Notice error>{error}</Notice>}
      <View style={s.stack}>
        <Button
          label={saved ? 'Tersimpan di riwayat' : 'Simpan ke riwayat'}
          icon={saved ? 'check' : 'save'}
          loading={busy}
          disabled={saved || !lab.ready || !!lab.error}
          onPress={save}
        />
        <Button
          label="Kembali ke ruang kerja"
          secondary
          onPress={() => navigation.goBack()}
        />
        {saved && (
          <Pressable
            disabled={busy}
            accessibilityRole="button"
            onPress={remove}
            style={styles.delete}
          >
            <Text style={styles.deleteText}>Hapus dari riwayat</Text>
          </Pressable>
        )}
        <Text style={s.small}>
          Riwayat disimpan hanya pada perangkat ini. Label DEMO tetap melekat
          pada hasil yang disimpan.
        </Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  scoreRow: { gap: 10, paddingVertical: 5 },
  swatch: { height: 9, width: 9, borderRadius: 3 },
  aroma: {
    fontSize: 16,
    color: colors.ink,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  score: {
    fontSize: 23,
    color: colors.ink,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EEF1EB',
    overflow: 'hidden',
  },
  bar: { height: 7, borderRadius: 4 },
  empty: { gap: 12, paddingVertical: 12 },
  delete: { alignItems: 'center', padding: 15 },
  deleteText: { color: colors.error, fontSize: 13 },
});
