import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, s } from './theme';
export function StudioProfile({ prediction }) {
  const max = prediction.profile[0]?.intensity || 1;
  return (
    <View style={s.card}>
      <Text style={styles.badge}>LAYERING PREVIEW</Text>
      <Text style={s.h2}>{prediction.summary}</Text>
      {prediction.profile
        .filter(item => item.intensity > 0)
        .map(item => {
          const relative = item.intensity / max;
          const label =
            relative >= 0.75
              ? 'Strong'
              : relative >= 0.35
              ? 'Moderate'
              : 'Light';
          return (
            <View
              key={item.accord}
              style={styles.row}
              accessible
              accessibilityLabel={item.accord + ', ' + label}
            >
              <View style={s.between}>
                <Text style={styles.accord}>{item.accord}</Text>
                <Text style={s.small}>{label}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${relative * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      <Text style={s.small}>
        The bars show how strongly each accord comes through in the preview.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  row: {
    gap: 6,
  },
  accord: {
    color: colors.ink,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
    overflow: 'hidden',
  },
  bar: {
    height: 8,
    backgroundColor: colors.green,
    borderRadius: 4,
  },
});
