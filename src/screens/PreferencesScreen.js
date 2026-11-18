import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useApp } from '../storage/AppProvider';
import { ACCORDS } from '../domain/models';
import { Button, Chip, Field, Header, Screen } from '../ui/components';
import { NoteTile } from '../ui/NoteTiles';
import { colors, s } from '../ui/theme';

const preferenceOrder = [
  'fresh',
  'woody',
  'floral',
  'sweet',
  'musky',
  'spicy',
  'green',
  'citrus',
];

export function PreferencesScreen({ navigation, onboarding = false, onBack }) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.profile.name);
  const [likes, setLikes] = useState(state.profile.likes);
  const [avoids, setAvoids] = useState(state.profile.avoids);
  const [busy, setBusy] = useState(false);

  const toggle = (value, primary, other) => {
    primary(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
    other(current => current.filter(item => item !== value));
  };
  const save = async (skip = false) => {
    setBusy(true);
    const ok = await dispatch({
      type: 'profile',
      profile: {
        ...state.profile,
        name: skip ? state.profile.name || 'Explorer' : name,
        likes: skip ? state.profile.likes : likes,
        avoids: skip ? state.profile.avoids : avoids,
      },
      onboard: true,
    });
    setBusy(false);
    if (ok && !onboarding) navigation.goBack();
  };

  return (
    <Screen
      contentStyle={{ gap: 12 }}
      style={{ backgroundColor: colors.white }}
    >
      <Header
        title={onboarding ? 'Back' : 'Scent Preferences'}
        onBack={onboarding ? onBack : navigation.goBack}
      />
      {onboarding && (
        <>
          <View style={s.card}>
            <Text style={s.h3}>Local storage</Text>
            <Text style={s.small}>
              Your profile and activity are saved on this device.
            </Text>
          </View>
          <Text style={s.h2}>Start With Your Taste!</Text>
        </>
      )}
      <Field
        label="Nickname"
        value={name}
        onChangeText={setName}
        placeholder="Enter your nickname..."
        maxLength={40}
      />
      <Text style={s.h3}>What scents do you like?</Text>
      <Text style={s.small}>
        Pick a few scents, or skip if you're not sure yet.
      </Text>
      <View style={s.wrap}>
        {preferenceOrder.map(accord => (
          <NoteTile
            key={accord}
            label={accord}
            accord={accord}
            selected={likes.includes(accord)}
            onPress={() => toggle(accord, setLikes, setAvoids)}
          />
        ))}
      </View>
      <Text style={s.h3}>What do you want to avoid?</Text>
      <View style={s.wrap}>
        {ACCORDS.map(accord => (
          <Chip
            key={accord}
            label={accord}
            selected={avoids.includes(accord)}
            onPress={() => toggle(accord, setAvoids, setLikes)}
          />
        ))}
      </View>
      <Button
        label={onboarding ? 'Get Started' : 'Save preferences'}
        loading={busy}
        disabled={busy || !name.trim()}
        onPress={() => save()}
      />
      {onboarding && (
        <Button
          label="Explore Essenza First"
          variant="secondary"
          disabled={busy}
          onPress={() => save(true)}
        />
      )}
    </Screen>
  );
}
