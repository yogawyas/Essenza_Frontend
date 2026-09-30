import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFavorites } from '../storage/FavoritesProvider';
import { useLab } from '../storage/LabProvider';
import { v7PredictionService } from '../services/v7Prediction';
import { Button, Notice, Page } from '../ui/components';
import { Icon } from '../ui/Icon';
import { colors, s, sans } from '../ui/theme';

export function CollectionScreen({ service = v7PredictionService }) {
  const navigation = useNavigation();
  const favorites = useFavorites();
  const lab = useLab();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [busySmiles, setBusySmiles] = useState(null);
  const [error, setError] = useState(null);
  const controller = useRef(null);
  const version = useRef(0);
  useFocusEffect(useCallback(() => () => {
    controller.current?.abort();
    version.current += 1;
    controller.current = null;
    setBusySmiles(null);
  }, []));

  const query = search.trim().toLocaleLowerCase();
  const filtered = favorites.items.filter(item =>
    `${item.name} ${item.note} ${item.smiles}`.toLocaleLowerCase().includes(query));

  const analyzeAgain = async item => {
    if (busySmiles) { return; }
    const currentVersion = ++version.current;
    controller.current = new AbortController();
    setBusySmiles(item.smiles);
    setError(null);
    try {
      const result = await service.predict({
        smiles: item.smiles, sampleName: item.name,
        catalogName: item.name, signal: controller.current.signal,
      });
      if (version.current === currentVersion) {
        let saveError = null;
        try {
          await lab.save(result);
        } catch (cause) {
          saveError = cause?.message || 'Hasil belum tersimpan ke Riwayat.';
        }
        if (version.current === currentVersion) {
          navigation.navigate('Result', { result, saveError });
        }
      }
    } catch (cause) {
      if (version.current === currentVersion) {
        setError(cause?.message || 'Analisis ulang gagal. Coba lagi.');
      }
    } finally {
      if (version.current === currentVersion) {
        controller.current = null;
        setBusySmiles(null);
      }
    }
  };

  const startEdit = item => {
    setEditing(item);
    setDraftName(item.name);
    setDraftNote(item.note);
    setError(null);
  };
  const saveEdit = async () => {
    try {
      await favorites.edit(editing.smiles, { name: draftName, note: draftNote });
      setEditing(null);
      setError(null);
    } catch (cause) {
      setError(cause?.message || 'Perubahan belum tersimpan.');
    }
  };
  const confirmRemove = item => Alert.alert(
    'Hapus dari Koleksi?', `${item.name} tidak lagi muncul di Koleksi. Riwayat hasil tetap ada.`,
    [{ text: 'Batal', style: 'cancel' }, {
      text: 'Hapus', style: 'destructive', onPress: () =>
        favorites.remove(item.smiles).catch(cause => setError(cause.message)),
    }],
  );

  return <Page>
    <View style={s.stack}>
      <Text style={s.eyebrow}>SENYAWA PILIHAN</Text>
      <Text style={s.title}>Koleksi saya</Text>
      <Text style={s.body}>
        Simpan bahan yang sering dicek. Ubah nama/catatan, lalu jalankan analisis ulang kapan saja.
      </Text>
    </View>
    {!favorites.ready ? <ActivityIndicator color={colors.green} /> : favorites.error ? <>
      <Notice error>{favorites.error}</Notice>
      <Button label="Muat ulang Koleksi" onPress={favorites.reload} />
    </> : <>
      <View style={styles.search}>
        <Icon name="search" size={19} color={colors.muted} />
        <TextInput
          accessibilityLabel="Cari Koleksi"
          placeholder="Cari nama, catatan, atau SMILES"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      <Text style={s.eyebrow}>{filtered.length} SENYAWA TERSIMPAN</Text>
      {error && <Notice error>{error}</Notice>}
      {filtered.length ? <View style={s.stack}>{filtered.map(item =>
        <View style={s.card} key={item.smiles}>
          <View style={s.between}>
            <Text style={[s.heading, s.grow]}>{item.name}</Text>
            <Icon name="star" size={21} color={colors.gold} />
          </View>
          <Text style={s.mono} numberOfLines={2}>{item.smiles}</Text>
          {!!item.note && <Text style={s.body}>{item.note}</Text>}
          <Button
            label={busySmiles === item.smiles ? 'Menganalisis…' : 'Analisis ulang'}
            icon="arrow"
            loading={busySmiles === item.smiles}
            disabled={!!busySmiles}
            onPress={() => analyzeAgain(item)}
          />
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ubah ${item.name}`}
              onPress={() => startEdit(item)}
              style={styles.action}
            ><Icon name="edit" size={17} /><Text style={s.label}>Ubah</Text></Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hapus ${item.name}`}
              onPress={() => confirmRemove(item)}
              style={styles.action}
            ><Icon name="trash" size={17} color={colors.error} />
              <Text style={[s.label, { color: colors.error }]}>Hapus</Text></Pressable>
          </View>
        </View>)}</View> : <View style={[s.card, s.center]}>
        <Icon name="star" size={36} color={colors.gold} />
        <Text style={s.heading}>{query ? 'Tidak ditemukan' : 'Koleksi masih kosong'}</Text>
        <Text style={[s.body, styles.centerText]}>
          {query ? 'Coba kata kunci lain.' : 'Pilih senyawa di Analisis, lalu simpan ke Koleksi.'}
        </Text>
        {!query && <Button label="Pilih senyawa" onPress={() => navigation.navigate('Analysis')} />}
      </View>}
    </>}
    <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}
      >
        <ScrollView keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScroll}>
        <View style={styles.modalCard}>
          <Text style={s.heading}>Ubah senyawa tersimpan</Text>
          <Text style={s.label}>Nama panggilan</Text>
          <TextInput
            accessibilityLabel="Ubah nama senyawa"
            value={draftName}
            onChangeText={setDraftName}
            maxLength={80}
            style={s.field}
          />
          <Text style={s.label}>Catatan (opsional)</Text>
          <TextInput
            accessibilityLabel="Catatan senyawa"
            value={draftNote}
            onChangeText={setDraftNote}
            maxLength={240}
            multiline
            style={[s.field, styles.note]}
          />
          {error && <Notice error>{error}</Notice>}
          <Button label="Simpan perubahan" onPress={saveEdit} />
          <Button label="Batal" secondary onPress={() => setEditing(null)} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  </Page>;
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper,
    borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingLeft: 14 },
  searchInput: { fontFamily: sans, flex: 1, minHeight: 50, color: colors.ink,
    fontSize: 13, paddingHorizontal: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1,
    borderColor: colors.line, paddingTop: 12 },
  action: { minHeight: 40, flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 15 },
  centerText: { textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: '#0008' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: colors.paper, borderRadius: 20, padding: 22, gap: 13 },
  note: { minHeight: 96, textAlignVertical: 'top' },
});
