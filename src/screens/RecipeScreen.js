import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '../navigation/types';
import { enterStudio } from '../navigation/studioEntry';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { DOMINANCE_LABELS, simulate } from '../domain/studio';
import { Button, Empty, FragranceRow, Header, Screen } from '../ui/components';
import { StudioProfile } from '../ui/StudioProfile';
import { s } from '../ui/theme';
export function RecipeScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const recipe = state.recipes.find(item => item.id === params.id);
  if (!recipe) {
    return (
      <Screen>
        <Header title="RESEP" onBack={() => nav.goBack()} />
        <Empty
          title="Recipe unavailable"
          body="This recipe may have been deleted."
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title="YOUR SCENT RECIPE" onBack={() => nav.goBack()} />
      <Text style={s.h1}>{recipe.title}</Text>
      <Text style={s.small}>
        Private · {DOMINANCE_LABELS[recipe.dominance]} · {recipe.engineVersion}
      </Text>
      <StudioProfile prediction={simulate(recipe)} />
      <View>
        {[recipe.fragranceA, recipe.fragranceB].map((id, index) => (
          <FragranceRow
            key={id}
            fragrance={fragranceById(id)}
            subtitle={'Perfume ' + (index ? 'B' : 'A')}
            onPress={() =>
              nav.navigate('Fragrance', {
                id,
              })
            }
          />
        ))}
      </View>
      <Text style={s.body}>{recipe.note || 'No recipe notes yet.'}</Text>
      <Button
        label="Edit Recipe"
        icon="edit"
        onPress={() =>
          enterStudio(nav, state, dispatch, {
            recipeId: recipe.id,
          })
        }
      />
      <Button
        label="Remix as a New Recipe"
        icon="studio"
        variant="secondary"
        onPress={() =>
          enterStudio(nav, state, dispatch, {
            remixId: recipe.id,
          })
        }
      />
      <Button
        label="Delete recipe"
        variant="danger"
        onPress={() =>
          Alert.alert(
            'Delete recipe?',
            'Hanya recipe ini yang dihapus. Perfume dan journal tetap tersimpan.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  if (
                    await dispatch({
                      type: 'deleteRecipe',
                      id: recipe.id,
                    })
                  ) {
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
