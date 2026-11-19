import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { usePreventRemove, useRoute } from '@react-navigation/native';
import { shelfDestination, useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { CATALOG, fragranceById } from '../domain/catalog';
import { makeId } from '../domain/models';
import {
  DOMINANCE_LABELS,
  ENGINE_VERSION,
  mockPredictor,
} from '../domain/studio';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Field,
  Header,
  Icon,
  Screen,
} from '../ui/components';
import { Sheet } from '../ui/Sheet';
import { StudioProfile } from '../ui/StudioProfile';
import { s } from '../ui/theme';
export function StudioEditorScreen() {
  const { params } = useRoute();
  const nav = useAppNavigation();
  const { state, dispatch } = useApp();
  const original = state.recipes.find(
    recipe => recipe.id === (params?.recipeId || params?.remixId),
  );
  const [initial] = useState(() =>
    params?.resume && state.studioDraft
      ? state.studioDraft
      : {
          id: makeId('draft'),
          recipeId: params?.recipeId,
          fragranceA: original?.fragranceA || null,
          fragranceB: original?.fragranceB || null,
          dominance: original?.dominance || 'balanced',
          title: original
            ? (params?.remixId
                ? 'Remix · ' + original.title
                : original.title
              ).slice(0, 60)
            : '',
          note: original?.note || '',
        },
  );
  const [draft, setDraft] = useState(initial);
  const [recipeId] = useState(initial.recipeId || makeId('recipe'));
  const [prediction, setPrediction] = useState(null);
  const [picker, setPicker] = useState(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const pendingExit = useRef(() => nav.goBack());
  const locked = useRef(false);
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  const saveDraft = async (exit = () => nav.goBack()) => {
    if (locked.current) {
      return;
    }
    locked.current = true;
    setBusy(true);
    if (
      await dispatch({
        type: 'studioDraft',
        draft,
      })
    ) {
      pendingExit.current = exit;
      setLeaving(true);
    }
    locked.current = false;
    setBusy(false);
  };
  usePreventRemove((dirty || busy) && !leaving && !saved, ({ data }) => {
    if (busy) {
      return;
    }
    Alert.alert('Save your combination?', 'Save a draft to continue later.', [
      {
        text: 'Keep Editing',
        style: 'cancel',
      },
      {
        text: 'Discard Changes',
        style: 'destructive',
        onPress: () => {
          pendingExit.current = () => nav.dispatch(data.action);
          setLeaving(true);
        },
      },
      {
        text: 'Save Draft',
        onPress: () => {
          saveDraft(() => nav.dispatch(data.action));
        },
      },
    ]);
  });
  useEffect(() => {
    if (leaving) {
      pendingExit.current();
    }
  }, [leaving]);
  const a = fragranceById(draft.fragranceA || '');
  const b = fragranceById(draft.fragranceB || '');
  const predict = async () => {
    if (!a || !b || locked.current) {
      return;
    }
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await mockPredictor.predict({
        fragranceA: a.id,
        fragranceB: b.id,
        dominance: draft.dominance,
      });
      setPrediction(result);
      if (!draft.title.trim()) {
        setDraft(value => ({
          ...value,
          title: result.profile[0].accord + ' duet',
        }));
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not preview the combination. Try again.',
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  };
  const saveRecipe = async () => {
    if (!a || !b || !prediction || locked.current) {
      return;
    }
    locked.current = true;
    setBusy(true);
    if (
      await dispatch({
        type: 'saveRecipe',
        recipe: {
          id: recipeId,
          title: draft.title,
          note: draft.note,
          fragranceA: a.id,
          fragranceB: b.id,
          dominance: draft.dominance,
          engineVersion: ENGINE_VERSION,
          updatedAt: new Date().toISOString(),
        },
      })
    ) {
      setSaved(true);
    }
    setBusy(false);
    locked.current = false;
  };
  if ((params?.recipeId || params?.remixId) && !original) {
    return (
      <Screen>
        <Header title="STUDIO" onBack={() => nav.goBack()} />
        <Empty
          title="Recipe unavailable"
          body="Back ke My Shelf untuk memilih recipe lain."
        />
      </Screen>
    );
  }
  if (saved) {
    return (
      <Screen>
        <Header title="RECIPE SAVED" onBack={() => nav.goBack()} />
        <Text style={s.h1}>{draft.title}</Text>
        <Text style={s.body} accessibilityLiveRegion="polite">
          Eksperimenmu tersimpan di My Shelf → Recipe. Belum dibagikan ke
          internet.
        </Text>
        {prediction && <StudioProfile prediction={prediction} />}
        <Button
          label="View in MyShelf"
          icon="shelf"
          onPress={() =>
            nav.popTo(
              'Home',
              shelfDestination({
                section: 'recipes',
                highlightId: recipeId,
                requestId: String(Date.now()),
              }),
            )
          }
        />
        <Button label="Back" variant="ghost" onPress={() => nav.goBack()} />
      </Screen>
    );
  }
  const otherId = picker === 'fragranceA' ? draft.fragranceB : draft.fragranceA;
  const options = CATALOG.filter(
    item =>
      item.id !== otherId &&
      (item.name + ' ' + item.brand)
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
    .slice()
    .sort(
      (x, y) =>
        Number(
          state.shelf.some(
            item => item.fragranceId === y.id && item.status === 'have',
          ),
        ) -
        Number(
          state.shelf.some(
            item => item.fragranceId === x.id && item.status === 'have',
          ),
        ),
    );
  return (
    <Screen key={prediction ? 'result' : 'input'}>
      <Header
        title={prediction ? 'LAYERING RESULT' : 'LAYERING STUDIO'}
        onBack={() => (prediction ? setPrediction(null) : nav.goBack())}
      />
      <Text style={s.label}>LAYERING PREVIEW</Text>
      {!prediction ? (
        <>
          <Text style={s.h1}>Choose two fragrances</Text>
          <Text style={s.body}>
            Your collection appears before other catalog fragrances.
          </Text>
          <View
            style={[
              s.row,
              {
                alignItems: 'stretch',
              },
            ]}
          >
            {['fragranceA', 'fragranceB'].map((slot, index) => {
              const fragrance = slot === 'fragranceA' ? a : b;
              return (
                <Pressable
                  key={slot}
                  accessibilityRole="button"
                  accessibilityLabel={
                    'Choose perfume ' + (index === 0 ? 'A' : 'B')
                  }
                  style={[
                    s.card,
                    s.flex,
                    {
                      alignItems: 'center',
                      padding: 12,
                    },
                  ]}
                  onPress={() => {
                    setPicker(slot);
                    setQuery('');
                  }}
                >
                  <Text style={s.label}>PERFUME {index === 0 ? 'A' : 'B'}</Text>
                  {fragrance ? (
                    <Bottle fragrance={fragrance} size={74} />
                  ) : (
                    <View
                      style={{
                        height: 95,
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="plus" size={32} />
                    </View>
                  )}
                  <Text
                    style={[
                      s.h3,
                      {
                        textAlign: 'center',
                        fontSize: 14,
                      },
                    ]}
                  >
                    {fragrance?.name || 'Choose perfume'}
                  </Text>
                  <Text style={s.small}>
                    {fragrance ? 'Change →' : 'Collection / catalog'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={s.label}>DOMINANT CHARACTER</Text>
          <View style={s.wrap}>
            {['a', 'balanced', 'b'].map(value => (
              <Chip
                key={value}
                label={DOMINANCE_LABELS[value]}
                selected={draft.dominance === value}
                onPress={() =>
                  setDraft({
                    ...draft,
                    dominance: value,
                  })
                }
              />
            ))}
          </View>
          <Text style={s.small}>
            Strongce changes how the accords are weighted in the preview.
          </Text>
          {!!error && <Text style={s.error}>{error}</Text>}
          <Button
            label="Preview Combination"
            icon="studio"
            disabled={!a || !b}
            loading={busy}
            onPress={predict}
          />
        </>
      ) : (
        <>
          <Text style={s.h1}>A new character.</Text>
          <Text style={s.body}>
            {a?.name} + {b?.name}
            {'\n'}
            {DOMINANCE_LABELS[draft.dominance]}
          </Text>
          <StudioProfile prediction={prediction} />
          <Text style={s.small}>
            A has {a?.accords.slice(0, 2).join(' & ')}. B membawa{' '}
            {b?.accords.slice(0, 2).join(' & ')}.
          </Text>
          <Button
            label="Edit Combination"
            variant="secondary"
            icon="edit"
            onPress={() => setPrediction(null)}
          />
          <Field
            label="Recipe Name"
            value={draft.title}
            onChangeText={title =>
              setDraft({
                ...draft,
                title,
              })
            }
            maxLength={60}
            placeholder="Citrus after hours"
          />
          <Field
            label="Recipe Notes (optional)"
            value={draft.note}
            onChangeText={note =>
              setDraft({
                ...draft,
                note,
              })
            }
            maxLength={280}
            multiline
            placeholder="Describe the mood or how the combination wears."
          />
          <Button
            label={initial.recipeId ? 'Save Recipe Changes' : 'Save Recipe'}
            disabled={!draft.title.trim()}
            loading={busy}
            onPress={saveRecipe}
          />
        </>
      )}
      <Button
        label="Save Draft and Exit"
        icon="bookmark"
        variant="ghost"
        loading={busy}
        onPress={() => {
          saveDraft();
        }}
      />
      {picker && (
        <Sheet
          title={'Choose perfume ' + (picker === 'fragranceA' ? 'A' : 'B')}
          onClose={() => setPicker(null)}
        >
          <Field
            label="Search Studio Fragrances"
            value={query}
            onChangeText={setQuery}
            placeholder="Name or brand"
          />
          {options.map(item => (
            <Button
              key={item.id}
              label={
                item.name +
                (state.shelf.some(
                  entry =>
                    entry.fragranceId === item.id && entry.status === 'have',
                )
                  ? ' · Punya'
                  : ' · Catalog')
              }
              variant="secondary"
              onPress={() => {
                setDraft({
                  ...draft,
                  [picker]: item.id,
                });
                setPicker(null);
              }}
            />
          ))}
          {!options.length && (
            <Text style={s.body}>
              No results. Try another search and choose two different
              fragrances.
            </Text>
          )}
        </Sheet>
      )}
    </Screen>
  );
}
