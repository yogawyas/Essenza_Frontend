import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { visibleLists } from '../domain/state';
import { CURATORS } from '../domain/catalog';
import {
  Button,
  Chip,
  Empty,
  Header,
  ListCover,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';

export function ScentlistsScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [filter, setFilter] = useState('Explore');
  const lists = visibleLists(state).filter(list =>
    filter === 'Milikku'
      ? list.authorId === state.profile.id
      : filter === 'Disimpan'
      ? state.savedListIds.includes(list.id)
      : filter === 'Following'
      ? state.following.includes(list.authorId)
      : list.visibility === 'public',
  );
  return (
    <Screen>
      <Header
        title="SCENTLISTS"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View style={{ gap: 9 }}>
        <Text style={s.h1}>A playlist.{'\n'}For your senses.</Text>
        <Text style={s.body}>
          Rangkai parfum menjadi cerita. Temukan inspirasi dari kurator.
        </Text>
      </View>
      <Button
        label="Buat scentlist"
        icon="plus"
        onPress={() => nav.navigate('EditList')}
      />
      <View style={s.wrap}>
        {['Explore', 'Milikku', 'Disimpan', 'Following'].map(item => (
          <Chip
            key={item}
            label={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      <Text style={s.small}>
        Komunitas demo · daftar publik, simpan, dan follow hanya disimulasikan
        di perangkat ini.
      </Text>
      {lists.length ? (
        lists.map(list => (
          <View key={list.id} style={{ gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buka scentlist ${list.title}`}
              onPress={() => nav.navigate('List', { id: list.id })}
            >
              <ListCover list={list} />
            </Pressable>
            <View style={s.between}>
              <Text style={s.small}>
                Oleh{' '}
                {list.authorId === state.profile.id
                  ? state.profile.name
                  : CURATORS.find(c => c.id === list.authorId)?.name}{' '}
                ·{' '}
                {list.authorId === state.profile.id
                  ? 'Milikmu'
                  : 'Kurator demo'}
              </Text>
              <Text style={s.small}>
                {list.visibility === 'private' ? 'Private' : 'Public · demo'}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Empty
          title="Cerita berikutnya bisa darimu"
          body={
            filter === 'Following'
              ? 'Ikuti kurator dari halaman scentlist untuk mengisi bagian ini.'
              : filter === 'Disimpan'
              ? 'Simpan scentlist kurator yang ingin kamu kunjungi lagi.'
              : 'Buat daftar untuk suasana, aktivitas, atau rasa penasaranmu.'
          }
          action="Buat scentlist"
          onAction={() => nav.navigate('EditList')}
        />
      )}
    </Screen>
  );
}
