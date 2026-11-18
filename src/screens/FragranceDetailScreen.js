import React, { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { openShelf, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { bottlePhotoCredits } from '../domain/fragranceMedia';
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
import { colors, s } from '../ui/theme';
import { FragranceNotes } from '../ui/FragranceNotes';
import LinearGradient from 'react-native-linear-gradient';

export function FragranceDetailScreen() {
  const { params } = useRoute();
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
  const photoCredit = bottlePhotoCredits?.[fragrance.id];
  return (
    <Screen
      style={{ backgroundColor: colors.white }}
      contentStyle={{ gap: 13 }}
    >
      <Header title="Parfum" onBack={() => nav.goBack()} />
      <LinearGradient
        colors={[fragrance.color, colors.white]}
        style={{
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
        }}
      >
        <Bottle fragrance={fragrance} size={192} />
      </LinearGradient>
      {photoCredit && (
        <Text
          accessibilityRole="link"
          style={s.small}
          onPress={() => Linking.openURL(photoCredit.source).catch(() => {})}
        >
          Foto: {photoCredit.author} · CC BY-SA 2.0
        </Text>
      )}
      <View style={s.between}>
        <View style={s.flex}>
          <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
          <Text style={s.h1}>{fragrance.name}</Text>
          <Text style={s.small}>{fragrance.concentration}</Text>
        </View>
        <IconButton
          name="bookmark"
          label="Simpan parfum"
          active={state.favorites.includes(fragrance.id)}
          onPress={() => {
            dispatch({ type: 'favorite', fragranceId: fragrance.id });
          }}
        />
      </View>
      <Button
        label={item ? 'Sudah ditambah ke MyShelf' : '+ Tambah ke MyShelf'}
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
            label="Lihat MyShelf"
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
      <FragranceNotes key={fragrance.id} fragrance={fragrance} />
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
