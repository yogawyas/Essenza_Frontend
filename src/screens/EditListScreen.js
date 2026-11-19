import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePreventRemove, useRoute } from '@react-navigation/native';
import { shelfDestination, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CATALOG, fragranceById } from '../domain/catalog';
import { COVER_COLORS, makeId } from '../domain/models';
import {
  Button,
  Chip,
  Empty,
  Field,
  Header,
  IconButton,
  Screen,
} from '../ui/components';
import { colors, s } from '../ui/theme';
import { collectionCovers } from '../ui/CollectionRow';
export function EditListScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const original = state.lists.find(list => list.id === params?.id);
  const [id] = useState(original?.id || makeId('list'));
  const [title, setTitle] = useState(original?.title || '');
  const [description, setDescription] = useState(original?.description || '');
  const [visibility, setVisibility] = useState(
    original?.visibility || 'private',
  );
  const [color, setColor] = useState(original?.color || COVER_COLORS[0]);
  const [cover, setCover] = useState(original?.cover || null);
  const [items, setItems] = useState(
    original?.items ??
      (fragranceById(params?.fragranceId)
        ? [{ fragranceId: params.fragranceId, note: '' }]
        : []),
  );
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const isNew = useState(() => !original)[0];
  const [saved, setSaved] = useState(false);
  const dirty =
    title !== (original?.title || '') ||
    description !== (original?.description || '') ||
    visibility !== (original?.visibility || 'private') ||
    color !== (original?.color || COVER_COLORS[0]) ||
    cover !== (original?.cover || null) ||
    JSON.stringify(items) !== JSON.stringify(original?.items || []);
  usePreventRemove(dirty && !saved, ({ data }) =>
    Alert.alert('Unsaved Changes', 'Discard changes and leave?', [
      {
        text: 'Keep Editing',
        style: 'cancel',
      },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => nav.dispatch(data.action),
      },
    ]),
  );
  useEffect(() => {
    if (saved) {
      if (isNew) {
        nav.popTo(
          'Home',
          shelfDestination({
            section: 'lists',
            highlightId: id,
            requestId: String(Date.now()),
          }),
        );
      } else {
        nav.goBack();
      }
    }
  }, [saved, nav, isNew, id]);
  const save = async () => {
    setBusy(true);
    if (
      await dispatch({
        type: 'saveList',
        list: {
          id,
          authorId: state.profile.id,
          title,
          description,
          visibility,
          color,
          ...(cover ? { cover } : {}),
          items,
          updatedAt: new Date().toISOString(),
        },
      })
    ) {
      setSaved(true);
    }
    setBusy(false);
  };
  const move = (index, direction) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) {
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };
  if (params?.id && !original && !saved) {
    return (
      <Screen>
        <Header title="SCENTLIST" onBack={() => nav.goBack()} />
        <Empty
          title="Scentlist unavailable for editing"
          body="You can edit your own scentlists."
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header
        title={original ? 'EDIT SCENTLIST' : 'NEW SCENTLIST'}
        onBack={() => nav.goBack()}
      />
      <Text style={s.h1}>Set the mood.</Text>
      <Text style={s.body}>
        Name your scentlist, choose fragrances, and add notes for each one.
      </Text>
      <Field
        label="Scentlist Name"
        placeholder="Campus rotation"
        value={title}
        onChangeText={setTitle}
        maxLength={60}
      />
      <Field
        label="Description"
        placeholder="Describe the mood or occasion."
        value={description}
        onChangeText={setDescription}
        maxLength={240}
        multiline
      />
      <Text style={s.label}>COVER COLOR</Text>
      <View style={s.wrap}>
        {COVER_COLORS.map(value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Cover color ${value}`}
            accessibilityState={{
              selected: color === value,
            }}
            onPress={() => setColor(value)}
            style={{
              width: 48,
              height: 48,
              backgroundColor: value,
              borderRadius: 24,
              borderWidth: color === value ? 4 : 0,
              borderColor: colors.gold,
            }}
          />
        ))}
      </View>
      <Text style={s.label}>COVER PHOTO</Text>
      <View style={s.wrap}>
        <Chip
          compact
          label="Automatic"
          selected={!cover}
          onPress={() => setCover(null)}
        />
        {collectionCovers.map(option => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={option.label + ' cover'}
            accessibilityState={{ selected: cover === option.id }}
            key={option.id}
            onPress={() => setCover(option.id)}
            style={[styles.cover, cover === option.id && styles.selected]}
          >
            <Image source={option.source} style={styles.photo} />
          </Pressable>
        ))}
      </View>
      <View style={s.wrap}>
        <Chip
          label="Private"
          selected={visibility === 'private'}
          onPress={() => setVisibility('private')}
        />
        <Chip
          label="Public"
          selected={visibility === 'public'}
          onPress={() => setVisibility('public')}
        />
      </View>
      <Text style={s.small}>
        {visibility === 'private'
          ? 'Only visible to you.'
          : 'Visible in Explore on this device.'}
      </Text>
      <Text style={s.h2}>Your selection · {items.length}</Text>
      {items.map((item, index) => (
        <View key={item.fragranceId} style={s.card}>
          <View style={s.between}>
            <Text style={[s.h3, s.flex]}>
              {index + 1}. {fragranceById(item.fragranceId)?.name}
            </Text>
            <IconButton
              name="trash"
              label={`Delete ${
                fragranceById(item.fragranceId)?.name
              } from the list`}
              onPress={() =>
                setItems(
                  items.filter(value => value.fragranceId !== item.fragranceId),
                )
              }
            />
          </View>
          <Field
            label={`Note for ${fragranceById(item.fragranceId)?.name}`}
            placeholder="Why did you add this fragrance?"
            value={item.note}
            maxLength={160}
            onChangeText={note =>
              setItems(
                items.map(value =>
                  value.fragranceId === item.fragranceId
                    ? {
                        ...value,
                        note,
                      }
                    : value,
                ),
              )
            }
          />
          <View style={s.row}>
            <IconButton
              name="up"
              label={`Move up ${fragranceById(item.fragranceId)?.name}`}
              onPress={() => move(index, -1)}
            />
            <IconButton
              name="down"
              label={`Move down ${fragranceById(item.fragranceId)?.name}`}
              onPress={() => move(index, 1)}
            />
          </View>
        </View>
      ))}
      <Field
        label="Add Perfume"
        autoFocus={Boolean(params?.add)}
        placeholder="Search by name or brand"
        value={query}
        onChangeText={setQuery}
      />
      <View style={s.wrap}>
        {CATALOG.filter(item =>
          `${item.name} ${item.brand}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ).map(item => (
          <Chip
            key={item.id}
            label={`${
              items.some(value => value.fragranceId === item.id) ? '✓ ' : '+ '
            }${item.name}`}
            selected={items.some(value => value.fragranceId === item.id)}
            onPress={() =>
              setItems(
                items.some(value => value.fragranceId === item.id)
                  ? items.filter(value => value.fragranceId !== item.id)
                  : [
                      ...items,
                      {
                        fragranceId: item.id,
                        note: '',
                      },
                    ],
              )
            }
          />
        ))}
      </View>
      <Button
        label="Save Scentlist"
        icon="check"
        disabled={!title.trim()}
        loading={busy}
        onPress={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: 49,
    height: 49,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: colors.green },
  photo: { width: '100%', height: '100%' },
});
