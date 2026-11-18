import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATALOG, CURATORS } from '../domain/catalog';
import { ACCORDS } from '../domain/models';
import { visibleLists } from '../domain/state';
import { useApp } from '../storage/AppProvider';
import {
  Bottle,
  Chip,
  Header,
  Icon,
  IconButton,
  Screen,
} from '../ui/components';
import { colors, s } from '../ui/theme';
import { ListEntry } from '../ui/ListEntry';

const searchTabs = ['Fragrance', 'MyShelf', 'Account'];
const searchable = value =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function CatalogSearchScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('Fragrance');
  const [query, setQuery] = useState('');
  const [accord, setAccord] = useState(null);
  const cleanQuery = searchable(query.trim());
  const items = CATALOG.filter(
    item =>
      (!accord || item.accords.includes(accord)) &&
      searchable(
        [item.brand, item.name, item.concentration, ...item.accords].join(' '),
      ).includes(cleanQuery),
  );
  const lists = visibleLists(state).filter(list =>
    searchable(list.title).includes(cleanQuery),
  );
  const accounts = [
    { id: state.profile.id, name: state.profile.name, bio: state.profile.bio },
    ...CURATORS.filter(account => !state.blocked.includes(account.id)),
  ].filter(account => searchable(account.name).includes(cleanQuery));
  return (
    <Screen contentStyle={{ gap: 12 }}>
      <View style={s.between}>
        <Header title="Essenza" />
        <Pressable
          accessibilityLabel="Settings"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" />
        </Pressable>
      </View>
      <View style={styles.search}>
        <Icon name="search" size={17} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Fragrance, MyShelf, Account, Brand"
          accessibilityLabel="Search fragrances or collections"
          style={styles.input}
          autoCorrect={false}
        />
      </View>
      <View style={s.between}>
        {searchTabs.map(label => (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === label }}
            style={[styles.tab, tab === label && styles.selectedTab]}
            onPress={() => setTab(label)}
          >
            <Text style={[s.small, tab === label && styles.selectedText]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Fragrance' && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            <Chip
              compact
              label="All"
              selected={!accord}
              onPress={() => setAccord(null)}
            />
            {ACCORDS.map(value => (
              <Chip
                key={value}
                compact
                label={value}
                selected={value === accord}
                onPress={() => setAccord(value === accord ? null : value)}
              />
            ))}
          </ScrollView>
          {!items.length && (
            <Text style={s.small}>No fragrances found for this search.</Text>
          )}
          <View style={styles.grid}>
            {items.map(item => (
              <View key={item.id} style={styles.card}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Detail ${item.name} ${item.concentration}`}                  style={[
                    styles.product,
                    { backgroundColor: item.color + '30' },
                  ]}
                  onPress={() =>
                    navigation.navigate('Fragrance', { id: item.id })
                  }
                >
                  <Bottle fragrance={item} size={85} />
                </Pressable>
                <View style={s.between}>
                  <View style={s.flex}>
                    <Text style={s.small} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={s.small}>{item.concentration}</Text>
                  </View>
                  <IconButton
                    name="bookmark"
                    label={`Save ${item.name} ${item.concentration}`}
                    active={state.favorites.includes(item.id)}
                    onPress={() =>
                      dispatch({ type: 'favorite', fragranceId: item.id })
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {tab === 'MyShelf' &&
        (lists.length ? (
          lists.map(list => (
            <ListEntry key={list.id} list={list} navigation={navigation} />
          ))
        ) : (
          <Text style={s.small}>Collection not found.</Text>
        ))}
      {tab === 'Account' &&
        (accounts.length ? (
          accounts.map(account => (
            <View key={account.id} style={s.row}>
              <Icon name="user" />
              <View style={s.flex}>
                <Text style={s.h3}>{account.name}</Text>
                <Text style={s.small}>{account.bio}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={s.small}>Account not found.</Text>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 38,
    borderRadius: 22,
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, color: colors.ink, paddingVertical: 5 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
  },
  selectedTab: { borderBottomColor: colors.green },
  selectedText: { color: colors.green, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: { width: '47%', gap: 4 },
  product: {
    aspectRatio: 0.94,
    borderRadius: 12,
    borderColor: colors.green,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.green,
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 16,
  },
});
