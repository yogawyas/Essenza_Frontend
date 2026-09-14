import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParams, openShelf, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Header,
  IconButton,
  Screen,
} from '../ui/components';
import { SHELF_LABELS, ShelfEditor } from '../ui/ShelfEditor';
import { s } from '../ui/theme';

export function FragranceScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'Fragrance'>>();
  const nav = useAppNavigation();
  const { state, dispatch } = useApp();
  const fragrance = fragranceById(params.id);
  const item = state.shelf.find(entry => entry.fragranceId === params.id);
  const [editing, setEditing] = useState(false);
  if (!fragrance) {
    return (
      <Screen>
        <Header title="PARFUM" onBack={() => nav.goBack()} />
        <Empty
          title="Parfum tidak tersedia"
          body="Kembali untuk memilih parfum lain."
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title="THE FRAGRANCE" onBack={() => nav.goBack()} />
      <View style={s.between}>
        <View style={s.flex}>
          <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
          <Text style={s.h1}>{fragrance.name}</Text>
          <Text style={s.small}>{fragrance.concentration}</Text>
        </View>
        <IconButton
          name="heart"
          label="Ubah favorit"
          active={state.favorites.includes(fragrance.id)}
          onPress={() => {
            dispatch({ type: 'favorite', fragranceId: fragrance.id });
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: fragrance.color + '60',
          borderRadius: 24,
          alignItems: 'center',
          padding: 12,
        }}
      >
        <Bottle fragrance={fragrance} size={125} />
        <Text style={s.small}>Ilustrasi produk · katalog demo</Text>
      </View>
      <Button
        label={item ? 'Kelola koleksi' : 'Tambah ke My Shelf'}
        icon={item ? 'check' : 'plus'}
        onPress={() => setEditing(true)}
      />
      {item && (
        <View style={s.card}>
          <Text style={s.label}>
            MY SHELF · {SHELF_LABELS[item.status].toUpperCase()}
          </Text>
          <Text style={s.body}>{item.format} · Tersimpan di perangkatmu.</Text>
          <Button
            label="Lihat My Shelf"
            variant="secondary"
            icon="shelf"
            onPress={() =>
              openShelf(nav, {
                section: 'perfumes',
                status: item.status,
                highlightId: fragrance.id,
              })
            }
          />
        </View>
      )}
      <View style={s.wrap}>
        {fragrance.accords.map(accord => (
          <Chip label={accord} key={accord} />
        ))}
      </View>
      <Text style={s.body}>{fragrance.description}</Text>
      <Button
        label="Catat pemakaian"
        icon="drop"
        variant="secondary"
        onPress={() => nav.navigate('Wear', { fragranceId: fragrance.id })}
      />
      {item && (
        <Button
          label="Hapus dari shelf"
          variant="danger"
          onPress={() =>
            Alert.alert(
              'Hapus dari shelf?',
              'Catatan pemakaian dan favorit tetap tersimpan.',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  style: 'destructive',
                  onPress: () => {
                    dispatch({
                      type: 'removeShelf',
                      fragranceId: fragrance.id,
                    });
                  },
                },
              ],
            )
          }
        />
      )}
      <Text style={s.small}>
        Metadata contoh. Profil aroma tidak menjamin pengalaman atau ketahanan
        yang sama pada setiap pemakai.
      </Text>
      {editing && (
        <ShelfEditor
          fragrance={fragrance}
          item={item}
          onClose={() => setEditing(false)}
          onView={status => {
            setEditing(false);
            openShelf(nav, {
              section: 'perfumes',
              status,
              highlightId: fragrance.id,
            });
          }}
        />
      )}
    </Screen>
  );
}
