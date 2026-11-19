import React, { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useApp } from '../storage/AppProvider';
import { useAppNavigation } from '../navigation/types';
import { fragranceById } from '../domain/catalog';
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
const sections = [
  {
    id: 'perfumes',
    label: 'Perfume',
  },
  {
    id: 'lists',
    label: 'Scentlists',
  },
  {
    id: 'recipes',
    label: 'Recipe',
  },
  {
    id: 'journal',
    label: 'Journal',
  },
];
export function ShelfScreen() {
  const { state } = useApp();
  const nav = useAppNavigation();
  const { params } = useRoute();
  const [section, setSection] = useState('perfumes');
  const [status, setStatus] = useState('have');
  const [highlight, setHighlight] = useState();
  const scroll = useRef(null);
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
        scroll.current?.scrollTo({
          y: 0,
          animated: false,
        });
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
      ? state.favorites.map(id => ({
          fragranceId: id,
          format: 'Favorite',
        }))
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
        onProfile={() => nav.navigate('Home', { screen: 'Profile' })}
      />
      <View>
        <Text style={s.h1}>Your fragrance library</Text>
        <Text style={s.body}>
          {state.shelf.length} perfumes · {state.lists.length} scentlists ·{' '}
          {state.recipes.length} recipe
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
            {['have', 'want', 'had', 'favorites'].map(value => (
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
            label="Add Perfume"
            icon="plus"
            onPress={() =>
              nav.navigate('Home', {
                screen: 'Discover',
                params: {
                  screen: 'DiscoverHome',
                  pop: true,
                },
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
                        style={[
                          s.label,
                          {
                            paddingTop: 12,
                          },
                        ]}
                        accessibilityLiveRegion="polite"
                      >
                        SAVED HERE · {SHELF_LABELS[status].toUpperCase()}
                      </Text>
                    )}
                    <FragranceRow
                      fragrance={fragrance}
                      subtitle={item.format}
                      onPress={() =>
                        nav.navigate('Fragrance', {
                          id: fragrance.id,
                        })
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
                  ? 'Your collection is empty'
                  : 'Nothing in ' + SHELF_LABELS[status]
              }
              body={
                status === 'have'
                  ? 'Add a perfume to see suggestions on Home.'
                  : 'Choose this category from a perfume journal.'
              }
            />
          )}
          {!!state.shelf.filter(item => item.status === 'have').length && (
            <Button
              label="Choose a Fragrance on Home"
              variant="secondary"
              icon="today"
              onPress={() =>
                nav.navigate('Home', {
                  screen: 'Today',
                  params: {
                    screen: 'TodayHome',
                    pop: true,
                  },
                })
              }
            />
          )}
        </>
      )}
      {section === 'lists' && (
        <>
          <Text style={s.body}>Your collections and saved inspiration.</Text>
          <Button
            label="Create Scentlist"
            icon="plus"
            onPress={() => nav.navigate('EditList')}
          />
          <Button
            label={'Saved Scentlists · ' + state.savedListIds.length}
            variant="secondary"
            onPress={() =>
              nav.navigate('Scentlists', {
                filter: 'Saved',
              })
            }
          />
          {state.lists.length ? (
            state.lists.map(list => (
              <Pressable
                key={list.id}
                accessibilityRole="button"
                accessibilityLabel={'Open scentlist ' + list.title}
                onPress={() =>
                  nav.navigate('List', {
                    id: list.id,
                  })
                }
              >
                <ListCover list={list} />
              </Pressable>
            ))
          ) : (
            <Empty
              title="Create your first scentlist"
              body="Group fragrances for your favorite occasions."
            />
          )}
        </>
      )}
      {section === 'recipes' && (
        <>
          <Text style={s.body}>
            Saved layering combinations from Scent Studio.
          </Text>
          <Button
            label="Open Studio"
            icon="studio"
            onPress={() => nav.navigate('Studio')}
          />
          {recipes.length ? (
            recipes.map(recipe => (
              <Pressable
                key={recipe.id}
                accessibilityRole="button"
                accessibilityLabel={'Open recipe ' + recipe.title}
                style={[
                  s.card,
                  highlight === recipe.id && {
                    backgroundColor: colors.sage,
                  },
                ]}
                onPress={() =>
                  nav.navigate('Recipe', {
                    id: recipe.id,
                  })
                }
              >
                {highlight === recipe.id && (
                  <Text style={s.label}>RECIPE SAVED</Text>
                )}
                <View style={s.row}>
                  <Bottle
                    fragrance={fragranceById(recipe.fragranceA)}
                    size={45}
                  />
                  <Bottle
                    fragrance={fragranceById(recipe.fragranceB)}
                    size={45}
                  />
                  <View style={s.flex}>
                    <Text style={s.h3}>{recipe.title}</Text>
                    <Text style={s.small}>
                      {DOMINANCE_LABELS[recipe.dominance]}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <Empty
              title="No saved recipes"
              body="Create and save a combination in Studio."
            />
          )}
        </>
      )}
      {section === 'journal' && (
        <>
          <Text style={s.h2}>Wear journal</Text>
          <Text style={s.body}>{state.logs.length} private wear entries.</Text>
          <Button
            label="Open Journal"
            icon="drop"
            onPress={() => nav.navigate('Journal')}
          />
          {state.logs.slice(0, 3).map(log => (
            <FragranceRow
              key={log.id}
              fragrance={fragranceById(log.fragranceId)}
              subtitle={
                new Date(log.wornAt).toLocaleDateString('en-GB') +
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
