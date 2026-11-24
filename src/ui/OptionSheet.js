import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { DesignIcon } from './design';
import { Sheet } from './Sheet';
import { colors, sans } from './theme';

export function OptionSheet({ title, rows, onClose, busy, busyLabel }) {
  return (
    <Sheet title={title} onClose={onClose} busy={busy} variant="options">
      {rows.map(({ label, icon, selected, onPress }) => (
        <Pressable
          key={label}
          accessibilityRole="button"
          accessibilityState={{ selected, disabled: Boolean(busy) }}
          disabled={busy}
          onPress={onPress}
          style={[styles.row, selected && styles.selected]}
        >
          {icon ? <DesignIcon name={icon} /> : null}
          <Text style={styles.label}>
            {busy && label === busyLabel ? 'Saving…' : label}
          </Text>
          {selected ? <DesignIcon name="sortChecked" /> : null}
        </Pressable>
      ))}
    </Sheet>
  );
}

export function SortSheet({ alphabetical, onChange, onClose }) {
  return (
    <OptionSheet
      title="Sort By"
      onClose={onClose}
      rows={['Default', 'Name A-Z'].map((label, index) => ({
        label,
        selected: alphabetical === Boolean(index),
        onPress: () => {
          onChange(Boolean(index));
          onClose();
        },
      }))}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 38,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selected: { backgroundColor: '#163A2C40' },
  label: { flex: 1, color: colors.ink, fontFamily: sans, fontSize: 14 },
});
