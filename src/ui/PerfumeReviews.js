import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { makeId } from '../domain/models';
import { useApp } from '../storage/AppProvider';
import { Avatar, DesignIcon, designStyles } from './design';
import { colors, s, sans, serif } from './theme';

const stars = [1, 2, 3, 4, 5];
const relativeUnits = [
  ['year', 365],
  ['month', 30],
  ['week', 7],
  ['day', 1],
];

function relativeDate(value) {
  if (!value) {
    return '';
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return '';
  }
  const days = Math.max(0, Math.floor((Date.now() - time) / 86400000));
  for (const [unit, duration] of relativeUnits) {
    const count = Math.floor(days / duration);
    if (count) {
      return count + ' ' + unit + (count === 1 ? ' ago' : 's ago');
    }
  }
  return 'Today';
}

export function PerfumeReviews({ fragranceId }) {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(1);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const reviews = state.feedback.filter(
    entry => entry.kind === 'perfume' && entry.target === fragranceId,
  );

  const post = async () => {
    if (pending.current || !message.trim()) {
      return;
    }
    pending.current = true;
    setBusy(true);
    const saved = await dispatch({
      type: 'feedback',
      entry: {
        id: makeId('feedback'),
        kind: 'perfume',
        target: fragranceId,
        message,
        rating,
        createdAt: new Date().toISOString(),
      },
    });
    setBusy(false);
    pending.current = false;
    if (saved) {
      setMessage('');
      setRating(1);
    }
  };

  const deleteReview = id =>
    Alert.alert('Delete this review?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'deleteFeedback', id }),
      },
    ]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <DesignIcon name="reviewComment" />
        <Text accessibilityRole="header" style={styles.title}>
          Post a Review
        </Text>
      </View>
      <View style={styles.form}>
        <View style={styles.authorBar}>
          <Avatar size={32} />
          <Text numberOfLines={1} style={[s.flex, designStyles.strong]}>
            {state.profile.name}
          </Text>
          <ReviewStars rating={rating} onChange={setRating} disabled={busy} />
        </View>
        <TextInput
          accessibilityLabel="Write down your review"
          placeholder="Write down your review..."
          placeholderTextColor={colors.muted}
          value={message}
          onChangeText={setMessage}
          editable={!busy}
          maxLength={280}
          multiline
          style={styles.message}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy || !message.trim()}
          accessibilityState={{ disabled: busy || !message.trim() }}
          onPress={post}
          style={[styles.post, (busy || !message.trim()) && styles.disabled]}
        >
          <Text style={styles.postText}>{busy ? 'Posting…' : 'Post'}</Text>
        </Pressable>
      </View>
      {reviews.map(entry => {
        const date = relativeDate(entry.createdAt);
        return (
          <Pressable
            key={entry.id}
            onLongPress={() => deleteReview(entry.id)}
            accessibilityLabel={state.profile.name + ', ' + entry.message}
            accessibilityActions={[{ name: 'delete', label: 'Delete review' }]}
            onAccessibilityAction={({ nativeEvent }) => {
              if (nativeEvent.actionName === 'delete') {
                deleteReview(entry.id);
              }
            }}
            style={styles.review}
          >
            <Avatar size={36} />
            <View style={s.flex}>
              <View style={styles.reviewMeta}>
                <Text style={designStyles.strong}>{state.profile.name}</Text>
                {date ? <Text style={styles.date}>{date}</Text> : null}
                {entry.rating ? <ReviewStars rating={entry.rating} /> : null}
              </View>
              <Text style={styles.reviewText}>{entry.message}</Text>
            </View>
          </Pressable>
        );
      })}
      {reviews.length === 0 ? (
        <Text style={styles.empty}>There are no reviews yet</Text>
      ) : null}
    </View>
  );
}

function ReviewStars({ rating, onChange, disabled }) {
  return (
    <View
      style={[styles.stars, onChange && styles.starFrame]}
      accessible={!onChange}
      accessibilityLabel={onChange ? undefined : rating + ' out of 5 stars'}
    >
      {stars.map(value => {
        const icon = value <= rating ? 'reviewStarFill' : 'reviewStar';
        return onChange ? (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={value + (value === 1 ? ' star' : ' stars')}
            accessibilityState={{
              checked: rating === value,
              disabled: Boolean(disabled),
            }}
            disabled={disabled}
            onPress={() => onChange(value)}
            hitSlop={4}
          >
            <DesignIcon name={icon} />
          </Pressable>
        ) : (
          <DesignIcon key={value} name={icon} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    borderColor: colors.line,
    gap: 12,
    paddingTop: 12,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  title: { fontFamily: serif, color: colors.ink, fontSize: 16 },
  form: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    gap: 8,
  },
  authorBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starFrame: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
  },
  message: {
    backgroundColor: '#F1F1F1',
    color: colors.green,
    fontFamily: sans,
    fontSize: 12,
    minHeight: 63,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    textAlignVertical: 'top',
    padding: 8,
  },
  post: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 67,
    minHeight: 20,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  disabled: { opacity: 0.6 },
  postText: { color: colors.white, fontFamily: sans, fontSize: 10 },
  review: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  date: { ...designStyles.caption, fontSize: 10 },
  reviewText: { ...designStyles.text, fontSize: 12 },
  empty: { ...designStyles.caption, textAlign: 'center', paddingVertical: 20 },
});
