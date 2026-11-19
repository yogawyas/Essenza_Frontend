import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CURATORS, fragranceById } from '../domain/catalog';
import { makeId } from '../domain/models';
import { matchesQuery } from '../domain/search';
import { visibleLists } from '../domain/state';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CollectionArtwork } from '../ui/CollectionRow';
import { Empty, FragranceRow, IconButton } from '../ui/components';
import { Feedback } from '../ui/Feedback';
import {
  DesignAction,
  DesignIcon,
  DesignScreen,
  PageHeader,
  SearchField,
  designStyles,
} from '../ui/design';
import { colors, s, sansBold } from '../ui/theme';

export function CollectionScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [query, setQuery] = useState('');
  const [alphabetical, setAlphabetical] = useState(false);
  const list = visibleLists(state).find(item => item.id === params?.id);
  const own = list?.authorId === state.profile.id;
  const author = own
    ? state.profile
    : CURATORS.find(item => item.id === list?.authorId);
  const saved = state.savedListIds.includes(list?.id);
  const liked = state.likedListIds.includes(list?.id);
  const visibleItems = list?.items.filter(item => own || !item.private) || [];
  const matches = visibleItems
    .map(item => ({ item, fragrance: fragranceById(item.fragranceId) }))
    .filter(
      ({ fragrance, item }) =>
        fragrance &&
        matchesQuery(query, fragrance.name, fragrance.brand, item.note),
    );
  if (alphabetical) {
    matches.sort((a, b) => a.fragrance.name.localeCompare(b.fragrance.name));
  }
  const edit = () => nav.navigate('EditList', { id: list.id });
  const changeItems = items =>
    dispatch({
      type: 'saveList',
      list: { ...list, items, updatedAt: new Date().toISOString() },
    });
  const listOptions = () =>
    own
      ? Alert.alert(list.title, undefined, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit', onPress: edit },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              Alert.alert('Delete this scentlist?', undefined, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (await dispatch({ type: 'deleteList', id: list.id })) {
                      nav.goBack();
                    }
                  },
                },
              ]),
          },
        ])
      : Alert.alert(list.title, undefined, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Report',
            onPress: () =>
              Alert.alert(
                'Save a report on this device?',
                'Reports are stored locally for now.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Save report',
                    onPress: () =>
                      dispatch({
                        type: 'report',
                        report: {
                          id: makeId('report'),
                          listId: list.id,
                          reason: 'Inappropriate content',
                          createdAt: new Date().toISOString(),
                        },
                      }),
                  },
                ],
              ),
          },
          {
            text: 'Hide creator',
            style: 'destructive',
            onPress: async () => {
              if (await dispatch({ type: 'block', authorId: list.authorId })) {
                nav.goBack();
              }
            },
          },
        ]);
  const itemOptions = item =>
    Alert.alert('Perfume options', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: item.private ? 'Make visible' : 'Make private',
        onPress: () =>
          changeItems(
            list.items.map(row =>
              row.fragranceId === item.fragranceId
                ? { ...row, private: !row.private }
                : row,
            ),
          ),
      },
      {
        text: 'Remove from scentlist',
        style: 'destructive',
        onPress: () =>
          changeItems(
            list.items.filter(row => row.fragranceId !== item.fragranceId),
          ),
      },
    ]);
  return (
    <DesignScreen
      header={<PageHeader title="Collection" onBack={nav.goBack} />}
    >
      {list ? (
        <>
          <LinearGradient
            colors={['#252B30', colors.white]}
            style={styles.hero}
          >
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Search this collection"
            />
            <View style={styles.coverRow}>
              <CollectionArtwork list={list} style={styles.cover} />
              <DesignAction
                name="darkMenu"
                label="Scentlist options"
                onPress={listOptions}
                style={styles.coverMenu}
              />
            </View>
          </LinearGradient>
          <View style={styles.heading}>
            <Text style={styles.title}>{list.title}</Text>
            {own ? (
              <Text style={designStyles.caption}>
                {visibleItems.length} perfumes · 0 likes
              </Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  nav.navigate('OtherProfile', { id: list.authorId })
                }
              >
                <Text style={designStyles.strong}>{author?.name}</Text>
              </Pressable>
            )}
            {list.description ? (
              <Text style={s.body}>{list.description}</Text>
            ) : null}
          </View>
          {own ? (
            <View style={s.wrap}>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert('Arrange collection', undefined, [
                    { text: 'Edit order', onPress: edit },
                    {
                      text: alphabetical ? 'Saved order' : 'Name A–Z',
                      onPress: () => setAlphabetical(!alphabetical),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ])
                }
              >
                <DesignIcon name="sort" />
                <Text style={designStyles.caption}>Sort</Text>
              </Pressable>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={edit}
              >
                <DesignIcon name="edit" />
                <Text style={designStyles.caption}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={() =>
                  nav.navigate('EditList', { id: list.id, add: true })
                }
              >
                <Text style={designStyles.caption}>＋ Add</Text>
              </Pressable>
            </View>
          ) : (
            <View style={s.row}>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={() => dispatch({ type: 'bookmark', id: list.id })}
              >
                <DesignIcon name={saved ? 'bookmarkFill' : 'bookmark'} />
                <Text style={designStyles.caption}>
                  {saved ? 'Scentlist saved' : 'Save Scentlist'}
                </Text>
              </Pressable>
              <IconButton
                name="heart"
                label={liked ? 'Unlike scentlist' : 'Like scentlist'}
                active={liked}
                onPress={() => dispatch({ type: 'likeList', id: list.id })}
              />
              <Text style={designStyles.caption}>
                {liked ? '1 like' : '0 likes'}
              </Text>
            </View>
          )}
          {matches.map(({ fragrance, item }) => (
            <FragranceRow
              key={item.fragranceId}
              fragrance={fragrance}
              subtitle={
                item.private ? 'Private' : fragrance.accords.join(' · ')
              }
              onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
              right={
                own ? (
                  <DesignAction
                    name="darkMenu"
                    label={fragrance.name + ' options'}
                    onPress={() => itemOptions(item)}
                    style={styles.menu}
                  />
                ) : undefined
              }
            />
          ))}
          {!matches.length ? (
            <Empty
              title="No perfumes found"
              body={
                query
                  ? 'Try another search.'
                  : 'Perfumes added to this scentlist will appear here.'
              }
            />
          ) : null}
          <Feedback kind="scentlist" target={list.id} />
        </>
      ) : (
        <Empty
          title="Scentlist unavailable"
          body="This scentlist may have been removed or hidden."
        />
      )}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: -16, padding: 16, gap: 10 },
  coverRow: { alignItems: 'center' },
  cover: {
    width: '70%',
    maxWidth: 270,
    aspectRatio: 1,
    height: undefined,
    elevation: 3,
  },
  coverMenu: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 22,
    transform: [{ rotate: '90deg' }],
  },
  heading: { alignItems: 'center', gap: 4 },
  title: {
    fontFamily: sansBold,
    color: colors.ink,
    fontSize: 26,
    textAlign: 'center',
  },
  menu: { transform: [{ rotate: '90deg' }] },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.muted,
    borderRadius: 18,
    backgroundColor: colors.white,
    minHeight: 32,
  },
});
