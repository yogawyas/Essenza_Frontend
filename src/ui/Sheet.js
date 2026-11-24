import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, s } from './theme';
import { IconButton } from './components';
export function Sheet({
  title,
  onClose,
  children,
  busy = false,
  compact = false,
  variant,
  scrollable = true,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const options = variant === 'options';
  const tabHeight = useContext(BottomTabBarHeightContext) || 0;
  const tabOffset = options ? tabHeight : 0;
  const bottomPadding = tabOffset ? 6 : Math.max(insets.bottom, 16);
  return (
    <Modal
      transparent
      statusBarTranslucent={compact || options}
      navigationBarTranslucent={compact || options}
      animationType="slide"
      onRequestClose={() => !busy && onClose()}
    >
      <KeyboardAvoidingView
        style={[styles.overlay, { paddingBottom: tabOffset }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          pointerEvents="none"
          style={[
            styles.backdrop,
            (compact || options) && styles.dimmed,
            { bottom: tabOffset },
          ]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => !busy && onClose()}
          accessibilityLabel="Close panel"
          accessibilityRole="button"
          disabled={busy}
        />
        <View
          style={[
            styles.panel,
            compact && styles.compactPanel,
            options && [
              styles.optionsPanel,
              { minHeight: Math.max(0, 238 - tabOffset) },
            ],
            {
              maxHeight: height * 0.85,
              paddingBottom: bottomPadding,
            },
          ]}
          accessibilityViewIsModal
        >
          <View
            style={[
              styles.handle,
              compact && styles.compactHandle,
              options && styles.optionsHandle,
            ]}
          />
          {options && title ? (
            <Text accessibilityRole="header" style={styles.optionsHeading}>
              {title}
            </Text>
          ) : !compact && !options ? (
            <View style={styles.heading}>
              <Text style={[s.h3, s.flex]}>{title}</Text>
              {!busy && (
                <IconButton name="down" label="Close panel" onPress={onClose} />
              )}
            </View>
          ) : null}
          {scrollable ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                options
                  ? title
                    ? styles.titledOptions
                    : styles.options
                  : compact
                  ? styles.compactContent
                  : styles.content
              }
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#102B2080' },
  dimmed: { backgroundColor: '#00000080' },
  optionsPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 6,
    elevation: 4,
  },
  optionsHandle: {
    width: 67,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8BA097',
  },
  optionsHeading: {
    ...s.h3,
    textAlign: 'center',
    color: colors.green,
    marginTop: 17,
  },
  options: { paddingTop: 30 },
  titledOptions: { paddingTop: 27 },
  compactContent: {
    paddingTop: 30,
    paddingHorizontal: 25,
    gap: 8,
    paddingBottom: 8,
  },
  compactPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    paddingTop: 8,
  },
  compactHandle: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  panel: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 8,
  },
  content: {
    paddingHorizontal: 22,
    gap: 16,
    paddingBottom: 16,
  },
});
