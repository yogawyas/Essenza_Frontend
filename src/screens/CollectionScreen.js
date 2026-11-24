import React, { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CURATORS, fragranceById } from '../domain/catalog';
import { makeId } from '../domain/models';
import { matchesQuery } from '../domain/search';
import { visibleLists } from '../domain/state';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CollectionArtwork } from '../ui/CollectionRow';
import { AddToCollection } from '../ui/AddToCollection';
import { AddPerfumeSheet } from '../ui/AddPerfumeSheet';
import { OptionSheet, SortSheet } from '../ui/OptionSheet';
import { ScentlistMenu } from '../ui/ScentlistMenu';
import { figma } from '../ui/figmaAssets';
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
import { colors, s, sans, sansBold } from '../ui/theme';

export function CollectionScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [query, setQuery] = useState('');
  const [alphabetical, setAlphabetical] = useState(false);
  const [panel, setPanel] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [menuPerfume, setMenuPerfume] = useState(null);
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
  const closePanel = () => setPanel(null);
  const commitPanel = async action => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    setBusy(true);
    const committed = await dispatch(action);
    setBusy(false);
    pending.current = false;
    if (committed) {
      closePanel();
      if (action.type === 'block') {
        nav.goBack();
      }
    }
  };
  const itemOptions = fragrance => {
    setMenuPerfume(fragrance);
    setPanel('perfume');
  };
  return (
    <DesignScreen
      header={<PageHeader title="Collection" onBack={nav.goBack} />}
    >
      {list ? (
        <>
          <View style={styles.intro}>
            <LinearGradient
              colors={[
                visibleItems.length || list.cover ? '#252B30' : '#AEACA2',
                colors.ivory,
              ]}
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
                  name="collectionMenu"
                  label="Scentlist options"
                  onPress={() => setPanel(own ? 'list' : 'publicList')}
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
          </View>
          {own ? (
            <View style={s.wrap}>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={() => setPanel('sort')}
              >
                <DesignIcon name="collectionSort" />
                <Text style={designStyles.caption}>Sort</Text>
              </Pressable>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={edit}
              >
                <DesignIcon name="collectionEdit" />
                <Text style={designStyles.caption}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.control}
                accessibilityRole="button"
                onPress={() => setPanel('add')}
              >
                <DesignIcon name="menuPlus" />
                <Text style={designStyles.caption}>Add</Text>
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
                    onPress={() => itemOptions(fragrance)}
                    style={styles.menu}
                  />
                ) : undefined
              }
            />
          ))}
          {!visibleItems.length && own ? (
            <View style={styles.empty}>
              <Image
                source={figma.emptyCollection}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setPanel('add')}
                style={styles.addEmpty}
              >
                <Text style={styles.addEmptyText}>+ Add to This Scentlist</Text>
              </Pressable>
            </View>
          ) : !matches.length ? (
            <Empty
              title="No perfumes found"
              body={query ? 'Try another search.' : undefined}
            />
          ) : null}
          {!own || visibleItems.length ? (
            <Feedback kind="scentlist" target={list.id} />
          ) : null}
          {panel === 'sort' ? (
            <SortSheet
              alphabetical={alphabetical}
              onChange={setAlphabetical}
              onClose={closePanel}
            />
          ) : null}
          {panel === 'list' ? (
            <ScentlistMenu
              list={list}
              onClose={closePanel}
              onEdit={edit}
              onDelete={nav.goBack}
            />
          ) : null}
          {panel === 'publicList' ? (
            <OptionSheet
              onClose={closePanel}
              busy={busy}
              busyLabel="Hide Creator"
              rows={[
                { label: 'Report', onPress: () => setPanel('report') },
                {
                  label: 'Hide Creator',
                  onPress: () =>
                    commitPanel({ type: 'block', authorId: list.authorId }),
                },
              ]}
            />
          ) : null}
          {panel === 'report' ? (
            <OptionSheet
              title="Save a report on this device?"
              onClose={closePanel}
              busy={busy}
              busyLabel="Save Report"
              rows={[
                { label: 'Cancel', onPress: closePanel },
                {
                  label: 'Save Report',
                  onPress: () =>
                    commitPanel({
                      type: 'report',
                      report: {
                        id: makeId('report'),
                        listId: list.id,
                        reason: 'Inappropriate content',
                        createdAt: new Date().toISOString(),
                      },
                    }),
                },
              ]}
            />
          ) : null}
          {panel === 'add' ? (
            <AddPerfumeSheet list={list} onClose={closePanel} />
          ) : null}
          {panel === 'perfume' && menuPerfume ? (
            <OptionSheet
              onClose={closePanel}
              rows={[
                {
                  label: 'Add to Another Scentlist',
                  icon: 'menuPlus',
                  onPress: () => setPanel('copy'),
                },
                {
                  label: 'Delete Perfume',
                  icon: 'listDelete',
                  onPress: () => setPanel('remove'),
                },
              ]}
            />
          ) : null}
          {panel === 'remove' && menuPerfume ? (
            <OptionSheet
              title="Delete this perfume?"
              onClose={closePanel}
              busy={busy}
              busyLabel="Delete Perfume"
              rows={[
                { label: 'Cancel', onPress: closePanel },
                {
                  label: 'Delete Perfume',
                  icon: 'listDelete',
                  onPress: () =>
                    commitPanel({
                      type: 'removeListPerfume',
                      id: list.id,
                      fragranceId: menuPerfume.id,
                      updatedAt: new Date().toISOString(),
                    }),
                },
              ]}
            />
          ) : null}
          {panel === 'copy' && menuPerfume ? (
            <AddToCollection
              fragrance={menuPerfume}
              excludeId={list.id}
              onClose={closePanel}
              onCreate={() => {
                closePanel();
                nav.navigate('EditList', { fragranceId: menuPerfume.id });
              }}
            />
          ) : null}
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
  intro: { gap: 6 },
  hero: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
    gap: 14,
  },
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
  },
  heading: { alignItems: 'center', gap: 3 },
  title: {
    fontFamily: sansBold,
    color: colors.ink,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'center',
  },
  menu: { transform: [{ rotate: '90deg' }] },
  empty: { paddingTop: 14, gap: 20, alignItems: 'center' },
  emptyImage: { width: 86, height: 86 },
  addEmpty: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 41,
    borderRadius: 22,
    backgroundColor: colors.green,
  },
  addEmptyText: { fontFamily: sans, color: colors.white, fontSize: 12 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.muted,
    borderRadius: 18,
    backgroundColor: colors.white,
    minHeight: 25,
  },
});
