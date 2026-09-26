import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLab } from '../storage/LabProvider';
import { Button, dateLabel, DemoBadge, Notice, Page } from '../ui/components';
import { Icon } from '../ui/Icon';
import { colors, s, sans } from '../ui/theme';
export function HistoryScreen() {
  const navigation = useNavigation();
  const { records, ready, error, reload } = useLab();
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filtered = records.filter(r =>
    `${r.sampleName} ${r.inputSmiles} ${r.labels
      .map(label => label.label)
      .join(' ')}`
      .toLowerCase()
      .includes(query),
  );
  return (
    <Page>
      <View style={s.stack}>
        <Text style={s.eyebrow}>CATATAN LABORATORIUM</Text>
        <Text style={s.title}>Riwayat analisis</Text>
        <Text style={s.body}>
          Buka kembali profil molekul yang sudah Anda simpan pada perangkat ini.
        </Text>
      </View>
      {!ready ? (
        <ActivityIndicator
          accessibilityLabel="Memuat riwayat"
          color={colors.green}
        />
      ) : error ? (
        <>
          <Notice error>{error}</Notice>
          <Button label="Muat ulang riwayat" onPress={reload} />
        </>
      ) : (
        <>
          <View style={styles.search}>
            <Icon name="search" size={19} color={colors.muted} />
            <TextInput
              accessibilityLabel="Cari riwayat"
              placeholder="Nama, SMILES, atau label aroma"
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bersihkan pencarian"
                onPress={() => setSearch('')}
                style={styles.clear}
              >
                <Icon name="close" size={18} />
              </Pressable>
            )}
          </View>
          <View style={s.between}>
            <Text style={s.eyebrow}>{filtered.length} HASIL TERSIMPAN</Text>
            <Text style={s.small}>Lokal · data demo</Text>
          </View>
          {filtered.length ? (
            <View style={s.stack}>
              {filtered.map(result => (
                <Pressable
                  key={result.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Buka hasil ${result.sampleName}`}
                  onPress={() => navigation.navigate('Result', { result })}
                  style={({ pressed }) => [s.card, pressed && styles.pressed]}
                >
                  <View style={s.between}>
                    <Text style={[s.heading, s.grow]}>{result.sampleName}</Text>
                    <DemoBadge />
                  </View>
                  <Text style={s.small}>{dateLabel(result.createdAt)}</Text>
                  <Text numberOfLines={1} style={s.mono}>
                    {result.inputSmiles}
                  </Text>
                  <View style={s.between}>
                    <View style={styles.labels}>
                      {result.labels.length ? (
                        result.labels.slice(0, 3).map(label => (
                          <Text style={styles.chip} key={label.label}>
                            {label.label}
                          </Text>
                        ))
                      ) : (
                        <Text style={s.small}>Contoh tanpa label</Text>
                      )}
                    </View>
                    <Icon name="arrow" size={18} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={[s.card, s.center]}>
              <View style={styles.emptyIcon}>
                <Icon name="history" size={32} />
              </View>
              <Text style={s.heading}>
                {query
                  ? 'Hasil tidak ditemukan'
                  : 'Belum ada analisis tersimpan'}
              </Text>
              <Text style={styles.emptyText}>
                {query
                  ? 'Coba kata kunci lain.'
                  : 'Pilih molekul di tab Analisis, buka hasilnya, lalu simpan ke riwayat.'}
              </Text>
            </View>
          )}
        </>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 14,
  },
  searchInput: {
    fontFamily: sans,
    flex: 1,
    minHeight: 50,
    color: colors.ink,
    fontSize: 13,
    paddingHorizontal: 10,
  },
  clear: { padding: 13 },
  pressed: { opacity: 0.7 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  chip: {
    fontFamily: sans,
    fontSize: 11,
    color: colors.green,
    backgroundColor: colors.pale,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  emptyIcon: { backgroundColor: colors.pale, padding: 18, borderRadius: 22 },
  emptyText: { ...s.body, textAlign: 'center' },
});
