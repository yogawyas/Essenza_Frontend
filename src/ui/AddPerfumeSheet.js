import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { CATALOG } from '../domain/catalog';
import { matchesQuery } from '../domain/search';
import { useApp } from '../storage/AppProvider';
import { FragranceRow } from './components';
import { DesignIcon, SearchField, designStyles } from './design';
import { Sheet } from './Sheet';

export function AddPerfumeSheet({ list, onClose }) {
  const { dispatch } = useApp();
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const added = new Set(list.items.map(item => item.fragranceId));
  const available = CATALOG.filter(
    fragrance =>
      !added.has(fragrance.id) &&
      matchesQuery(query, fragrance.name, fragrance.brand),
  );

  const add = async fragranceId => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    setBusy(true);
    const saved = await dispatch({
      type: 'addListPerfume',
      id: list.id,
      fragranceId,
      updatedAt: new Date().toISOString(),
    });
    setBusy(false);
    pending.current = false;
    if (saved) {
      onClose();
    }
  };

  return (
    <Sheet
      title="Add to This Scentlist"
      onClose={onClose}
      busy={busy}
      scrollable={false}
    >
      <View style={[styles.content, { height: Math.min(400, height * 0.55) }]}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or brand"
        />
        <FlatList
          data={available}
          keyboardShouldPersistTaps="handled"
          keyExtractor={fragrance => fragrance.id}
          ListEmptyComponent={
            <Text style={designStyles.caption}>No perfumes found.</Text>
          }
          renderItem={({ item }) => (
            <FragranceRow
              fragrance={item}
              onPress={() => add(item.id)}
              right={<DesignIcon name="addDestination" />}
            />
          )}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, gap: 10 },
});
