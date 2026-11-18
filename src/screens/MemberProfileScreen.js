import React, { useState } from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '../storage/AppProvider';
import { EDITORIAL_LISTS, fragranceById } from '../domain/catalog';
import { useAppNavigation } from '../navigation/types';
import {
  Button,
  Chip,
  Header,
  Icon,
  FragranceRow,
  Screen,
} from '../ui/components';
import { colors, s } from '../ui/theme';
import { ListEntry } from '../ui/ListEntry';

export function MemberProfileScreen({ navigation, route }) {
  const nav = useAppNavigation();
  const { state } = useApp();
  const [tab, setTab] = useState('MyShelf');
  const saved = [...state.lists, ...EDITORIAL_LISTS].filter(
    list =>
      state.savedListIds.includes(list.id) &&
      !state.blocked.includes(list.authorId),
  );
  const favorites = state.favorites.map(fragranceById).filter(Boolean);
  return (
    <Screen contentStyle={{ gap: 14 }}>
      <Header
        title="Profil"
        onBack={route.name === 'Profile' ? navigation.goBack : undefined}
      />
      <LinearGradient
        colors={['#53AC61', '#FFFFFF']}
        style={{ borderRadius: 16, padding: 16, gap: 12 }}
      >
        <View style={s.row}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: '#65A768',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 25 }}>
              {(state.profile.name || 'Essenza').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={s.flex}>
            <Text style={s.h2}>{state.profile.name || 'Essenza'}</Text>
            {!!state.profile.bio && (
              <Text style={s.small}>{state.profile.bio}</Text>
            )}
            <Text style={s.small}>
              {state.lists.length} Koleksi · {state.following.length} Mengikuti
            </Text>
          </View>
        </View>
        <Button
          label="Edit Profil"
          variant="secondary"
          onPress={() => nav.navigate('EditProfile')}
        />
      </LinearGradient>
      <View style={[s.between, { paddingHorizontal: 22 }]}>
        {['MyShelf', 'Saved'].map(label => (
          <Chip
            key={label}
            label={label}
            selected={tab === label}
            onPress={() => setTab(label)}
          />
        ))}
      </View>
      <View style={s.divider} />
      {(tab === 'MyShelf' ? state.lists : saved).map(list => (
        <ListEntry key={list.id} list={list} navigation={nav} />
      ))}
      {tab === 'MyShelf' && !state.lists.length && (
        <Text style={s.small}>Belum ada koleksi.</Text>
      )}
      {tab === 'Saved' &&
        favorites.map(fragrance => (
          <FragranceRow
            key={fragrance.id}
            fragrance={fragrance}
            onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
          />
        ))}
      {tab === 'Saved' && !favorites.length && !saved.length && (
        <Text style={s.small}>Belum ada parfum atau koleksi tersimpan.</Text>
      )}
      <View style={s.between}>
        <Icon name="shelf" color={colors.muted} />
        <Button
          label="Setelan"
          variant="secondary"
          onPress={() => nav.navigate('Settings')}
        />
      </View>
    </Screen>
  );
}
