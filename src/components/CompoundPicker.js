import React, { useMemo, useState } from 'react';
import {
  FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import catalog from '../assets/catalog/compounds.json';
import { Icon } from '../ui/Icon';
import { colors, s, sans } from '../ui/theme';

export const COMPOUNDS = catalog.compounds;
const INDEX = COMPOUNDS.map(item => ({
  item,
  terms: `${item.name} ${item.cid || ''} ${item.smiles} ${item.aliases.join(' ')}`.toLowerCase(),
}));
const FEATURED = ['Vanillin', 'Linalool', 'Geraniol']
  .map(name => COMPOUNDS.find(item => item.name === name)).filter(Boolean);

export function CompoundPicker({ selected, onSelect, disabled, targetRef }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? INDEX.filter(entry => entry.terms.includes(term)).map(entry => entry.item)
      : COMPOUNDS;
  }, [query]);
  const select = item => {
    onSelect(item);
    setQuery('');
    setOpen(false);
  };
  return <>
    <Pressable
      ref={targetRef}
      accessibilityRole="button"
      accessibilityLabel="Pilih senyawa dari katalog"
      accessibilityState={{ disabled, expanded: open }}
      disabled={disabled}
      onPress={() => setOpen(true)}
      style={[styles.trigger, !!selected && styles.selected]}
    >
      <View style={s.grow}>
        <Text style={s.small}>{selected ? 'Senyawa terpilih' : 'Ketuk untuk memilih senyawa'}</Text>
        <Text numberOfLines={1} style={styles.triggerName}>
          {selected ? selected.name : 'Pilih dari katalog'}
        </Text>
      </View>
      <Icon name="chevron" size={22} color={colors.green} />
    </Pressable>
    {selected && <Text numberOfLines={2} style={s.mono}>{selected.smiles}</Text>}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.header}>
          <View style={s.grow}>
            <Text style={s.eyebrow}>KATALOG SENYAWA</Text>
            <Text style={s.heading}>Pilih bahan yang ingin dicek</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup katalog"
            onPress={() => setOpen(false)}
            style={styles.close}
          ><Icon name="close" /></Pressable>
        </View>
        <View style={styles.search}>
          <Icon name="search" size={19} color={colors.muted} />
          <TextInput
            accessibilityLabel="Cari senyawa dalam katalog"
            value={query}
            onChangeText={setQuery}
            placeholder="Cari nama, alias, CID, atau SMILES"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>
        <Text style={styles.count}>
          {filtered.length.toLocaleString('id-ID')} dari {catalog.count.toLocaleString('id-ID')} senyawa
        </Text>
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={16}
          maxToRenderPerBatch={24}
          windowSize={7}
          contentContainerStyle={styles.list}
          ListHeaderComponent={query ? null : <View style={styles.quick}>
            <Text style={s.label}>Pilihan cepat</Text>
            <View style={styles.quickRow}>{FEATURED.map(item =>
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Pilih ${item.name}`}
                onPress={() => select(item)}
                style={styles.quickChip}
              ><Text style={styles.quickText}>{item.name}</Text></Pressable>)}</View>
          </View>}
          ListEmptyComponent={<View style={s.center}>
            <Text style={s.heading}>Senyawa tidak ditemukan</Text>
            <Text style={s.body}>Coba nama lain atau gunakan mode SMILES lanjutan.</Text>
          </View>}
          renderItem={({ item }) => <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pilih ${item.name}${item.cid ? `, CID ${item.cid}` : ''}`}
            onPress={() => select(item)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={s.grow}>
              <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={s.small}>
                {item.cid ? `CID ${item.cid} · ` : ''}{item.smiles}
              </Text>
            </View>
            {selected?.id === item.id && <Icon name="check" size={20} color={colors.green} />}
          </Pressable>}
        />
      </SafeAreaView>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  trigger: { minHeight: 66, borderWidth: 1, borderColor: colors.line,
    backgroundColor: '#FAFBF8', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10 },
  selected: { borderColor: colors.green, backgroundColor: colors.pale },
  triggerName: { fontFamily: sans, fontSize: 16, fontWeight: '600', color: colors.ink },
  modal: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  close: { minWidth: 42, minHeight: 42, justifyContent: 'center', alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20,
    borderWidth: 1, borderColor: colors.line, borderRadius: 12,
    backgroundColor: colors.paper, paddingLeft: 13 },
  searchInput: { flex: 1, minHeight: 48, fontFamily: sans, fontSize: 14,
    color: colors.ink, paddingHorizontal: 10 },
  count: { ...s.small, marginHorizontal: 22, marginTop: 12, marginBottom: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  quick: { marginTop: 12, marginBottom: 16, gap: 10 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: { backgroundColor: colors.pale, borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 9 },
  quickText: { ...s.label, color: colors.green },
  row: { minHeight: 70, borderBottomWidth: 1, borderColor: colors.line,
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  name: { fontFamily: sans, fontSize: 14, fontWeight: '600', color: colors.ink },
  pressed: { opacity: 0.65 },
});
