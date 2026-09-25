import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../ui/theme';

export function SplashScreen() {
  return (
    <View style={styles.screen} accessibilityLabel="Layar pembuka Essenza">
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../assets/icon/Icon_Essenza.png')}
        resizeMode="contain"
        style={styles.appIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.splash,
    padding: 32,
  },
  appIcon: {
    width: 230,
    height: 230,
    borderRadius: 54,
  },
});
