import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { fragranceById } from '../domain/catalog';
import { OCCASION_LABELS } from '../domain/models';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { AddToCollection } from '../ui/AddToCollection';
import { Bottle, Button, Empty } from '../ui/components';
import { DesignAction, DesignScreen, PageHeader } from '../ui/design';
import { FragranceNotes } from '../ui/FragranceNotes';
import { Feedback } from '../ui/Feedback';
import { FragranceTags } from '../ui/FragranceTags';
import { colors, s } from '../ui/theme';

export function PerfumeScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const [adding, setAdding] = useState(false);
  const fragrance = fragranceById(params?.id);
  const saved = fragrance && state.favorites.includes(fragrance.id);
  const added = state.lists.some(list =>
    list.items.some(item => item.fragranceId === fragrance?.id),
  );
  return (
    <DesignScreen
      paper
      header={<PageHeader title="Perfume" onBack={nav.goBack} />}
    >
      {fragrance ? (
        <>
          <LinearGradient
            colors={['#515151', colors.white]}
            style={styles.hero}
          >
            <View style={styles.photo}>
              <Bottle fragrance={fragrance} size={210} />
            </View>
          </LinearGradient>
          <View style={s.between}>
            <View style={s.flex}>
              <Text style={styles.brand}>{fragrance.brand}</Text>
              <Text style={s.h1}>{fragrance.name}</Text>
              {fragrance.concentration ? (
                <Text style={s.small}>{fragrance.concentration}</Text>
              ) : null}
            </View>
            <DesignAction
              name={saved ? 'bookmarkFill' : 'bookmark'}
              label={saved ? 'Unsave perfume' : 'Save perfume'}
              onPress={() =>
                dispatch({ type: 'favorite', fragranceId: fragrance.id })
              }
            />
          </View>
          {fragrance.description ? (
            <Text style={s.body}>{fragrance.description}</Text>
          ) : null}
          <FragranceTags accords={fragrance.accords} />
          <Button
            label={added ? 'Already Added to MyShelf' : 'Add to MyShelf'}
            icon={added ? 'check' : 'plus'}
            onPress={() => setAdding(true)}
          />
          <FragranceNotes notes={fragrance.notes} />
          {fragrance.occasions.length ? (
            <View>
              <Text style={s.h2}>When to Wear</Text>
              <Text style={s.body}>
                {fragrance.occasions
                  .map(item => OCCASION_LABELS[item])
                  .join(' · ')}
              </Text>
            </View>
          ) : null}
          <Button
            label="Log wear"
            icon="drop"
            variant="secondary"
            onPress={() => nav.navigate('Wear', { fragranceId: fragrance.id })}
          />
          <Button
            label="See in Journal"
            variant="secondary"
            onPress={() => nav.navigate('JournalDetail', { id: fragrance.id })}
          />
          <Feedback kind="perfume" target={fragrance.id} />
          {adding ? (
            <AddToCollection
              fragrance={fragrance}
              onClose={() => setAdding(false)}
              onCreate={() => {
                setAdding(false);
                nav.navigate('EditList', { fragranceId: fragrance.id });
              }}
            />
          ) : null}
        </>
      ) : (
        <Empty
          title="Fragrance unavailable"
          body="Go back to choose another fragrance."
        />
      )}
    </DesignScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 6,
  },
  photo: {
    padding: 14,
    minHeight: 315,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 8,
    elevation: 3,
  },
  brand: { fontSize: 18, color: colors.muted },
});
