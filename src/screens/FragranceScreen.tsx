import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParams, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { BottleFormat, ShelfStatus } from '../domain/models';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Header,
  IconButton,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';

export function FragranceScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'Fragrance'>>();
  const nav = useAppNavigation();
  const { state, dispatch } = useApp();
  const fragrance = fragranceById(params.id);
  const item = state.shelf.find(entry => entry.fragranceId === params.id);
  const [status, setStatus] = useState<ShelfStatus>(item?.status || 'want');
  const [format, setFormat] = useState<BottleFormat>(
    item?.format || 'Full bottle',
  );
  const [busy, setBusy] = useState(false);
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
  const save = async () => {
    setBusy(true);
    if (
      await dispatch({
        type: 'shelf',
        item: { fragranceId: fragrance.id, status, format },
      })
    ) {
      Alert.alert(
        'Tersimpan',
        `${fragrance.name} sudah diperbarui di My Shelf.`,
      );
    }
    setBusy(false);
  };
  return (
    <Screen>
      <Header title="THE FRAGRANCE" onBack={() => nav.goBack()} />
      <View
        style={{
          backgroundColor: fragrance.color + '60',
          borderRadius: 24,
          alignItems: 'center',
          paddingVertical: 18,
        }}
      >
        <Bottle fragrance={fragrance} size={170} />
        <Text style={[s.small, { marginBottom: 7 }]}>Ilustrasi produk</Text>
      </View>
      <View style={s.between}>
        <View style={s.flex}>
          <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
          <Text style={[s.h1, { marginTop: 7 }]}>{fragrance.name}</Text>
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
      <View style={s.wrap}>
        {fragrance.accords.map(accord => (
          <Chip label={accord} key={accord} />
        ))}
      </View>
      <Text style={s.body}>{fragrance.description}</Text>
      <View style={s.card}>
        <Text style={s.h3}>
          {item ? 'Kelola koleksi' : 'Simpan ke My Shelf'}
        </Text>
        <View style={s.wrap}>
          {(
            [
              { id: 'have', label: 'Have' },
              { id: 'want', label: 'Want' },
              { id: 'had', label: 'Had' },
            ] as const
          ).map(option => (
            <Chip
              key={option.id}
              label={option.label}
              selected={status === option.id}
              onPress={() => setStatus(option.id)}
            />
          ))}
        </View>
        <Text style={s.label}>FORMAT</Text>
        <View style={s.wrap}>
          {(['Full bottle', 'Decant', 'Sample'] as BottleFormat[]).map(
            option => (
              <Chip
                key={option}
                label={option}
                selected={format === option}
                onPress={() => setFormat(option)}
              />
            ),
          )}
        </View>
        <Button
          label={item ? 'Simpan perubahan' : 'Simpan ke shelf'}
          onPress={save}
          loading={busy}
        />
        {item && (
          <Button
            label="Hapus dari shelf"
            variant="danger"
            onPress={() =>
              Alert.alert(
                'Hapus dari shelf?',
                `Catatan pemakaian dan favorit ${fragrance.name} tetap tersimpan.`,
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
      </View>
      <Button
        label="Catat pemakaian"
        icon="drop"
        variant="secondary"
        onPress={() => nav.navigate('Wear', { fragranceId: fragrance.id })}
      />
      <Text style={s.small}>
        Data katalog contoh. Profil aroma tidak menjamin pengalaman atau
        ketahanan yang sama pada setiap pemakai.
      </Text>
    </Screen>
  );
}
