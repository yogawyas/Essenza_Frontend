import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { useRoute } from '@react-navigation/native';
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
  const { params } = useRoute();
  const [filter, setFilter] = useState(params?.filter || 'Explore');
  useEffect(() => {
    if (params?.filter) {
      setFilter(params.filter);
      nav.setParams({
        filter: undefined,
      });
    }
  }, [params?.filter, nav]);
  const lists = visibleLists(state).filter(list =>
    filter === 'Mine'
      ? list.authorId === state.profile.id
      : filter === 'Saved'
      ? state.savedListIds.includes(list.id)
      : filter === 'Following'
      ? state.following.includes(list.authorId)
      : list.visibility === 'public',
  );
  return (
    <Screen>
      <Header
        title="SCENTLISTS"
        onBack={() => nav.goBack()}
        name={state.profile.name}
        onProfile={() => nav.navigate('Home', { screen: 'Profile' })}
      />
      <View
        style={{
          gap: 9,
        }}
      >
        <Text style={s.h1}>A playlist.{'\n'}For your senses.</Text>
        <Text style={s.body}>
          Browse scentlists and find inspiration from creators.
        </Text>
      </View>
      <Button
        label="Create Scentlist"
        icon="plus"
        onPress={() => nav.navigate('EditList')}
      />
      <View style={s.wrap}>
        {['Explore', 'Mine', 'Saved', 'Following'].map(item => (
          <Chip
            key={item}
            label={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      <Text style={s.small}></Text>
      {lists.length ? (
        lists.map(list => (
          <View
            key={list.id}
            style={{
              gap: 10,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open scentlist ${list.title}`}
              onPress={() =>
                nav.navigate('List', {
                  id: list.id,
                })
              }
            >
              <ListCover list={list} />
            </Pressable>
            <View style={s.between}>
              <Text style={s.small}>
                By{' '}
                {list.authorId === state.profile.id
                  ? state.profile.name
                  : CURATORS.find(c => c.id === list.authorId)?.name}{' '}
                · {list.authorId === state.profile.id ? 'Yours' : 'Creator'}
              </Text>
              <Text style={s.small}>
                {list.visibility === 'private' ? 'Private' : 'Public'}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Empty
          title="No scentlists here"
          body={
            filter === 'Following'
              ? 'Follow creators from their profiles to see their scentlists.'
              : filter === 'Saved'
              ? 'Your saved scentlists will appear here.'
              : 'Create a scentlist to organize your perfumes.'
          }
          action="Create Scentlist"
          onAction={() => nav.navigate('EditList')}
        />
      )}
    </Screen>
  );
}
