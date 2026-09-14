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
  const a = fragranceById(owned[0]?.fragranceId || 'light-blue')!;
  const b = fragranceById(
    owned[1]?.fragranceId || (a.id === 'santal-33' ? 'ck-one' : 'santal-33'),
  )!;
  return (
    <Screen>
      <Header
        title="SCENT STUDIO"
        name={state.profile.name}
        onProfile={() => nav.navigate('Profile')}
      />
      <View>
        <Text style={s.label}>YOUR SCENT PLAYGROUND</Text>
        <Text style={s.h1}>Dua wangi.{'\n'}Cerita baru.</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.bottles}>
          <Bottle fragrance={a} size={96} />
          <Icon name="plus" color={colors.gold} />
          <Bottle fragrance={b} size={96} />
        </View>
        <Text style={styles.title}>What if they meet?</Text>
        <Text style={styles.copy}>
          Pilih dua parfum, ubah dominasi, lalu lihat karakter virtualnya.
        </Text>
        <Button
          label="Mulai kombinasi"
          icon="studio"
          variant="secondary"
          onPress={() => enterStudio(nav, state, dispatch)}
        />
      </View>
      {state.studioDraft && (
        <View style={s.card}>
          <Text style={s.label}>DRAFT TERSIMPAN DI PERANGKAT</Text>
          <Text style={s.h3}>
            {state.studioDraft.title || 'Eksperimen yang belum selesai'}
          </Text>
          <Button
            label="Lanjutkan draft"
            icon="edit"
            onPress={() => enterStudio(nav, state, dispatch, { resume: true })}
          />
        </View>
      )}
      <View style={s.card}>
        <Text style={s.h3}>Dari penasaran menjadi koleksi</Text>
        <Text style={s.body}>
          01 · Pilih parfum A dan B{'\n'}02 · Eksplorasi karakter simulasi{'\n'}
          03 · Simpan ke My Shelf → Resep
        </Text>
        <Button
          label={'Lihat resepku · ' + state.recipes.length}
          variant="ghost"
          icon="shelf"
          onPress={() => openShelf(nav, { section: 'recipes' })}
        />
      </View>
      {state.recipes.slice(0, 2).map(recipe => (
        <Pressable
          key={recipe.id}
          accessibilityRole="button"
          accessibilityLabel={'Buka resep ' + recipe.title}
          style={s.card}
          onPress={() => nav.navigate('Recipe', { id: recipe.id })}
        >
          <Text style={s.label}>EKSPERIMEN TERAKHIR · DEMO</Text>
          <Text style={s.h3}>{recipe.title}</Text>
          <Text style={s.small}>Buka, edit, atau remix →</Text>
        </Pressable>
      ))}
      <Text style={s.small}>
        Simulasi demo dari accord contoh. Belum menggunakan model ML dan bukan
        panduan mencampur bahan kimia atau takaran parfum.
      </Text>
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
  title: { fontFamily: 'serif', fontSize: 28, color: colors.ivory },
  copy: { fontSize: 14, lineHeight: 22, color: colors.sage },
});
