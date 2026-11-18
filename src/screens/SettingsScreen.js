import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Header, Icon, Screen } from '../ui/components';
import { colors, s } from '../ui/theme';
import { useApp } from '../storage/AppProvider';

export function SettingsScreen({ navigation, email, onSignOut, onReset }) {
  const { state } = useApp();
  function row(label, icon, onPress, destructive = false) {
    const color = destructive ? colors.danger : colors.green;
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.row}
      >
        <Icon name={icon} color={color} />
        <Text style={[s.flex, { color, fontSize: 15 }]}>{label}</Text>
        {!destructive && <Text style={s.h3}>›</Text>}
      </Pressable>
    );
  }
  return (
    <Screen style={{ backgroundColor: colors.white }}>
      <Header title="Settings" onBack={navigation.goBack} />
      <Pressable
        style={[s.row, styles.account]}
        accessibilityRole="button"
        onPress={() => navigation.navigate('EditProfile')}
      >
        <View style={styles.avatar} />
        <View style={s.flex}>
          <Text style={s.h3}>{state.profile.name || 'Essenza'}</Text>
          {!!email && <Text style={s.small}>{email}</Text>}
        </View>
        <Text style={s.h3}>›</Text>
      </Pressable>
      <Text style={s.h3}>Main Settings</Text>
      {row('Scent Preferences', 'heart', () =>
        navigation.navigate('Preferences'),
      )}
      {row('Help & About', 'drop', () =>
        Alert.alert(
          'Essenza',
          'Your profile and collections are saved on this device.',
        ),
      )}
      {row('Log Out', 'back', onSignOut, true)}
      <Pressable
        accessibilityRole="button"
        style={styles.remove}
        onPress={() =>
          Alert.alert(
            'Delete all local data?',
            'Your profile, collections, and activity on this device will be deleted.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: onReset,
              },
            ],
          )
        }
      >
        <Text style={styles.removeLabel}>
          Delete profile and all local data
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12 },
  account: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: 16,
  },
  avatar: {
    backgroundColor: '#65A768',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  remove: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: 18,
    marginTop: 24,
  },
  removeLabel: { color: colors.danger, fontWeight: '600' },
});
