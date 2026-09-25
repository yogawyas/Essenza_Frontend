import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { colors } from '../ui/theme';

export function SplashScreen() {
  return (
    <View style={styles.screen} accessibilityLabel="Layar pembuka Essenza">
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Icon name="flask" color={colors.green} size={42} />
        </View>
        <Text style={styles.name}>essenza.</Text>
        <Text style={styles.tagline}>DIGITAL SCENT LAB</Text>
      </View>

      <View style={styles.loading}>
        <ActivityIndicator color={colors.green} size="small" />
        <Text style={styles.loadingText}>Menyiapkan ruang kerja</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  brand: { alignItems: 'center' },
  mark: {
    width: 86,
    height: 86,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pale,
    marginBottom: 24,
  },
  name: {
    color: colors.ink,
    fontSize: 43,
    fontWeight: '600',
    letterSpacing: -2,
  },
  tagline: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3.2,
    marginTop: 7,
  },
  loading: {
    position: 'absolute',
    bottom: 68,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
