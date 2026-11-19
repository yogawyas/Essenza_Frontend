import React, { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '../navigation/types';
import { useApp } from '../storage/AppProvider';
import { fragranceById } from '../domain/catalog';
import { localDay, makeId, OCCASIONS, OCCASION_LABELS } from '../domain/models';
import {
  Bottle,
  Button,
  Chip,
  Empty,
  Field,
  Header,
  Screen,
} from '../ui/components';
import { s } from '../ui/theme';
export function WearScreen() {
  const { params } = useRoute();
  const { state, dispatch } = useApp();
  const nav = useAppNavigation();
  const original = state.logs.find(log => log.id === params.logId);
  const fragrance = fragranceById(params.fragranceId);
  const [id] = useState(original?.id || makeId('wear'));
  const [note, setNote] = useState(original?.note || '');
  const [occasion, setOccasion] = useState(
    original?.occasion || params.occasion || 'Kuliah',
  );
  const [date, setDate] = useState(localDay(original?.wornAt || new Date()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(!params.quick || !!original);
  const locked = useRef(false);
  if (!fragrance) {
    return (
      <Screen>
        <Empty
          title="Fragrance unavailable"
          body="Go back and pick another fragrance."
        />
      </Screen>
    );
  }
  const save = async () => {
    if (locked.current) {
      return;
    }
    const now = new Date();
    const selectedDate = params.quick && !expanded ? localDay(now) : date;
    const parsed = new Date(`${selectedDate}T12:00:00`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
      !Number.isFinite(parsed.getTime()) ||
      localDay(parsed) !== selectedDate ||
      selectedDate > localDay(now)
    ) {
      setError('Enter a valid date (YYYY-MM-DD) no later than today.');
      return;
    }
    const wornAt =
      original && localDay(original.wornAt) === selectedDate
        ? original.wornAt
        : selectedDate === localDay(now)
        ? now.toISOString()
        : parsed.toISOString();
    setError('');
    locked.current = true;
    setBusy(true);
    if (
      await dispatch({
        type: 'wear',
        log: {
          id,
          fragranceId: fragrance.id,
          wornAt,
          occasion,
          note,
        },
      })
    ) {
      nav.goBack();
    }
    setBusy(false);
    locked.current = false;
  };
  return (
    <Screen>
      <Header title="NOW WEARING" onBack={() => nav.goBack()} />
      <View
        style={{
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Bottle fragrance={fragrance} size={expanded ? 95 : 65} />
        <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
        <Text style={s.h2}>{fragrance.name}</Text>
      </View>
      <Text style={s.body}>
        Record the occasion and any notes you want to keep.
      </Text>
      {!expanded && (
        <Text style={s.h3}>Today · {OCCASION_LABELS[occasion]}</Text>
      )}
      {expanded && (
        <Field
          label="Wear Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      )}
      <Text style={s.label}>OCCASION</Text>
      <View style={s.wrap}>
        {OCCASIONS.map(item => (
          <Chip
            label={OCCASION_LABELS[item]}
            key={item}
            selected={occasion === item}
            onPress={() => setOccasion(item)}
          />
        ))}
      </View>
      {expanded && (
        <Field
          label="Notes (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What did you notice about this fragrance?"
          multiline
          maxLength={280}
        />
      )}
      {!expanded && (
        <Button
          label="Add Notes or Change Date"
          variant="ghost"
          onPress={() => setExpanded(true)}
        />
      )}
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        label={
          original
            ? 'Save Changes'
            : params.quick && !expanded
            ? 'Confirm Wear Today'
            : 'Save Wear'
        }
        icon="check"
        loading={busy}
        onPress={save}
      />
      {original && (
        <Button
          label="Delete Entry"
          variant="danger"
          onPress={() =>
            Alert.alert(
              'Delete this entry?',
              'This entry will be removed from your history and statistics.',
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
                        type: 'deleteWear',
                        id: original.id,
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
      )}
    </Screen>
  );
}
