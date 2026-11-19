import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, s, sans } from './theme';

const accordColors = {
  citrus: '#D77F27',
  fresh: '#60A363',
  woody: '#6C4E1D',
  floral: '#8B5273',
  sweet: '#864C5A',
  musky: '#665049',
  spicy: '#8B4B31',
  green: '#46643F',
};

export function FragranceTags({ accords }) {
  return (
    <View style={s.wrap}>
      {accords.map(accord => (
        <Text
          key={accord}
          style={[
            styles.tag,
            { backgroundColor: accordColors[accord] || colors.green },
          ]}
        >
          {accord[0].toUpperCase() + accord.slice(1)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    color: colors.white,
    fontFamily: sans,
    fontSize: 12,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
});
