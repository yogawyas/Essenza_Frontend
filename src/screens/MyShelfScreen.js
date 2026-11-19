import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { matchesQuery } from '../domain/search';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CollectionArtwork, CollectionRow } from '../ui/CollectionRow';
import {
  DesignAction,
  DesignIcon,
  DesignScreen,
  PageHeader,
  SearchField,
  designStyles,
} from '../ui/design';
import { Empty } from '../ui/components';
import { colors, s } from '../ui/theme';
import { ShelfScreen as ShelfLibrary } from './ShelfScreen';

export function MyShelfScreen() {
  const route = useRoute();
  const section = route.params?.section;
  const [library, setLibrary] = useState(
    Boolean(section && section !== 'lists'),
  );
  useEffect(() => {
    if (section) {
      setLibrary(section !== 'lists');
    }
  }, [section, route.params?.requestId]);
  if (library) {
    return <ShelfLibrary />;
  }
  return <MyCollections />;
}

function MyCollections() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const { params } = useRoute();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [grid, setGrid] = useState(false);
  const [alphabetical, setAlphabetical] = useState(false);
  useEffect(() => {
    if (params?.highlightId) {
      setQuery('');
    }
  }, [params?.requestId, params?.highlightId]);
  const lists = state.lists
    .filter(list => matchesQuery(query, list.title))
    .sort((a, b) =>
      alphabetical
        ? a.title.localeCompare(b.title)
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  const open = id => nav.navigate('List', { id });
  const create = () => nav.navigate('EditList');
  const options = list =>
    Alert.alert(list.title, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit Scentlist',
        onPress: () => nav.navigate('EditList', { id: list.id }),
      },
      {
        text: 'Delete Scentlist',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete this scentlist?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => dispatch({ type: 'deleteList', id: list.id }),
            },
          ]),
      },
    ]);
  const order = () =>
    Alert.alert('Sort MyShelf', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Newest', onPress: () => setAlphabetical(false) },
      { text: 'Name A–Z', onPress: () => setAlphabetical(true) },
    ]);
  return (
    <DesignScreen
      header={
        <PageHeader title="MyShelf" bordered={false}>
          <DesignAction
            name="searchTab"
            label="Search MyShelf"
            onPress={() => {
              if (searching) {
                setQuery('');
              }
              setSearching(!searching);
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add Scentlist"
            onPress={create}
            style={styles.control}
          >
            <Text style={styles.plus}>＋</Text>
          </Pressable>
        </PageHeader>
      }
    >
      {searching ? (
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search in MyShelf"
        />
      ) : null}
      <View style={s.between}>
        <Pressable style={s.row} accessibilityRole="button" onPress={order}>
          <DesignIcon name="filter" />
          <Text style={designStyles.text}>
            {alphabetical ? 'Name A–Z' : 'Newest'}
          </Text>
        </Pressable>
        <DesignAction
          name={grid ? 'shelf' : 'list'}
          label={grid ? 'Show list' : 'Show grid'}
          onPress={() => setGrid(!grid)}
        />
      </View>
      {grid ? (
        <View style={styles.grid}>
          {lists.map(list => (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              onPress={() => open(list.id)}
              onLongPress={() => options(list)}
              style={styles.tile}
            >
              <CollectionArtwork list={list} style={styles.tileArtwork} />
              <Text numberOfLines={2} style={designStyles.strong}>
                {list.title}
              </Text>
              <Text style={designStyles.caption}>
                {list.items.length} perfumes
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.tile, styles.add]}
            accessibilityRole="button"
            onPress={create}
          >
            <Text style={styles.plus}>＋</Text>
            <Text style={designStyles.caption}>Add Scentlist</Text>
          </Pressable>
        </View>
      ) : (
        lists.map(list => (
          <CollectionRow
            key={list.id}
            list={list}
            onPress={() => open(list.id)}
            trailing={
              <DesignAction
                name="darkMenu"
                label={list.title + ' options'}
                onPress={() => options(list)}
                style={styles.menu}
              />
            }
          />
        ))
      )}
      {!lists.length && !grid ? (
        <Empty
          title={query ? 'No scentlists found' : 'Your shelf is empty'}
          body={
            query
              ? 'Try another search.'
              : 'Create a scentlist to start organizing your perfumes.'
          }
          action={query ? undefined : 'Add Scentlist'}
          onAction={create}
        />
      ) : null}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  control: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 30, color: colors.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '30%', gap: 4 },
  tileArtwork: { width: '100%', height: undefined, aspectRatio: 1 },
  add: {
    borderRadius: 8,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  menu: { transform: [{ rotate: '90deg' }] },
});
