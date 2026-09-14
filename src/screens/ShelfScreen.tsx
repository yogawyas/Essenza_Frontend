import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { useApp } from '../storage/AppProvider';
import {
  RootParams,
  ShelfSection,
  useAppNavigation,
} from '../navigation/types';
import { fragranceById } from '../domain/catalog';
import { ShelfStatus } from '../domain/models';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  FragranceRow,
  Header,
  ListCover,
  Screen,
} from '../ui/components';
import { SHELF_LABELS } from '../ui/ShelfEditor';
import { DOMINANCE_LABELS } from '../domain/studio';
import { colors, s } from '../ui/theme';

const sections: { id: ShelfSection; label: string }[] = [
  { id: 'perfumes', label: 'Parfum' },
  { id: 'lists', label: 'Scentlists' },
  { id: 'recipes', label: 'Resep' },
  { id: 'journal', label: 'Journal' },
];
export function ShelfScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const { params } = useRoute<RouteProp<RootParams, 'ShelfHome'>>();
  const [section, setSection] = useState<ShelfSection>('perfumes');
  const [status, setStatus] = useState<ShelfStatus | 'favorites'>('have');
  const [highlight, setHighlight] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  useFocusEffect(
    useCallback(() => {
      if (
        params?.section ||
        params?.status ||
        params?.highlightId ||
        params?.requestId
      ) {
        if (params.section) {
          setSection(params.section);
        }
        if (params.status) {
          setStatus(params.status);
        }
        setHighlight(params.highlightId);
        scroll.current?.scrollTo({ y: 0, animated: false });
        nav.setParams({
          section: undefined,
          status: undefined,
          highlightId: undefined,
          requestId: undefined,
        });
      }
    }, [params, nav]),
  );
  const items = (
    status === 'favorites'
      ? state.favorites.map(id => ({ fragranceId: id, format: 'Favorit' }))
      : state.shelf.filter(item => item.status === status)
  )
    .slice()
    .sort(
      (a, b) =>
        Number(b.fragranceId === highlight) -
        Number(a.fragranceId === highlight),
    );
  const recipes = state.recipes
    .slice()
    .sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight));
  return (
    <Screen scrollRef={scroll}>
      <Header
        title="MY SHELF"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View>
        <Text style={s.h1}>Semua wangimu,{'\n'}di satu tempat.</Text>
        <Text style={s.body}>
          {state.shelf.length} parfum · {state.lists.length} scentlists ·{' '}
          {state.recipes.length} resep
        </Text>
      </View>
      <View style={s.row}>
        {sections.map(item => (
          <Chip
            compact
            key={item.id}
            label={item.label}
            selected={section === item.id}
            onPress={() => {
              setSection(item.id);
              setHighlight(undefined);
            }}
          />
        ))}
      </View>
      {section === 'perfumes' && (
        <>
          <View style={s.row}>
            {(['have', 'want', 'had', 'favorites'] as const).map(value => (
              <Chip
                compact
                key={value}
                label={SHELF_LABELS[value]}
                selected={status === value}
                onPress={() => {
                  setStatus(value);
                  setHighlight(undefined);
                }}
              />
            ))}
          </View>
          <Button
            label="Tambah parfum"
            icon="plus"
            onPress={() =>
              nav.navigate('Home', {
                screen: 'Discover',
                params: { screen: 'DiscoverHome', pop: true },
              })
            }
          />
          {items.length ? (
            items.map(item => {
              const fragrance = fragranceById(item.fragranceId);
              return (
                fragrance && (
                  <View
                    key={fragrance.id}
                    style={
                      highlight === fragrance.id
                        ? {
                            backgroundColor: colors.sage,
                            borderRadius: 16,
                            paddingHorizontal: 10,
                          }
                        : undefined
                    }
                  >
                    {highlight === fragrance.id && (
                      <Text
                        style={[s.label, { paddingTop: 12 }]}
                        accessibilityLiveRegion="polite"
                      >
                        TERSIMPAN DI SINI · {SHELF_LABELS[status].toUpperCase()}
                      </Text>
                    )}
                    <FragranceRow
                      fragrance={fragrance}
                      subtitle={item.format}
                      onPress={() =>
                        nav.navigate('Fragrance', { id: fragrance.id })
                      }
                    />
                  </View>
                )
              );
            })
          ) : (
            <Empty
              title={
                status === 'have'
                  ? 'Mulai dari yang kamu punya'
                  : 'Belum ada di ' + SHELF_LABELS[status]
              }
              body={
                status === 'have'
                  ? 'Tambahkan satu parfum agar Today bisa membantu memilih wangi harianmu.'
                  : 'Pilih kategori ini saat menyimpan parfum dari Discover.'
              }
            />
          )}
          {!!state.shelf.filter(item => item.status === 'have').length && (
            <Button
              label="Pilih wangi di Today"
              variant="secondary"
              icon="today"
              onPress={() =>
                nav.navigate('Home', {
                  screen: 'Today',
                  params: { screen: 'TodayHome', pop: true },
                })
              }
            />
          )}
        </>
      )}
      {section === 'lists' && (
        <>
          <Text style={s.body}>
            Daftar milikmu dan inspirasi yang ingin kamu kunjungi lagi.
          </Text>
          <Button
            label="Buat scentlist"
            icon="plus"
            onPress={() => nav.navigate('EditList')}
          />
          <Button
            label={'Scentlists disimpan · ' + state.savedListIds.length}
            variant="secondary"
            onPress={() => nav.navigate('Scentlists', { filter: 'Disimpan' })}
          />
          {state.lists.length ? (
            state.lists.map(list => (
              <Pressable
                key={list.id}
                accessibilityRole="button"
                accessibilityLabel={'Buka scentlist ' + list.title}
                onPress={() => nav.navigate('List', { id: list.id })}
              >
                <ListCover list={list} />
              </Pressable>
            ))
          ) : (
            <Empty
              title="Susun cerita pertamamu"
              body="Kelompokkan parfum untuk kuliah, liburan, atau suasana favorit."
            />
          )}
        </>
      )}
      {section === 'recipes' && (
        <>
          <Text style={s.body}>
            Eksperimen pribadi dari Scent Studio. Semua hasil masih simulasi
            demo.
          </Text>
          <Button
            label="Buka Studio"
            icon="studio"
            onPress={() => nav.navigate('Home', { screen: 'Studio' })}
          />
          {recipes.length ? (
            recipes.map(recipe => (
              <Pressable
                key={recipe.id}
                accessibilityRole="button"
                accessibilityLabel={'Buka resep ' + recipe.title}
                style={[
                  s.card,
                  highlight === recipe.id && { backgroundColor: colors.sage },
                ]}
                onPress={() => nav.navigate('Recipe', { id: recipe.id })}
              >
                {highlight === recipe.id && (
                  <Text style={s.label}>RESEP TERSIMPAN</Text>
                )}
                <View style={s.row}>
                  <Bottle
                    fragrance={fragranceById(recipe.fragranceA)!}
                    size={45}
                  />
                  <Bottle
                    fragrance={fragranceById(recipe.fragranceB)!}
                    size={45}
                  />
                  <View style={s.flex}>
                    <Text style={s.h3}>{recipe.title}</Text>
                    <Text style={s.small}>
                      {DOMINANCE_LABELS[recipe.dominance]} · Demo
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <Empty
              title="Dua wangi, satu rasa penasaran"
              body="Buat kombinasi di Studio, lalu simpan hasilnya di sini."
            />
          )}
        </>
      )}
      {section === 'journal' && (
        <>
          <Text style={s.h2}>Small moments,{'\n'}beautiful memories.</Text>
          <Text style={s.body}>
            {state.logs.length} catatan pemakaian pribadi. Catatan tidak
            dibagikan ke internet.
          </Text>
          <Button
            label="Buka journal"
            icon="drop"
            onPress={() => nav.navigate('Journal')}
          />
          {state.logs.slice(0, 3).map(log => (
            <FragranceRow
              key={log.id}
              fragrance={fragranceById(log.fragranceId)!}
              subtitle={
                new Date(log.wornAt).toLocaleDateString('id-ID') +
                ' · ' +
                log.occasion
              }
              onPress={() =>
                nav.navigate('Wear', {
                  fragranceId: log.fragranceId,
                  logId: log.id,
                })
              }
            />
          ))}
        </>
      )}
    </Screen>
  );
}
