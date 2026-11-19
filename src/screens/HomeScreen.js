import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../storage/AppProvider';
import { openShelf, useAppNavigation } from '../navigation/types';
import { CURATORS, fragranceById } from '../domain/catalog';
import { visibleLists } from '../domain/state';
import { recommend } from '../domain/recommendations';
import { OCCASION_LABELS } from '../domain/models';
import { todayLog } from '../domain/today';
import { Bottle, Button, FragranceRow } from '../ui/components';
import { CollectionArtwork } from '../ui/CollectionRow';
import {
  BrandBar,
  DesignAction,
  DesignScreen,
  designStyles,
} from '../ui/design';
import { useNow } from '../ui/useNow';
import { colors, s, sans, sansBold, serif } from '../ui/theme';

function HomeSection({ title, link, onPress, children }) {
  return (
    <View style={styles.section}>
      <View style={s.between}>
        <Text style={styles.heading}>{title}</Text>
        {link ? (
          <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
            <Text style={designStyles.caption}>{link} ›</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function HomeScreen() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const now = useNow();
  const current = todayLog(state, now);
  const scroll = useRef(null);
  const lastCurrentId = useRef(current?.id);
  useEffect(() => {
    if (lastCurrentId.current === current?.id) {
      return;
    }
    lastCurrentId.current = current?.id;
    const frame = requestAnimationFrame(() =>
      scroll.current?.scrollTo({ y: 0, animated: false }),
    );
    return () => cancelAnimationFrame(frame);
  }, [current?.id]);
  const discovery = recommend(state, 'discovery', 'Kuliah', null, now).slice(
    0,
    4,
  );
  const pick = recommend(state, 'owned', 'Kuliah', null, now)[0];
  const publicLists = visibleLists(state).filter(
    list => list.authorId !== state.profile.id,
  );
  const openList = id => nav.navigate('List', { id });
  const editLog = log =>
    nav.navigate('Wear', { fragranceId: log.fragranceId, logId: log.id });
  const logMenu = log =>
    Alert.alert('Wear entry', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit entry', onPress: () => editLog(log) },
      {
        text: 'Delete entry',
        style: 'destructive',
        onPress: () => dispatch({ type: 'deleteWear', id: log.id }),
      },
    ]);

  return (
    <DesignScreen header={<BrandBar navigation={nav} />} scrollRef={scroll}>
      <HomeSection
        title="Recently Worn"
        link="See Journal"
        onPress={() => nav.navigate('Journal')}
      >
        {state.logs.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {state.logs.slice(0, 5).map(log => {
              const fragrance = fragranceById(log.fragranceId);
              if (!fragrance) {
                return null;
              }
              return (
                <View key={log.id} style={styles.wearCard}>
                  <View style={styles.wearHeader}>
                    <Text style={styles.onGreen}>
                      {log.id === current?.id
                        ? '✓  Currently Worn · Today'
                        : 'Recently Worn'}
                    </Text>
                    <DesignAction
                      name="menu"
                      label="Wear entry options"
                      onPress={() => logMenu(log)}
                      style={styles.menu}
                    />
                  </View>
                  <Pressable
                    style={styles.wearMain}
                    accessibilityRole="button"
                    accessibilityLabel={
                      'Edit ' + fragrance.name + ' wear entry'
                    }
                    onPress={() => editLog(log)}
                  >
                    <View style={styles.wearPhoto}>
                      <Bottle fragrance={fragrance} size={54} />
                    </View>
                    <View style={s.flex}>
                      <Text style={styles.wearName} numberOfLines={1}>
                        {fragrance.name}
                      </Text>
                      {log.note ? (
                        <Text style={styles.onGreen} numberOfLines={2}>
                          {log.note}
                        </Text>
                      ) : null}
                      <Text style={styles.onGreen}>
                        {OCCASION_LABELS[log.occasion]} ·{' '}
                        {new Date(log.wornAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyWear}>
            <Text style={designStyles.text}>
              {pick ? pick.fragrance.name : 'Your wear history starts here.'}
            </Text>
            <Button
              label={pick ? 'Log wear today' : 'Find a fragrance'}
              variant="secondary"
              onPress={() =>
                pick
                  ? nav.navigate('Wear', {
                      fragranceId: pick.fragrance.id,
                      quick: true,
                    })
                  : nav.navigate('Home', { screen: 'Discover' })
              }
            />
          </View>
        )}
      </HomeSection>
      <HomeSection
        title="MyShelf"
        link={state.lists.length + ' Scentlists'}
        onPress={() => openShelf(nav, { section: 'lists' })}
      >
        <View style={styles.shelfGrid}>
          {state.lists.slice(0, 3).map(list => (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              onPress={() => openList(list.id)}
              style={[styles.miniList, { backgroundColor: list.color }]}
            >
              <CollectionArtwork list={list} style={styles.miniImage} />
              <View style={s.flex}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {list.title}
                </Text>
                <Text style={styles.onGreen}>{list.items.length} perfumes</Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => nav.navigate('EditList')}
            style={styles.addList}
          >
            <Text style={designStyles.text}>Add Scentlist ＋</Text>
          </Pressable>
        </View>
      </HomeSection>
      <HomeSection
        title="Shelf You Might Like"
        link="See All"
        onPress={() =>
          nav.navigate('Home', {
            screen: 'Discover',
            params: {
              screen: 'DiscoverHome',
              params: { category: 'lists' },
              pop: true,
            },
          })
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {publicLists.map(list => (
            <Pressable
              key={list.id}
              accessibilityRole="button"
              onPress={() => openList(list.id)}
              style={styles.suggestion}
            >
              <CollectionArtwork list={list} style={styles.suggestionImage} />
              <Text style={styles.miniTitle} numberOfLines={2}>
                {list.title}
              </Text>
              <Text style={styles.onGreen} numberOfLines={1}>
                {CURATORS.find(author => author.id === list.authorId)?.name}
              </Text>
              <Text style={styles.onGreen}>{list.items.length} perfumes</Text>
            </Pressable>
          ))}
        </ScrollView>
        {publicLists.length === 0 ? (
          <Text style={designStyles.caption}>No collections to show.</Text>
        ) : null}
      </HomeSection>
      <HomeSection title="A New Direction">
        {discovery.map(({ fragrance }) => (
          <FragranceRow
            key={fragrance.id}
            fragrance={fragrance}
            subtitle={fragrance.accords.join(' · ')}
            onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
          />
        ))}
        {discovery.length === 0 ? (
          <Text style={designStyles.caption}>
            No recommendations match your preferences.
          </Text>
        ) : null}
      </HomeSection>
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8, marginBottom: 5 },
  heading: {
    fontFamily: serif,
    color: colors.green,
    fontSize: 24,
    lineHeight: 30,
  },
  carousel: { gap: 12, paddingBottom: 3 },
  wearCard: { width: 230, borderRadius: 8, backgroundColor: colors.green },
  wearHeader: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sage,
  },
  menu: { minHeight: 32 },
  wearMain: { padding: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  wearPhoto: {
    width: 70,
    height: 70,
    borderRadius: 5,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wearName: { fontFamily: serif, color: colors.white, fontSize: 16 },
  onGreen: { color: colors.ivory, fontFamily: sans, fontSize: 10 },
  emptyWear: {
    padding: 12,
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.sage,
  },
  shelfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniList: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 8,
    minHeight: 46,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  miniTitle: { color: colors.white, fontFamily: sansBold, fontSize: 11 },
  miniImage: { width: 35, height: 35 },
  addList: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
  },
  suggestion: { width: 92, backgroundColor: colors.green, gap: 3, padding: 6 },
  suggestionImage: { width: 80, height: 73, borderRadius: 0 },
});
