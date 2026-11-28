import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sans } from './theme';

// How close (in pixels) to the bottom the user must scroll before more load.
const THRESHOLD = 900;

// Shows a long list page by page. Pass `onScroll` to the surrounding
// ScrollView; changing `resetKey` (for example a search query) starts over.
export function useIncrementalList(items, { pageSize = 20, resetKey } = {}) {
  const [count, setCount] = useState(pageSize);
  useEffect(() => {
    setCount(pageSize);
  }, [resetKey, pageSize]);

  const total = items.length;
  const loadMore = useCallback(
    () => setCount(current => (current < total ? current + pageSize : current)),
    [total, pageSize],
  );
  const onScroll = useCallback(
    ({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - THRESHOLD
      ) {
        loadMore();
      }
    },
    [loadMore],
  );

  return {
    visible: items.slice(0, count),
    hasMore: count < total,
    total,
    loadMore,
    onScroll,
  };
}

// Footer under a paged list: a spinner while more remain (tap to load in case
// the list is too short to scroll), otherwise the total count.
export function LoadMoreFooter({ hasMore, total, loadMore, noun = 'items' }) {
  return hasMore ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Load more ${noun}`}
      onPress={loadMore}
      style={styles.footer}
    >
      <ActivityIndicator color={colors.green} />
      <Text style={styles.text}>Loading more {noun}…</Text>
    </Pressable>
  ) : (
    <View style={styles.footer}>
      <Text style={styles.text}>
        All {total} {noun} shown
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  text: { fontFamily: sans, fontSize: 12, color: colors.muted },
});
