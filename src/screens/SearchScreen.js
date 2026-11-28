import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
  DesignIcon,
  DesignScreen,
  SearchField,
  Segmented,
  designStyles,
} from '../ui/design';
import { SortSheet } from '../ui/OptionSheet';
import { LoadMoreFooter, useIncrementalList } from '../ui/useIncrementalList';
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
  const { width } = useWindowDimensions();
  const illustratedBottleSize = Math.min(96, (width - 36) * 0.31);
  const route = useRoute();
  const { state, dispatch } = useApp();
  const requestedCategory = route.params?.category;
  const [category, setCategory] = useState(
    isCategory(requestedCategory) ? requestedCategory : 'perfumes',
  );
  const [query, setQuery] = useState('');
  const [accord, setAccord] = useState(null);
  const [alphabetical, setAlphabetical] = useState(false);
  const [sorting, setSorting] = useState(false);
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
  const paged = useIncrementalList(perfumes, {
    resetKey: [query, accord, alphabetical].join('|'),
  });

  return (
    <DesignScreen
      header={<BrandBar navigation={nav} />}
      contentStyle={styles.content}
      onScroll={category === 'perfumes' ? paged.onScroll : undefined}
    >
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Perfume, MyShelf, Account, Brand"
      />
      <Segmented
        options={categories}
        value={category}
        onChange={changeCategory}
        style={styles.tabs}
      />
      <View style={styles.toolbar}>
        {category === 'accounts' ? (
          <Text style={designStyles.caption}>User Accounts</Text>
        ) : (
          <ScrollView
            horizontal
            style={s.flex}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              pill
              label="All"
              selected={!accord}
              onPress={() => setAccord(null)}
            />
            {ACCORDS.map(item => (
              <Chip
                pill
                key={item}
                label={item[0].toUpperCase() + item.slice(1)}
                selected={accord === item}
                onPress={() => setAccord(item)}
              />
            ))}
          </ScrollView>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter and sort"
          style={styles.filter}
          onPress={() => setSorting(true)}
        >
          <Text style={designStyles.caption}>Filter</Text>
          <DesignIcon name="filter" />
        </Pressable>
      </View>
      {!items.length ? (
        <Text style={designStyles.caption}>No results found.</Text>
      ) : null}
      {category === 'perfumes' ? (
        <View style={styles.grid}>
          {paged.visible.map(fragrance => (
            <View key={fragrance.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={'View ' + fragrance.name}
                onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
                style={styles.cardLink}
              >
                <View style={styles.photo}>
                  {fragrance.photo ? (
                    <Image
                      source={fragrance.photo}
                      resizeMode="contain"
                      style={styles.productImage}
                    />
                  ) : (
                    <Bottle
                      fragrance={fragrance}
                      size={illustratedBottleSize}
                    />
                  )}
                </View>
                <View style={styles.cardTitle}>
                  <Text numberOfLines={1} style={styles.brandName}>
                    {fragrance.brand}
                  </Text>
                  <Text numberOfLines={1} style={styles.name}>
                    {fragrance.name}
                  </Text>
                </View>
              </Pressable>
              <DesignAction
                name={
                  state.favorites.includes(fragrance.id)
                    ? 'bookmarkFill'
                    : 'bookmark'
                }
                label={'Toggle saved perfume ' + fragrance.name}
                style={styles.bookmark}
                onPress={() =>
                  dispatch({ type: 'favorite', fragranceId: fragrance.id })
                }
              />
            </View>
          ))}
        </View>
      ) : null}
      {category === 'perfumes' && paged.total ? (
        <LoadMoreFooter {...paged} noun="perfumes" />
      ) : null}
      {category === 'lists' ? (
        <View style={styles.results}>
          {items.map(list => {
            const author = accounts.find(
              account => account.id === list.authorId,
            );
            const count = list.items.length;
            return (
              <CollectionRow
                key={list.id}
                list={list}
                subtitle={[
                  count + (count === 1 ? ' perfume' : ' perfumes'),
                  author?.name,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => nav.navigate('List', { id: list.id })}
              />
            );
          })}
        </View>
      ) : null}
      {category === 'accounts' ? (
        <View style={styles.results}>
          {items.map(account => (
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
              <Avatar
                photoUri={account.photoUri}
                other={account.id !== state.profile.id}
              />
              <Text style={designStyles.strong}>{account.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {sorting ? (
        <SortSheet
          alphabetical={alphabetical}
          onChange={setAlphabetical}
          onClose={() => setSorting(false)}
        />
      ) : null}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 0, paddingTop: 4 },
  tabs: { marginHorizontal: -16 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    minHeight: 44,
  },
  filter: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  chips: { alignItems: 'center', gap: 8 },
  results: { paddingTop: 12, gap: 14 },
  cardLink: { gap: 8 },
  cardTitle: { paddingRight: 28 },
  brandName: { ...designStyles.caption, fontSize: 10 },
  bookmark: {
    position: 'absolute',
    right: -9,
    bottom: -9,
    minWidth: 42,
    minHeight: 42,
  },
  // Show the whole bottle with a small margin instead of cropping it.
  productImage: { width: '88%', height: '88%' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 12,
    rowGap: 18,
    paddingTop: 4,
    paddingHorizontal: 2,
  },
  card: { width: '44%' },
  photo: {
    aspectRatio: 1,
    overflow: 'hidden',
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
