import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '../theme/colors';

export const Header = ({ title = "ESSENZA", subtitle = "Discover Your Signature Scent" }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.headerIconBox}>
        <Image
          source={require('../../assets/icon/Icon_Essenza.png')}
          style={styles.headerIcon}
          resizeMode="cover"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.headerBottomShimmer} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.greenDark,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    overflow: 'hidden',
  },
  headerIcon: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    color: C.gold,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: C.textFaint,
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerBottomShimmer: {
    position: 'absolute',
    bottom: 0, left: 20, right: 20,
    height: 1,
    backgroundColor: C.goldFaint,
  },
});
