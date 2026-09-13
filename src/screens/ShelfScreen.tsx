import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { fragranceById } from '../domain/catalog';
import { ShelfStatus } from '../domain/models';
import {
  Button,
  Chip,
  Empty,
  FragranceRow,
  Header,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';

export function ShelfScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const [status, setStatus] = useState<ShelfStatus | 'favorites'>('have');
  const items =
    status === 'favorites'
      ? state.favorites.map(id => ({ fragranceId: id, format: 'Favorit' }))
      : state.shelf.filter(item => item.status === status);
  return (
    <Screen>
      <Header
        title="MY SHELF"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View style={{ gap: 9 }}>
        <Text style={s.h1}>Your little{'\n'}fragrance world.</Text>
        <Text style={s.body}>
          Koleksi, keinginan, dan cerita yang menyertainya.
        </Text>
      </View>
      <View style={s.wrap}>
        {(
          [
            { id: 'have', label: 'Have' },
            { id: 'want', label: 'Want' },
            { id: 'had', label: 'Had' },
            { id: 'favorites', label: 'Favorit' },
          ] as const
        ).map(item => (
          <Chip
            key={item.id}
            label={item.label}
            selected={status === item.id}
            onPress={() => setStatus(item.id)}
          />
        ))}
      </View>
      <Button
        label="Tambah parfum"
        icon="plus"
        onPress={() => nav.navigate('Home', { screen: 'Discover' })}
      />
      <View>
        {items.length ? (
          items.map(item => {
            const fragrance = fragranceById(item.fragranceId);
            return fragrance ? (
              <FragranceRow
                key={fragrance.id}
                fragrance={fragrance}
                subtitle={item.format}
                onPress={() => nav.navigate('Fragrance', { id: fragrance.id })}
              />
            ) : null;
          })
        ) : (
          <Empty
            title="Ada ruang untuk cerita baru"
            body={
              status === 'have'
                ? 'Tambahkan parfum, decant, atau sample yang sudah kamu punya.'
                : 'Simpan parfum dari halaman detail untuk mengisi bagian ini.'
            }
          />
        )}
      </View>
      <View style={s.card}>
        <Text style={s.label}>SCENT JOURNAL</Text>
        <Text style={s.h2}>Small moments,{'\n'}beautiful memories.</Text>
        <Text style={s.body}>
          {state.logs.length} catatan pemakaian pribadi tersimpan.
        </Text>
        <Button
          label="Buka journal"
          icon="arrow"
          variant="secondary"
          onPress={() => nav.navigate('Journal')}
        />
      </View>
    </Screen>
  );
}
