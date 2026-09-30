import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLab } from '../storage/LabProvider';
import { useFavorites } from '../storage/FavoritesProvider';
import {
  Button,
  dateLabel,
  Notice,
  Page,
  SectionTitle,
} from '../ui/components';
import { odorSymbol } from '../ui/odorSymbols';
import { colors, s, sans } from '../ui/theme';
export function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const lab = useLab();
  const favorites = useFavorites();
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(route.params.saveError || null);
  useEffect(() => {
    setSaveError(route.params.saveError || null);
  }, [result.id, route.params.saveError]);
  const demo = result.demo === true;
  const saved = lab.records.some(record => record.id === result.id);
  const inCollection = !demo && favorites.items.some(item =>
    item.smiles === result.canonicalSmiles);
  const labels = [...result.labels].sort((a, b) => b.score - a.score);
  const displayed = !demo && showAll
    ? [...result.scores].sort((a, b) => b.score - a.score)
    : labels;
  const save = async () => {
    setBusy(true);
    setSaveError(null);
    try {
      await lab.save(result);
    } catch (cause) {
      setSaveError(
        cause instanceof Error ? cause.message : 'Gagal menyimpan. Coba lagi.',
      );
    } finally {
      setBusy(false);
    }
  };
  const saveCompound = async () => {
    setBusy(true);
    setError(null);
    try {
      await favorites.create({
        smiles: result.canonicalSmiles,
        name: result.inputName || result.sampleName,
      });
    } catch (cause) {
      setError(cause?.message || 'Senyawa belum tersimpan ke Koleksi.');
    } finally {
      setBusy(false);
    }
  };
  const remove = () =>
    Alert.alert(
      'Hapus hasil analisis?',
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
        <Text style={s.eyebrow}>{demo ? 'PROFIL AROMA · DATA CONTOH' : 'PROFIL AROMA · HASIL PREDIKSI'}</Text>
        <Text style={s.title}>{result.sampleName}</Text>
        <Text style={s.small}>
          {dateLabel(result.createdAt)} · Molekul tunggal
        </Text>
      </View>
      <Notice>{demo
        ? 'Halaman ini adalah data contoh lama, bukan hasil prediksi sungguhan.'
        : 'Ini perkiraan profil aroma satu senyawa. Skor menunjukkan kecenderungan tiap aroma, bukan kekuatannya.'}
      </Notice>
      {!demo && saved && <Text style={styles.savedStatus}>✓ Tercatat di Riwayat</Text>}
      {!saved && saveError && <Notice error>Hasil belum masuk Riwayat: {saveError}</Notice>}
      <View style={s.card}>
        <SectionTitle
          number="01"
          title="Label aroma"
          detail={`${labels.length} label terprediksi`}
        />
        <Text style={s.small}>
          {demo ? 'Skor contoh, diurutkan dari yang tertinggi.'
            : 'Label dengan skor ≥ 0,5 ditampilkan lebih dulu. Setiap label dinilai sendiri.'}
        </Text>
        {displayed.length ? (
          displayed.map((item, index) => (
            <View
              key={item.label}
              style={styles.scoreRow}
              accessible
              accessibilityLabel={`${item.label}, skor ${item.score.toFixed(2)}`}
            >
              <View style={s.between}>
                <View style={s.row}>
                  <View style={styles.aromaSymbol} accessible={false}>
                    <Text style={styles.aromaEmoji}>
                      {odorSymbol(item.label)}
                    </Text>
                  </View>
                  <Text style={styles.aroma}>{item.label}</Text>
                </View>
                <Text style={styles.score}>
                  {item.score.toFixed(2).replace('.', ',')}
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
              Tidak ada skor yang melewati ambang 0,5. Ini tidak berarti molekul
              pasti tidak beraroma.
            </Text>
          </View>
        )}
        {!demo && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAll(value => !value)}
            style={styles.showAll}
          >
            <Text style={s.label}>{showAll ? 'Tampilkan aroma utama' : 'Lihat semua penilaian aroma'}</Text>
          </Pressable>
        )}
        <View style={s.divider} />
        <Text style={s.small}>
          Skor tiap label berdiri sendiri dan totalnya tidak harus 100%.
          Skor bukan kekuatan aroma, komposisi campuran, atau jaminan ketepatan.
        </Text>
      </View>
      <View style={s.card}>
        <SectionTitle number="02" title="Detail analisis" />
        {result.inputName && (
          <>
            <Text style={s.label}>Senyawa dipilih</Text>
            <Text style={s.mono}>{result.inputName}</Text>
          </>
        )}
        <Text style={s.label}>Struktur molekul</Text>
        <Text selectable style={s.mono}>
          {result.inputSmiles}
        </Text>
        {!demo && (
          <>
            <Text style={s.label}>Struktur yang diperiksa</Text>
            <Text selectable style={s.mono}>{result.canonicalSmiles}</Text>
          </>
        )}
        <View style={s.divider} />
        <View style={s.between}>
          <Text style={s.small}>Sumber hasil</Text>
          <Text style={s.label}>{demo ? 'Data contoh lama' : 'Analisis Essenza'}</Text>
        </View>
        <View style={s.between}>
          <Text style={s.small}>Pemeriksaan struktur</Text>
          <Text style={s.label}>{demo ? 'Belum dilakukan' : 'Selesai'}</Text>
        </View>
        {demo && <Text style={s.small}>Struktur belum diperiksa pada hasil contoh lama ini.</Text>}
      </View>
      {lab.error && (
        <>
          <Notice error>{lab.error}</Notice>
          <Button label="Muat ulang riwayat" secondary onPress={lab.reload} />
        </>
      )}
      {favorites.error && <Notice error>{favorites.error}</Notice>}
      {error && <Notice error>{error}</Notice>}
      <View style={s.stack}>
        {!saved && <Button
          label={demo ? 'Simpan ke Riwayat' : 'Coba simpan ke Riwayat'}
          icon="save"
          loading={busy}
          disabled={!lab.ready || !!lab.error}
          onPress={save}
        />}
        {!demo && <Button
          label={inCollection ? 'Tersimpan di Koleksi' : 'Simpan senyawa ke Koleksi'}
          icon={inCollection ? 'check' : 'star'}
          secondary
          loading={busy}
          disabled={inCollection || !favorites.ready || !!favorites.error}
          onPress={saveCompound}
        />}
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
          Riwayat dan Koleksi tersimpan di perangkat ini.
        </Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  savedStatus: { ...s.label, color: colors.green },
  scoreRow: { gap: 10, paddingVertical: 5 },
  aromaSymbol: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pale,
    borderWidth: 1,
    borderColor: colors.line,
  },
  aromaEmoji: { fontSize: 18, lineHeight: 24 },
  aroma: {
    fontFamily: sans,
    fontSize: 16,
    color: colors.ink,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  score: {
    fontFamily: sans,
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
  showAll: { alignItems: 'center', paddingVertical: 14 },
  deleteText: { fontFamily: sans, color: colors.error, fontSize: 13 },
});
