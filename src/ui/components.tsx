import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Fragrance, Scentlist } from '../domain/models';
import { fragranceById } from '../domain/catalog';
import { colors, s } from './theme';

const paths = {
  studio:
    'M9 3h6M10 3v6L4 19q-1 2 2 2h12q3 0 2-2L14 9V3M8 14h8M9 17h.01M14 18h.01',
  today:
    'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6L7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  lists: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  shelf:
    'M4 3v18m16-18v18M4 11h16M4 20h16M7 5h3v6H7zM13 4h4v7h-4zM8 14h4v6H8zM15 13h2v7h-2z',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12l4 4L19 6',
  back: 'M15 5l-7 7 7 7',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  drop: 'M12 2C9 7 4 11 4 15a8 8 0 0 0 16 0c0-4-5-8-8-13Z',
  lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
  bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
  edit: 'm16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
  shield: 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6l-9-4Z',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 22,
  color = colors.green,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={paths[name]}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Screen({
  children,
  scroll = true,
  scrollRef,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={s.page} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.content,
            { paddingBottom: 32 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

export function Header({
  title,
  onBack,
  onProfile,
  name,
}: {
  title: string;
  onBack?: () => void;
  onProfile?: () => void;
  name?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={s.row}>
        {onBack ? (
          <IconButton name="back" label="Kembali" onPress={onBack} />
        ) : (
          <Icon name="drop" size={21} />
        )}
        <Text style={styles.wordmark}>{title}</Text>
      </View>
      {onProfile && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka profil"
          onPress={onProfile}
          style={styles.avatar}
        >
          <Text style={styles.initial}>
            {(name || 'E').slice(0, 1).toUpperCase()}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const foreground =
    variant === 'primary'
      ? colors.white
      : variant === 'danger'
      ? colors.danger
      : colors.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : icon ? (
        <Icon name={icon} size={18} color={foreground} />
      ) : null}
      <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  active = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Icon
        name={name}
        color={active ? colors.green : colors.muted}
        filled={active && (name === 'heart' || name === 'bookmark')}
      />
    </Pressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  compact = false,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      onPress={onPress}
      style={[styles.chip, compact && styles.compactChip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, compact && styles.compactChipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          s.input,
          props.multiline && { minHeight: 94, textAlignVertical: 'top' },
        ]}
        {...props}
      />
    </View>
  );
}

export function Empty({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[s.card, { alignItems: 'center', paddingVertical: 28 }]}>
      <Icon name="drop" size={30} />
      <Text style={[s.h3, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[s.body, { textAlign: 'center' }]}>{body}</Text>
      {action && onAction && (
        <Button label={action} onPress={onAction} variant="secondary" />
      )}
    </View>
  );
}

// Original vector illustration; not an official product photograph.
export function Bottle({
  fragrance,
  size = 130,
}: {
  fragrance: Fragrance;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size * 1.28}
      viewBox="0 0 160 205"
      accessibilityLabel={`Ilustrasi ${fragrance.name}`}
    >
      <Defs>
        <SvgGradient id={`glass-${fragrance.id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
          <Stop offset="0.35" stopColor={fragrance.color} />
          <Stop offset="1" stopColor={fragrance.ink} stopOpacity={0.65} />
        </SvgGradient>
      </Defs>
      <Ellipse cx={80} cy={193} rx={49} ry={7} fill="#142F21" opacity={0.09} />
      <Rect x={61} y={10} width={38} height={29} rx={5} fill={fragrance.ink} />
      <Rect x={64} y={38} width={32} height={10} fill="#BAA779" />
      <Path
        d="M48 48H112Q120 48 124 63L131 168Q133 186 116 187H44Q27 186 29 168L36 63Q39 48 48 48Z"
        fill={`url(#glass-${fragrance.id})`}
        stroke={fragrance.ink}
        strokeOpacity={0.2}
      />
      <Path d="M43 66 37 166" stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />
      <Rect
        x={43}
        y={95}
        width={74}
        height={62}
        rx={2}
        fill="#FAF8F1"
        opacity={0.92}
      />
      <SvgText
        x={80}
        y={112}
        textAnchor="middle"
        fontSize={7}
        fill={fragrance.ink}
        letterSpacing={1}
      >
        {fragrance.brand.toUpperCase().slice(0, 18)}
      </SvgText>
      <SvgText
        x={80}
        y={130}
        textAnchor="middle"
        fontFamily="serif"
        fontSize={9}
        fill={fragrance.ink}
      >
        {fragrance.name.slice(0, 19)}
      </SvgText>
      <SvgText
        x={80}
        y={146}
        textAnchor="middle"
        fontSize={6}
        fill={fragrance.ink}
        letterSpacing={2}
      >
        {fragrance.concentration}
      </SvgText>
    </Svg>
  );
}

export function FragranceRow({
  fragrance,
  onPress,
  subtitle,
  right,
}: {
  fragrance: Fragrance;
  onPress: () => void;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.fragranceRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Detail ${fragrance.name}`}
        onPress={onPress}
        style={[s.row, s.flex]}
      >
        <View
          style={[styles.thumb, { backgroundColor: fragrance.color + '50' }]}
        >
          <Bottle fragrance={fragrance} size={46} />
        </View>
        <View style={s.flex}>
          <Text style={s.label}>{fragrance.brand.toUpperCase()}</Text>
          <Text style={[s.h3, { marginVertical: 3 }]}>{fragrance.name}</Text>
          <Text style={s.small}>
            {subtitle || fragrance.accords.slice(0, 2).join(' · ')}
          </Text>
        </View>
      </Pressable>
      {right}
    </View>
  );
}

export function ListCover({
  list,
  large = false,
}: {
  list: Scentlist;
  large?: boolean;
}) {
  const first =
    fragranceById(list.items[0]?.fragranceId) || fragranceById('santal-33')!;
  return (
    <View
      style={[
        styles.cover,
        { backgroundColor: list.color, height: large ? 250 : 178 },
      ]}
    >
      <View style={styles.coverRing} />
      <View style={styles.coverBottle}>
        <Bottle fragrance={first} size={large ? 150 : 102} />
      </View>
      <View style={styles.coverText}>
        <Text style={styles.coverLabel}>ESSENZA / SCENTLIST</Text>
        <Text
          style={[styles.coverTitle, large && { fontSize: 32, lineHeight: 39 }]}
          numberOfLines={3}
        >
          {list.title}
        </Text>
        <Text style={styles.coverCount}>{list.items.length} parfum</Text>
      </View>
    </View>
  );
}

export function Section({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.between}>
      <Text style={s.h2}>{title}</Text>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.green, fontWeight: '600' }}>
            {action} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    minHeight: 66,
  },
  wordmark: {
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '700',
    color: colors.green,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 17, color: colors.green, fontWeight: '700' },
  button: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.green },
  secondary: { backgroundColor: colors.sage },
  buttonText: { fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.green, borderColor: colors.green },
  compactChip: { flex: 1, paddingHorizontal: 4 },
  compactChipText: { fontSize: 11, textAlign: 'center' },
  chipText: { fontSize: 12, color: colors.muted, textTransform: 'capitalize' },
  chipTextSelected: { color: colors.white },
  fragranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  thumb: {
    width: 65,
    height: 76,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: { borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' },
  coverRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    right: -70,
    top: -80,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#FFFFFF30',
  },
  coverBottle: {
    position: 'absolute',
    right: 8,
    bottom: -5,
    transform: [{ rotate: '12deg' }],
    opacity: 0.85,
  },
  coverText: { padding: 19, width: '72%' },
  coverLabel: {
    color: '#FFFFFFB0',
    fontSize: 8,
    letterSpacing: 1.6,
    fontWeight: '600',
  },
  coverTitle: {
    fontFamily: 'serif',
    fontSize: 26,
    lineHeight: 32,
    color: colors.white,
    marginVertical: 10,
  },
  coverCount: { fontSize: 11, color: '#FFFFFFCC' },
});
