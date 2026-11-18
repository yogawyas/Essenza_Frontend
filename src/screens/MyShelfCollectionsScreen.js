import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../storage/AppProvider';
import { Icon, IconButton, Screen } from '../ui/components';
import { colors, s } from '../ui/theme';
import { ListEntry } from '../ui/ListEntry';

const covers = [
  require('../../assets/fragrance/cover-vibe.webp'),
  require('../../assets/fragrance/cover-rotation.webp'),
  require('../../assets/fragrance/cover-notes.webp'),
];

export function MyShelfCollections({ navigation }) {
  const { state } = useApp();
  const [grid, setGrid] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [recentFirst, setRecentFirst] = useState(true);
  const lists = state.lists
    .filter(list =>
      list.title.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      recentFirst
        ? b.updatedAt.localeCompare(a.updatedAt)
        : a.title.localeCompare(b.title),
    );
  return (
    <Screen contentStyle={{ gap: 10 }}>
      <View style={s.between}>
        <Text style={s.h2}>MyShelf</Text>
        <View style={s.row}>
          <IconButton
            name="search"
            label="Cari MyShelf"
            active={showSearch}
            onPress={() => {
              setShowSearch(!showSearch);
              if (showSearch) setQuery('');
            }}
          />
          <IconButton
            name="plus"
            label="Tambah MyShelf"
            onPress={() => navigation.navigate('EditList')}
          />
        </View>
      </View>
      {showSearch && (
        <TextInput
          autoFocus
          placeholder="Cari MyShelf..."
          accessibilityLabel="Cari MyShelf"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
      )}
      <View style={s.between}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRecentFirst(!recentFirst)}
          style={s.row}
        >
          <Icon name="filter" size={16} />
          <Text style={s.small}>{recentFirst ? 'Terbaru' : 'Nama A–Z'}</Text>
        </Pressable>
        <IconButton
          name={grid ? 'menu' : 'lists'}
          label={grid ? 'Tampilan daftar' : 'Tampilan grid'}
          onPress={() => setGrid(!grid)}
        />
      </View>
      {grid ? (
        <View style={s.wrap}>
          {lists.map((list, index) => (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              onPress={() => navigation.navigate('List', { id: list.id })}
              style={styles.card}
            >
              <Image
                source={covers[index % covers.length]}
                style={styles.cover}
                resizeMode="cover"
              />
              <Text style={styles.title} numberOfLines={2}>
                {list.title}
              </Text>
              <Text style={s.small}>{list.items.length} Parfum</Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tambah MyShelf"
            style={styles.add}
            onPress={() => navigation.navigate('EditList')}
          >
            <Icon name="plus" size={28} />
            <Text style={s.small}>Tambah MyShelf</Text>
          </Pressable>
        </View>
      ) : lists.length ? (
        lists.map(list => (
          <ListEntry key={list.id} list={list} navigation={navigation} />
        ))
      ) : (
        <Text style={s.small}>
          {query.trim() ? 'Koleksi tidak ditemukan.' : 'Belum ada koleksi.'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: '#E6E6E6',
    borderRadius: 19,
    paddingHorizontal: 14,
    minHeight: 38,
    color: colors.green,
  },
  card: { flexBasis: '31%', gap: 3 },
  cover: {
    width: '100%',
    aspectRatio: 0.9,
    borderRadius: 8,
    backgroundColor: colors.sage,
  },
  title: { color: colors.green, fontWeight: '700' },
  add: {
    flexBasis: '31%',
    padding: 6,
    aspectRatio: 0.9,
    borderRadius: 8,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
