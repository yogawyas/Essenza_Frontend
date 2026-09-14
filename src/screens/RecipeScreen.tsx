import React from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootParams, useAppNavigation } from '../navigation/types';
import { enterStudio } from '../navigation/studioEntry';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { DOMINANCE_LABELS, simulate } from '../domain/studio';
import { Button, Empty, FragranceRow, Header, Screen } from '../ui/components';
import { StudioProfile } from '../ui/StudioProfile';
import { s } from '../ui/theme';

export function RecipeScreen() {
  const { params } = useRoute<RouteProp<RootParams, 'Recipe'>>();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const recipe = state.recipes.find(item => item.id === params.id);
  if (!recipe) {
    return (
      <Screen>
        <Header title="RESEP" onBack={() => nav.goBack()} />
        <Empty
          title="Resep tidak tersedia"
          body="Resep mungkin sudah dihapus. Koleksi parfummu tetap tersimpan."
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title="YOUR SCENT RECIPE" onBack={() => nav.goBack()} />
      <Text style={s.h1}>{recipe.title}</Text>
      <Text style={s.small}>
        Pribadi · {DOMINANCE_LABELS[recipe.dominance]} · {recipe.engineVersion}
      </Text>
      <StudioProfile prediction={simulate(recipe)} />
      <View>
        {[recipe.fragranceA, recipe.fragranceB].map((id, index) => (
          <FragranceRow
            key={id}
            fragrance={fragranceById(id)!}
            subtitle={'Parfum ' + (index ? 'B' : 'A')}
            onPress={() => nav.navigate('Fragrance', { id })}
          />
        ))}
      </View>
      <Text style={s.body}>
        {recipe.note ||
          'Belum ada catatan. Edit resep untuk menambahkan cerita atau pengalamanmu.'}
      </Text>
      <Button
        label="Edit resep"
        icon="edit"
        onPress={() =>
          enterStudio(nav, state, dispatch, { recipeId: recipe.id })
        }
      />
      <Button
        label="Remix sebagai resep baru"
        icon="studio"
        variant="secondary"
        onPress={() =>
          enterStudio(nav, state, dispatch, { remixId: recipe.id })
        }
      />
      <Button
        label="Hapus resep"
        variant="danger"
        onPress={() =>
          Alert.alert(
            'Hapus resep?',
            'Hanya resep ini yang dihapus. Parfum dan journal tetap tersimpan.',
            [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Hapus',
                style: 'destructive',
                onPress: async () => {
                  if (await dispatch({ type: 'deleteRecipe', id: recipe.id })) {
                    nav.goBack();
                  }
                },
              },
            ],
          )
        }
      />
    </Screen>
  );
}
