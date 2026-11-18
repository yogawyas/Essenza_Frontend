import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EDITORIAL_LISTS, fragranceById } from '../domain/catalog';
import { openShelf } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { Bottle, Button, Header, IconButton, Screen } from '../ui/components';
import { useNow } from '../ui/useNow';
import { colors, s } from '../ui/theme';

export function HomeScreen({ navigation }) {
  const { state } = useApp();
  const now = useNow();
  const logs = [...state.logs]
    .sort((a, b) => b.wornAt.localeCompare(a.wornAt))
    .slice(0, 5);
  const suggested = fragranceById('acqua-di-gio-parfum');
  const showShelves = () => openShelf(navigation, { section: 'lists' });
  return (
    <Screen contentStyle={{ gap: 14 }}>
      <View style={s.between}>
        <Header title="Essenza" />
        <View style={s.row}>
          <IconButton
            name="bell"
            label="Usage history"
            onPress={() => navigation.navigate('Journal')}
          />
          <IconButton
            name="settings"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>
      <View style={s.between}>
        <Text style={s.h2}>Recently Worn</Text>
      </View>
      {logs.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {logs.map(log => {
            const fragrance = fragranceById(log.fragranceId);
            if (!fragrance) return null;
            const time = new Date(log.wornAt);
            return (
              <Pressable
                key={log.id}
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate('Fragrance', { id: fragrance.id })
                }
                style={[s.row, styles.wear]}
              >
                <Bottle fragrance={fragrance} size={56} />
                <View style={s.flex}>
                  <Text style={styles.light}>
                    {time.toDateString() === now.toDateString()
                      ? 'Worn Now · Today'
                      : time.toLocaleDateString('en-US')}
                  </Text>
                  <Text style={[s.h3, styles.light]}>{fragrance.name}</Text>
                  <Text style={styles.light}>
                    {log.occasion} ·{' '}
                    {time.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.wear}>
          <Text style={styles.light}>No fragrances logged yet.</Text>
          <Button
            label="Pick today's scent"
            variant="secondary"
            onPress={() => navigation.navigate('TodayPlanner')}
          />
        </View>
      )}
      <View style={s.between}>
        <Text style={s.h2}>MyShelf</Text>
        <Pressable accessibilityRole="button" onPress={showShelves}>
          <Text style={s.small}>{state.lists.length} Collections ›</Text>
        </Pressable>
      </View>
      <View style={s.wrap}>
        {state.lists.slice(0, 3).map(list => (
          <Pressable
            key={list.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('List', { id: list.id })}
            style={[styles.shortcut, { backgroundColor: list.color }]}
          >
            <Text numberOfLines={2} style={styles.light}>
              {list.title}
            </Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('EditList')}
          style={styles.shortcut}
        >
          <Text style={s.small}>Add Collection ＋</Text>
        </Pressable>
      </View>
      <View style={s.between}>
        <Text style={s.h2}>Shelf You Might Like</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('Scentlists', { filter: 'Explore' })
          }
        >
          <Text style={s.small}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {EDITORIAL_LISTS.filter(
          list => !state.blocked.includes(list.authorId),
        ).map(list => (
          <Pressable
            key={list.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('List', { id: list.id })}
            style={[styles.featured, { backgroundColor: list.color }]}
          >
            <Text style={[s.h3, styles.light]}>{list.title}</Text>
            <Text style={styles.light}>{list.items.length} Fragrances</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.h2}>A New Direction</Text>
      <Pressable
        accessibilityRole="button"
        style={[s.between, s.card]}
        onPress={() => navigation.navigate('Fragrance', { id: suggested.id })}
      >
        <View style={s.flex}>
          <Text style={s.small}>{suggested.brand}</Text>
          <Text style={s.h3}>{suggested.name}</Text>
          <Text style={s.small}>{suggested.concentration}</Text>
        </View>
        <Bottle fragrance={suggested} size={62} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wear: {
    backgroundColor: colors.green,
    borderRadius: 14,
    padding: 13,
    gap: 8,
    minWidth: 240,
  },
  light: { color: colors.white },
  shortcut: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 11,
    flexBasis: '48%',
    minHeight: 42,
    justifyContent: 'center',
  },
  featured: {
    width: 116,
    height: 124,
    borderRadius: 9,
    padding: 10,
    justifyContent: 'flex-end',
  },
});
