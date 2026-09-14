import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CATALOG } from '../domain/catalog';
import { ACCORDS, Accord } from '../domain/models';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Header,
  Icon,
  IconButton,
  Screen,
} from '../ui/components';
import { colors, s } from '../ui/theme';
import { SHELF_LABELS } from '../ui/ShelfEditor';

export function DiscoverScreen() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [query, setQuery] = useState('');
  const [accord, setAccord] = useState<Accord | null>(null);
  const items = CATALOG.filter(
    item =>
      (!accord || item.accords.includes(accord)) &&
      `${item.name} ${item.brand} ${item.accords.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <Screen>
      <Header
        title="DISCOVER"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View style={{ gap: 8 }}>
        <Text style={s.h1}>Find your next{'\n'}signature.</Text>
        <Text style={s.body}>
          Ikuti rasa penasaranmu. Mulai dari satu aroma.
        </Text>
      </View>
      <Button
        label="Scentlists & inspirasi"
        icon="lists"
        variant="secondary"
        onPress={() => nav.navigate('Scentlists', { filter: 'Explore' })}
      />
      <View style={[s.input, s.row]}>
        <Icon name="search" />
        <TextInput
          style={{ flex: 1, padding: 0, fontSize: 15, color: colors.ink }}
          accessibilityLabel="Cari parfum"
          placeholder="Parfum, brand, atau aroma"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <Chip
          label="Semua"
          selected={!accord}
          onPress={() => setAccord(null)}
        />
        {ACCORDS.map(item => (
          <Chip
            key={item}
            label={item}
            selected={accord === item}
            onPress={() => setAccord(item)}
          />
        ))}
      </ScrollView>
      <View style={s.between}>
        <Text style={s.label}>{items.length} PARFUM UNTUK DIEKSPLORASI</Text>
        <Text style={s.small}>Katalog demo</Text>
      </View>
      {items.length ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 24,
          }}
        >
          {items.map(item => (
            <View key={item.id} style={{ width: '47%', gap: 8 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Detail ${item.name}`}
                onPress={() => nav.navigate('Fragrance', { id: item.id })}
                style={{
                  backgroundColor: item.color + '55',
                  borderRadius: 18,
                  alignItems: 'center',
                  paddingVertical: 15,
                }}
              >
                <Bottle fragrance={item} size={107} />
              </Pressable>
              <View style={s.between}>
                <View style={s.flex}>
                  <Text style={[s.label, { fontSize: 8, letterSpacing: 1 }]}>
                    {item.brand.toUpperCase()}
                  </Text>
                  <Text style={[s.h3, { marginTop: 5 }]}>{item.name}</Text>
                </View>
                <IconButton
                  name="heart"
                  label={`${
                    state.favorites.includes(item.id) ? 'Hapus' : 'Tambah'
                  } favorit ${item.name}`}
                  active={state.favorites.includes(item.id)}
                  onPress={() => {
                    dispatch({ type: 'favorite', fragranceId: item.id });
                  }}
                />
              </View>
              <Text style={s.small}>
                {item.accords.slice(0, 2).join(' · ')} / {item.concentration}
              </Text>
              {state.shelf.some(entry => entry.fragranceId === item.id) && (
                <Text style={s.label}>
                  MY SHELF ·{' '}
                  {SHELF_LABELS[
                    state.shelf.find(entry => entry.fragranceId === item.id)!
                      .status
                  ].toUpperCase()}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Empty
          title="Belum ketemu"
          body="Coba nama lain atau hapus filter aromanya."
          action="Hapus filter"
          onAction={() => {
            setAccord(null);
            setQuery('');
          }}
        />
      )}
      <Text style={s.small}>
        Ilustrasi botol dan metadata adalah data contoh dari purwarupa, belum
        menjadi katalog produk terverifikasi.
      </Text>
    </Screen>
  );
}
