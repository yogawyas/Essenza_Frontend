import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  RouteProp,
  usePreventRemove,
  useRoute,
} from '@react-navigation/native';
import {
  RootParams,
  shelfDestination,
  useAppNavigation,
} from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CATALOG, fragranceById } from '../domain/catalog';
import {
  COVER_COLORS,
  makeId,
  ScentlistItem,
  Visibility,
} from '../domain/models';
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

export function EditListScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'EditList'>>();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const original = state.lists.find(list => list.id === params?.id);
  const [id] = useState(original?.id || makeId('list'));
  const [title, setTitle] = useState(original?.title || '');
  const [description, setDescription] = useState(original?.description || '');
  const [visibility, setVisibility] = useState<Visibility>(
    original?.visibility || 'private',
  );
  const [color, setColor] = useState(original?.color || COVER_COLORS[0]);
  const [items, setItems] = useState<ScentlistItem[]>(original?.items || []);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty =
    title !== (original?.title || '') ||
    description !== (original?.description || '') ||
    visibility !== (original?.visibility || 'private') ||
    color !== (original?.color || COVER_COLORS[0]) ||
    JSON.stringify(items) !== JSON.stringify(original?.items || []);
  usePreventRemove(dirty && !saved, ({ data }) =>
    Alert.alert('Perubahan belum disimpan', 'Keluar dan buang perubahan?', [
      { text: 'Lanjut edit', style: 'cancel' },
      {
        text: 'Buang',
        style: 'destructive',
        onPress: () => nav.dispatch(data.action),
      },
    ]),
  );
  useEffect(() => {
    if (saved) {
      if (original) {
        nav.goBack();
      } else {
        nav.popTo(
          'Home',
          shelfDestination({
            section: 'lists',
            highlightId: id,
            requestId: String(Date.now()),
          }),
        );
      }
    }
  }, [saved, nav, original, id]);
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
          items,
          updatedAt: new Date().toISOString(),
        },
      })
    ) {
      setSaved(true);
    }
    setBusy(false);
  };
  const move = (index: number, direction: number) => {
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
          title="Daftar tidak bisa diedit"
          body="Kamu hanya bisa mengedit daftar milikmu."
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
        Beri nama, pilih aroma, lalu ceritakan alasanmu.
      </Text>
      <Field
        label="Judul scentlist"
        placeholder="Contoh: Campus rotation"
        value={title}
        onChangeText={setTitle}
        maxLength={60}
      />
      <Field
        label="Tentang daftar ini"
        placeholder="Suasana seperti apa yang kamu bayangkan?"
        value={description}
        onChangeText={setDescription}
        maxLength={240}
        multiline
      />
      <Text style={s.label}>WARNA COVER</Text>
      <View style={s.wrap}>
        {COVER_COLORS.map(value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Warna cover ${value}`}
            accessibilityState={{ selected: color === value }}
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
      <View style={s.wrap}>
        <Chip
          label="Private"
          selected={visibility === 'private'}
          onPress={() => setVisibility('private')}
        />
        <Chip
          label="Public · demo"
          selected={visibility === 'public'}
          onPress={() => setVisibility('public')}
        />
      </View>
      <Text style={s.small}>
        {visibility === 'private'
          ? 'Daftar pribadi, tidak muncul di Explore.'
          : 'Muncul di Explore perangkat ini. Belum dibagikan ke internet.'}
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
              label={`Hapus ${
                fragranceById(item.fragranceId)?.name
              } dari daftar`}
              onPress={() =>
                setItems(
                  items.filter(value => value.fragranceId !== item.fragranceId),
                )
              }
            />
          </View>
          <Field
            label={`Catatan ${fragranceById(item.fragranceId)?.name}`}
            placeholder="Kenapa parfum ini masuk daftar?"
            value={item.note}
            maxLength={160}
            onChangeText={note =>
              setItems(
                items.map(value =>
                  value.fragranceId === item.fragranceId
                    ? { ...value, note }
                    : value,
                ),
              )
            }
          />
          <View style={s.row}>
            <IconButton
              name="up"
              label={`Naikkan ${fragranceById(item.fragranceId)?.name}`}
              onPress={() => move(index, -1)}
            />
            <IconButton
              name="down"
              label={`Turunkan ${fragranceById(item.fragranceId)?.name}`}
              onPress={() => move(index, 1)}
            />
          </View>
        </View>
      ))}
      <Field
        label="Tambahkan parfum"
        placeholder="Cari nama atau brand"
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
                  : [...items, { fragranceId: item.id, note: '' }],
              )
            }
          />
        ))}
      </View>
      <Button
        label="Simpan scentlist"
        icon="check"
        disabled={!title.trim()}
        loading={busy}
        onPress={save}
      />
    </Screen>
  );
}
