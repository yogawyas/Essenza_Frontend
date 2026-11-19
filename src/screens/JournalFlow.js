import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fragranceById } from '../domain/catalog';
import { groupWearLogs, journalPerfumes } from '../domain/journal';
import { OCCASION_LABELS } from '../domain/models';
import { matchesQuery } from '../domain/search';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { Bottle, Chip, Empty } from '../ui/components';
import {
  DesignAction,
  DesignIcon,
  DesignScreen,
  PageHeader,
  SearchField,
  designStyles,
} from '../ui/design';
import { colors, s } from '../ui/theme';
import { useNow } from '../ui/useNow';
import { FragranceTags } from '../ui/FragranceTags';
import { ShelfEditor } from '../ui/ShelfEditor';

const shelfLabels = {
  have: 'Owned',
  had: 'Used to',
  want: 'Wishlist',
  unfiled: 'Other perfumes',
};

function Tools({ query, setQuery, placeholder, onSort }) {
  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onSort}
        style={styles.sort}
      >
        <DesignIcon name="sort" />
        <Text style={designStyles.caption}>Sort</Text>
      </Pressable>
      <View style={s.flex}>
        <SearchField
          compact
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
        />
      </View>
    </View>
  );
}

function changeSort(title, first, second, setter) {
  Alert.alert(title, undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: first, onPress: () => setter(false) },
    { text: second, onPress: () => setter(true) },
  ]);
}

function RecordRow({ fragrance, subtitle, onPress, trailing }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.recordLink}
      >
        <Bottle fragrance={fragrance} size={54} />
        <View style={s.flex}>
          <Text style={s.body}>{fragrance.brand}</Text>
          <Text numberOfLines={1} style={s.h3}>
            {fragrance.name}
          </Text>
          {subtitle ? (
            <Text style={designStyles.caption}>{subtitle}</Text>
          ) : null}
        </View>
      </Pressable>
      {trailing || <DesignIcon name="chevron" />}
    </View>
  );
}

export function JournalScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [alphabetical, setAlphabetical] = useState(false);
  const items = journalPerfumes(state).filter(({ fragrance }) =>
    matchesQuery(query, fragrance.name, fragrance.brand),
  );
  items.sort((a, b) =>
    alphabetical
      ? a.fragrance.name.localeCompare(b.fragrance.name)
      : (b.logs[0]?.wornAt || '').localeCompare(a.logs[0]?.wornAt || ''),
  );
  const groups = Object.entries(shelfLabels).filter(
    ([key]) => status === 'all' || status === key,
  );
  const open = id => nav.navigate('JournalDetail', { id });
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Journal" onBack={nav.goBack} />}
    >
      <Tools
        query={query}
        setQuery={setQuery}
        placeholder="Search in Journal"
        onSort={() =>
          changeSort('Sort journal', 'Most recent', 'Name A–Z', setAlphabetical)
        }
      />
      <View style={s.wrap}>
        {[['all', 'All'], ...Object.entries(shelfLabels).slice(0, 3)].map(
          ([key, label]) => (
            <Chip
              compact
              key={key}
              label={label}
              selected={status === key}
              onPress={() => setStatus(key)}
            />
          ),
        )}
      </View>
      {groups.map(([key, label]) => {
        const rows = items.filter(item => item.status === key);
        return rows.length ? (
          <View key={key}>
            <Text style={designStyles.caption}>{label}</Text>
            {rows.map(({ fragrance, logs }) => (
              <RecordRow
                key={fragrance.id}
                fragrance={fragrance}
                onPress={() => open(fragrance.id)}
                trailing={
                  <DesignAction
                    name="darkMenu"
                    label={fragrance.name + ' options'}
                    onPress={() =>
                      Alert.alert(fragrance.name, undefined, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Open journal',
                          onPress: () => open(fragrance.id),
                        },
                        {
                          text: 'Log wear',
                          onPress: () =>
                            nav.navigate('Wear', { fragranceId: fragrance.id }),
                        },
                      ])
                    }
                    style={styles.menu}
                  />
                }
                subtitle={
                  logs.length + (logs.length === 1 ? ' wear' : ' wears')
                }
              />
            ))}
          </View>
        ) : null;
      })}
      {!items.some(item => status === 'all' || status === item.status) ? (
        <Empty
          title="No fragrances here"
          body="Log a wear or add a perfume to your shelf to get started."
        />
      ) : null}
    </DesignScreen>
  );
}

export function JournalDetailScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const now = useNow();
  const [query, setQuery] = useState('');
  const [ascending, setAscending] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const fragrance = fragranceById(params?.id);
  const groups = groupWearLogs(
    state.logs.filter(
      log =>
        log.fragranceId === params?.id &&
        matchesQuery(query, log.note, OCCASION_LABELS[log.occasion]),
    ),
    now,
    ascending,
  );
  const logOptions = log =>
    Alert.alert('Journal entry', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit',
        onPress: () =>
          nav.navigate('Wear', { fragranceId: log.fragranceId, logId: log.id }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Delete this entry?',
            'This will also update your wear statistics.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => dispatch({ type: 'deleteWear', id: log.id }),
              },
            ],
          ),
      },
    ]);
  return (
    <DesignScreen
      paper
      header={
        <PageHeader title="Journal" onBack={nav.goBack}>
          {fragrance ? (
            <DesignAction
              name="darkMenu"
              label="Change journal category"
              onPress={() => setEditingStatus(true)}
              style={styles.menu}
            />
          ) : null}
        </PageHeader>
      }
    >
      {fragrance ? (
        <>
          <View style={styles.bottle}>
            <Bottle fragrance={fragrance} size={170} />
          </View>
          <View>
            <Text style={s.body}>{fragrance.brand}</Text>
            <Text style={s.h1}>{fragrance.name}</Text>
            <Text style={s.small}>{fragrance.description}</Text>
          </View>
          <FragranceTags accords={fragrance.accords} />
          <Tools
            query={query}
            setQuery={setQuery}
            placeholder="Search journal entries"
            onSort={() =>
              changeSort(
                'Sort entries',
                'Newest first',
                'Oldest first',
                setAscending,
              )
            }
          />
          {groups.map(group => (
            <View key={group.title} style={designStyles.stack}>
              <Text style={designStyles.caption}>{group.title}</Text>
              {group.items.map(log => (
                <View key={log.id} style={styles.entry}>
                  <View style={s.between}>
                    <Text style={styles.entryTitle}>
                      {new Date(log.wornAt).toLocaleDateString('en-GB')} ·{' '}
                      {OCCASION_LABELS[log.occasion]}
                    </Text>
                    <DesignAction
                      name="menu"
                      label="Journal entry options"
                      onPress={() => logOptions(log)}
                    />
                  </View>
                  {log.note ? (
                    <Text style={styles.note}>{log.note}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
          {!groups.length ? (
            <Empty
              title="No entries found"
              body={
                query
                  ? 'Try another search.'
                  : 'Your notes for this fragrance will appear here.'
              }
            />
          ) : null}
          {editingStatus ? (
            <ShelfEditor
              fragrance={fragrance}
              item={state.shelf.find(item => item.fragranceId === fragrance.id)}
              onClose={() => setEditingStatus(false)}
              onView={() => setEditingStatus(false)}
              finishLabel="Done"
            />
          ) : null}
        </>
      ) : (
        <Empty
          title="Fragrance unavailable"
          body="Choose another fragrance from your journal."
        />
      )}
    </DesignScreen>
  );
}

export function HistoryScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const now = useNow();
  const [query, setQuery] = useState('');
  const [ascending, setAscending] = useState(false);
  const groups = groupWearLogs(
    state.logs.filter(log => {
      const fragrance = fragranceById(log.fragranceId);
      return matchesQuery(query, fragrance?.name, fragrance?.brand, log.note);
    }),
    now,
    ascending,
  );
  return (
    <DesignScreen
      paper
      header={<PageHeader title="History" onBack={nav.goBack} />}
    >
      <Tools
        query={query}
        setQuery={setQuery}
        placeholder="Search in History"
        onSort={() =>
          changeSort(
            'Sort history',
            'Newest first',
            'Oldest first',
            setAscending,
          )
        }
      />
      {groups.map(group => (
        <View key={group.title}>
          <Text style={s.h2}>{group.title}</Text>
          {group.items.map(log => {
            const fragrance = fragranceById(log.fragranceId);
            return fragrance ? (
              <RecordRow
                key={log.id}
                fragrance={fragrance}
                subtitle={new Date(log.wornAt).toLocaleString('en-GB')}
                onPress={() =>
                  nav.navigate('Wear', {
                    fragranceId: log.fragranceId,
                    logId: log.id,
                  })
                }
              />
            ) : null;
          })}
        </View>
      ))}
      {!groups.length ? (
        <Empty
          title="No wear history"
          body="Recorded wears will appear here."
        />
      ) : null}
    </DesignScreen>
  );
}

export function StatsScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [query, setQuery] = useState('');
  const [alphabetical, setAlphabetical] = useState(false);
  const rows = journalPerfumes(state).filter(
    row =>
      row.logs.length &&
      matchesQuery(query, row.fragrance.name, row.fragrance.brand),
  );
  rows.sort((a, b) =>
    alphabetical
      ? a.fragrance.name.localeCompare(b.fragrance.name)
      : b.logs.length - a.logs.length,
  );
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Perfume Stats" onBack={nav.goBack} />}
    >
      <Tools
        query={query}
        setQuery={setQuery}
        placeholder="Search in Stats"
        onSort={() =>
          changeSort('Sort perfumes', 'Most worn', 'Name A–Z', setAlphabetical)
        }
      />
      {rows.map(({ fragrance, logs }) => (
        <RecordRow
          key={fragrance.id}
          fragrance={fragrance}
          subtitle={
            'Worn ' + logs.length + (logs.length === 1 ? ' time' : ' times')
          }
          onPress={() => nav.navigate('JournalDetail', { id: fragrance.id })}
        />
      ))}
      {!rows.length ? (
        <Empty
          title="No statistics yet"
          body="Statistics are calculated from the wears recorded in your journal."
        />
      ) : null}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.muted,
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 6,
  },
  row: {
    minHeight: 83,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  recordLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  bottle: { alignItems: 'center', paddingTop: 12 },
  entry: { backgroundColor: colors.green, borderRadius: 4, padding: 8 },
  entryTitle: { color: colors.white },
  note: {
    backgroundColor: colors.sage,
    color: colors.ink,
    borderRadius: 4,
    padding: 8,
  },
  menu: { transform: [{ rotate: '90deg' }] },
});
