import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { openShelf, useAppNavigation } from '../navigation/types';
import { enterStudio } from '../navigation/studioEntry';
import { fragranceById } from '../domain/catalog';
import { Bottle, Button, Header, Icon, Screen } from '../ui/components';
import { colors, s } from '../ui/theme';
export function StudioScreen() {
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const owned = state.shelf.filter(item => item.status === 'have');
  const a = fragranceById(owned[0]?.fragranceId || 'light-blue');
  const b = fragranceById(
    owned[1]?.fragranceId || (a.id === 'santal-33' ? 'ck-one' : 'santal-33'),
  );
  return (
    <Screen>
      <Header
        title="SCENT STUDIO"
        name={state.profile.name}
        onProfile={() => nav.navigate('Home', { screen: 'Profile' })}
      />
      <View>
        <Text style={s.label}>YOUR SCENT PLAYGROUND</Text>
        <Text style={s.h1}>Explore a new combination</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.bottles}>
          <Bottle fragrance={a} size={96} />
          <Icon name="plus" color={colors.gold} />
          <Bottle fragrance={b} size={96} />
        </View>
        <Text style={styles.title}>What if they meet?</Text>
        <Text style={styles.copy}>
          Choose two perfumes and preview how their accords might combine.
        </Text>
        <Button
          label="Start a Combination"
          icon="studio"
          variant="secondary"
          onPress={() => enterStudio(nav, state, dispatch)}
        />
      </View>
      {state.studioDraft && (
        <View style={s.card}>
          <Text style={s.label}>SAVED DRAFT</Text>
          <Text style={s.h3}>
            {state.studioDraft.title || 'Untitled combination'}
          </Text>
          <Button
            label="Resume Draft"
            icon="edit"
            onPress={() =>
              enterStudio(nav, state, dispatch, {
                resume: true,
              })
            }
          />
        </View>
      )}
      <View style={s.card}>
        <Text style={s.h3}>Your recipes</Text>
        <Text style={s.body}>
          Choose two fragrances and save your favorite combinations.
        </Text>
        <Button
          label={'View my recipes · ' + state.recipes.length}
          variant="ghost"
          icon="shelf"
          onPress={() =>
            openShelf(nav, {
              section: 'recipes',
            })
          }
        />
      </View>
      {state.recipes.slice(0, 2).map(recipe => (
        <Pressable
          key={recipe.id}
          accessibilityRole="button"
          accessibilityLabel={'Open recipe ' + recipe.title}
          style={s.card}
          onPress={() =>
            nav.navigate('Recipe', {
              id: recipe.id,
            })
          }
        >
          <Text style={s.label}>RECENT COMBINATION</Text>
          <Text style={s.h3}>{recipe.title}</Text>
          <Text style={s.small}>Open, edit, or remix →</Text>
        </Pressable>
      ))}
      <Text style={s.small}>The preview compares fragrance accords.</Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.green,
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  bottles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    color: colors.ivory,
  },
  copy: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.sage,
  },
});
