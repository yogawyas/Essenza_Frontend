import React from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, s } from './theme';
import { IconButton } from './components';
export function Sheet({
  title,
  onClose,
  children,
  busy = false,
  compact = false,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={() => !busy && onClose()}
    >
      <KeyboardAvoidingView
        style={[styles.overlay, compact && styles.clearOverlay]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            {
              maxHeight: height * 0.85,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.handle, compact && styles.compactHandle]} />
          {!compact ? (
            <View style={styles.heading}>
              <Text style={[s.h3, s.flex]}>{title}</Text>
              {!busy && (
                <IconButton name="down" label="Close panel" onPress={onClose} />
              )}
            </View>
          ) : null}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#102B2080',
  },
  clearOverlay: { backgroundColor: 'transparent' },
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
