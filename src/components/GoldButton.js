import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { C } from '../theme/colors';

export const GoldButton = ({ onPress, disabled, children, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.78}
    style={[styles.goldBtn, disabled && styles.goldBtnDisabled, style]}
  >
    <Text style={[styles.goldBtnText, disabled && styles.goldBtnTextDisabled]}>
      {children}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  goldBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldBtnDisabled: {
    backgroundColor: C.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  goldBtnText: {
    color: C.greenDark,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  goldBtnTextDisabled: {
    color: C.textFaint,
  },
});
