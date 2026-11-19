import React, { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { makeId } from '../domain/models';
import { useApp } from '../storage/AppProvider';
import { Button, Chip, Field } from './components';
import { designStyles } from './design';
import { s } from './theme';

export function Feedback({ kind, target }) {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const isPerfume = kind === 'perfume';
  const entries = state.feedback.filter(
    entry => entry.kind === kind && entry.target === target,
  );
  const save = async () => {
    if (locked.current || !message.trim()) {
      return;
    }
    locked.current = true;
    setBusy(true);
    if (
      await dispatch({
        type: 'feedback',
        entry: { id: makeId('feedback'), kind, target, message, rating },
      })
    ) {
      setMessage('');
      setRating(null);
    }
    setBusy(false);
    locked.current = false;
  };
  return (
    <View style={designStyles.stack}>
      <Text style={s.h2}>
        {isPerfume ? 'Reviews and Comments' : 'Comments'}
      </Text>
      {entries.map(entry => (
        <View key={entry.id} style={s.card}>
          <Text style={s.h3}>
            {state.profile.name}
            {entry.rating ? ' · ' + entry.rating + '/5' : ''}
          </Text>
          <Text style={s.body}>{entry.message}</Text>
          <Button
            variant="ghost"
            label="Delete"
            onPress={() =>
              Alert.alert('Delete this comment?', undefined, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () =>
                    dispatch({ type: 'deleteFeedback', id: entry.id }),
                },
              ])
            }
          />
        </View>
      ))}
      {isPerfume ? (
        <View style={s.wrap}>
          {[1, 2, 3, 4, 5].map(value => (
            <Chip
              compact
              key={value}
              label={String(value) + ' ★'}
              selected={rating === value}
              onPress={() => setRating(rating === value ? null : value)}
            />
          ))}
        </View>
      ) : null}
      <Field
        label={rating ? 'Write a review' : 'Write a comment'}
        value={message}
        onChangeText={setMessage}
        maxLength={280}
        multiline
      />
      <Button
        label={rating ? 'Save Review' : 'Save Comment'}
        variant="secondary"
        disabled={!message.trim()}
        loading={busy}
        onPress={save}
      />
    </View>
  );
}
