import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, s, sans } from './theme';
import { Icon } from './Icon';
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
  icon,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.green : '#FFFFFF'} />
      ) : (
        icon && (
          <Icon
            name={icon}
            color={secondary ? colors.ink : '#FFFFFF'}
            size={19}
          />
        )
      )}
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function DemoBadge() {
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.badgeText}>DEMO</Text>
    </View>
  );
}
export function Page({ children, back, title }) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={
        back ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']
      }
    >
      <View style={styles.header}>
        {back ? (
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            style={styles.back}
          >
            <Icon name="back" />
          </Pressable>
        ) : (
          <View style={styles.logo}>
            <Image
              accessibilityIgnoresInvertColors
              source={require('../../assets/icon/Icon_Essenza.png')}
              style={styles.logoImg}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={s.grow}>
          <Text style={title ? styles.headerTitle : styles.brand}>
            {title || 'Essenza'}
          </Text>
          <Text style={styles.tagline}>DIGITAL SCENT LAB</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={s.grow}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.page}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Notice({ children, error = false }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, error && styles.error]}
    >
      <Icon name="info" color={error ? colors.error : colors.amber} size={18} />
      <Text style={[styles.noticeText, error && styles.errorText]}>
        {children}
      </Text>
    </View>
  );
}
export function SectionTitle({ number, title, detail }) {
  return (
    <View style={s.between}>
      <View style={s.row}>
        <Text style={styles.number}>{number}</Text>
        <Text style={s.heading}>{title}</Text>
      </View>
      {detail && <Text style={s.small}>{detail}</Text>}
    </View>
  );
}
export function dateLabel(value) {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  logo: {
    borderRadius: 13,
    width: 43,
    height: 43,
    overflow: 'hidden',
  },
  logoImg: {
    width: 43,
    height: 43,
  },
  brand: {
    fontFamily: sans,
    fontSize: 26,
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontFamily: sans,
    fontSize: 21,
    color: colors.ink,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  tagline: {
    fontFamily: sans,
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 1.8,
    marginTop: 1,
  },
  badge: {
    backgroundColor: colors.amberBg,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.amber },
  badgeText: {
    fontFamily: sans,
    color: colors.amber,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  page: { padding: 22, paddingBottom: 36, flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640, gap: 24 },
  back: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 12,
    minHeight: 52,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondary: { backgroundColor: colors.pale },
  buttonText: {
    fontFamily: sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryText: { color: colors.ink },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.55 },
  notice: {
    backgroundColor: colors.amberBg,
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  noticeText: {
    fontFamily: sans,
    color: colors.amber,
    fontSize: 12,
    lineHeight: 19,
    flex: 1,
  },
  error: { backgroundColor: colors.errorBg },
  errorText: { color: colors.error },
  number: {
    fontFamily: sans,
    fontSize: 11,
    color: colors.green,
    backgroundColor: colors.pale,
    padding: 7,
    borderRadius: 7,
  },
});
