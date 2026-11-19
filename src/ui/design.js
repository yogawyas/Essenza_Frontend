import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { figma } from './figmaAssets';
import { colors, s, sans, sansBold } from './theme';

export function DesignIcon({ name, style }) {
  return (
    <View style={style} pointerEvents="none" importantForAccessibility="no">
      <SvgXml xml={figma[name]} />
    </View>
  );
}

export function DesignAction({ name, label, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.action, style]}
    >
      <DesignIcon name={name} />
    </Pressable>
  );
}

export function DesignScreen({
  children,
  header,
  paper,
  contentStyle,
  scrollRef,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={[styles.screen, paper && styles.paper]}
      edges={['top', 'left', 'right']}
    >
      {header}
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          contentStyle,
          { paddingBottom: bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BrandBar({ navigation }) {
  return (
    <View style={styles.bar}>
      <View style={styles.brand}>
        <DesignIcon name="brand" />
        <Text style={styles.brandName}>Essenza</Text>
      </View>
      <View style={styles.actions}>
        <DesignAction
          name="history"
          label="History"
          onPress={() => navigation.navigate('History')}
        />
        <DesignAction
          name="bell"
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <DesignAction
          name="settings"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}

export function PageHeader({ title, onBack, children, bordered = true }) {
  return (
    <View style={[styles.bar, bordered && styles.divider]}>
      <View style={styles.heading}>
        {onBack ? (
          <DesignAction name="back" label="Back" onPress={onBack} />
        ) : null}
        <Text style={[s.h2, styles.title]}>{title}</Text>
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
  compact = false,
}) {
  return (
    <View style={[styles.search, compact && styles.searchCompact]}>
      <DesignIcon name="search" style={styles.searchIcon} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.searchInput, compact && styles.compactInput]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Text style={styles.close}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segments}>
      {options.map(option => (
        <Pressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === option.value }}
          onPress={() => onChange(option.value)}
          style={[
            styles.segment,
            value === option.value && styles.segmentActive,
          ]}
        >
          {option.icon ? <DesignIcon name={option.icon} /> : null}
          <Text
            style={[
              styles.segmentText,
              value === option.value && styles.segmentTextActive,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Avatar({ other = false, size = 52, style }) {
  return (
    <Image
      source={other ? figma.otherAvatar : figma.profileAvatar}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

export const designStyles = StyleSheet.create({
  stack: { gap: 12 },
  inset: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.green },
  caption: { fontFamily: sans, fontSize: 12, color: colors.muted },
  text: { fontFamily: sans, fontSize: 14, color: colors.green },
  strong: { fontFamily: sansBold, fontSize: 16, color: colors.green },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  paper: { backgroundColor: colors.white },
  content: { paddingHorizontal: 16, gap: 16, flexGrow: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.muted,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontFamily: sans, color: colors.green, fontSize: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  title: { color: colors.green },
  actions: { flexDirection: 'row', alignItems: 'center' },
  action: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: 40,
    borderRadius: 24,
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchCompact: {
    minHeight: 32,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.white,
    borderColor: colors.muted,
    paddingHorizontal: 8,
  },
  searchIcon: { opacity: 0.78 },
  searchInput: {
    flex: 1,
    fontFamily: sansBold,
    fontSize: 13,
    paddingVertical: 0,
    color: colors.green,
    minHeight: 38,
  },
  compactInput: { minHeight: 30, fontFamily: sans, fontSize: 12 },
  close: { fontSize: 22, color: colors.green, paddingHorizontal: 4 },
  segments: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.muted,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  segmentActive: { borderBottomColor: colors.green },
  segmentText: { fontFamily: sansBold, fontSize: 15, color: colors.muted },
  segmentTextActive: { color: colors.green },
});
