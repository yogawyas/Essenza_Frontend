import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CATALOG, CURATORS, fragranceById } from '../domain/catalog';
import { ACCORDS } from '../domain/models';
import { matchesQuery } from '../domain/search';
import { visibleLists } from '../domain/state';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { Bottle, Chip } from '../ui/components';
import { CollectionRow } from '../ui/CollectionRow';
import {
  Avatar,
  BrandBar,
  DesignAction,
  DesignScreen,
  SearchField,
  Segmented,
  designStyles,
} from '../ui/design';
import { colors, s, serif } from '../ui/theme';

const categories = [
  { value: 'perfumes', label: 'Perfume' },
  { value: 'lists', label: 'MyShelf' },
  { value: 'accounts', label: 'Account' },
];
const isCategory = value =>
  categories.some(category => category.value === value);

export function SearchScreen() {
  const nav = useAppNavigation();
  const route = useRoute();
  const { state, dispatch } = useApp();
  const requestedCategory = route.params?.category;
  const [category, setCategory] = useState(
    isCategory(requestedCategory) ? requestedCategory : 'perfumes',
  );
  const [query, setQuery] = useState('');
  const [accord, setAccord] = useState(null);
  const [alphabetical, setAlphabetical] = useState(false);
  useEffect(() => {
    if (isCategory(requestedCategory)) {
      setCategory(requestedCategory);
    }
  }, [requestedCategory]);

  const perfumes = CATALOG.filter(
    item =>
      (!accord || item.accords.includes(accord)) &&
      matchesQuery(
        query,
        item.name,
        item.brand,
        ...item.accords,
        ...Object.values(item.notes || {})
          .flat()
          .map(note => note.name),
      ),
  );
  const accounts = [
    state.profile,
    ...CURATORS.filter(author => !state.blocked.includes(author.id)),
  ];
  const lists = visibleLists(state).filter(list => {
    const fragrances = list.items
      .map(item => fragranceById(item.fragranceId))
      .filter(Boolean);
    const author = accounts.find(account => account.id === list.authorId);
    return (
      (!accord || fragrances.some(item => item.accords.includes(accord))) &&
      matchesQuery(
        query,
        list.title,
        author?.name,
        ...fragrances.map(item => item.name),
      )
    );
  });
  const filteredAccounts = accounts.filter(account =>
    matchesQuery(query, account.name),
  );
  const items = { perfumes, lists, accounts: filteredAccounts }[category];
  if (alphabetical) {
    items.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title));
  }
  const changeCategory = value => {
    setCategory(value);
    nav.setParams({ category: value });
  };
  const showFilter = () =>
    Alert.alert('Sort results', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Default', onPress: () => setAlphabetical(false) },
      { text: 'Name A–Z', onPress: () => setAlphabetical(true) },
    ]);

  return (
    <DesignScreen header={<BrandBar navigation={nav} />}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Perfume, MyShelf, Account, Brand"
      />
      <Segmented
        options={categories}
        value={category}
        onChange={changeCategory}
      />
      <View style={s.between}>
        {category === 'accounts' ? (
          <Text style={designStyles.caption}>User Accounts</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              compact
              label="All"
              selected={!accord}
              onPress={() => setAccord(null)}
            />
            {ACCORDS.map(item => (
              <Chip
                compact
                key={item}
                label={item[0].toUpperCase() + item.slice(1)}
                selected={accord === item}
                onPress={() => setAccord(item)}
              />
            ))}
          </ScrollView>
        )}
        <DesignAction
          name="filter"
          label="Filter and sort"
          onPress={showFilter}
        />
      </View>
      {!items.length ? (
        <Text style={designStyles.caption}>No results found.</Text>
      ) : null}
      {category === 'perfumes' ? (
        <View style={styles.grid}>
          {items.map(fragrance => (
            <View key={fragrance.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={'View ' + fragrance.name}
                onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
                style={styles.photo}
              >
                <Bottle fragrance={fragrance} size={101} />
              </Pressable>
              <View style={s.between}>
                <View style={s.flex}>
                  <Text numberOfLines={1} style={designStyles.caption}>
                    {fragrance.brand}
                  </Text>
                  <Text numberOfLines={1} style={styles.name}>
                    {fragrance.name}
                  </Text>
                </View>
                <DesignAction
                  name={
                    state.favorites.includes(fragrance.id)
                      ? 'bookmarkFill'
                      : 'bookmark'
                  }
                  label={'Toggle saved perfume ' + fragrance.name}
                  onPress={() =>
                    dispatch({ type: 'favorite', fragranceId: fragrance.id })
                  }
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {category === 'lists'
        ? items.map(list => {
            const author = accounts.find(
              account => account.id === list.authorId,
            );
            const names = list.items
              .map(item => fragranceById(item.fragranceId)?.name)
              .filter(Boolean);
            return (
              <CollectionRow
                key={list.id}
                list={list}
                subtitle={[
                  list.items.length + ' perfumes',
                  author?.name,
                  names.join(', '),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => nav.navigate('List', { id: list.id })}
              />
            );
          })
        : null}
      {category === 'accounts'
        ? items.map(account => (
            <Pressable
              key={account.id}
              accessibilityRole="button"
              style={s.row}
              onPress={() =>
                account.id === state.profile.id
                  ? nav.navigate('Home', { screen: 'Profile' })
                  : nav.navigate('OtherProfile', { id: account.id })
              }
            >
              <Avatar other={account.id !== state.profile.id} />
              <Text style={designStyles.strong}>{account.name}</Text>
            </Pressable>
          ))
        : null}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  chips: { alignItems: 'center', gap: 6 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: { width: '47%', gap: 5 },
  photo: {
    height: 142,
    borderRadius: 8,
    borderColor: colors.green,
    borderWidth: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  name: { fontFamily: serif, color: colors.green, fontSize: 16 },
});
