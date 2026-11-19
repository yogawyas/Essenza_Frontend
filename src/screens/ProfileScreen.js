import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ACCORDS } from '../domain/models';
import { useApp } from '../storage/AppProvider';
import { Button, Chip, Field } from '../ui/components';
import { DesignScreen, PageHeader, designStyles } from '../ui/design';
import { s } from '../ui/theme';

export function ProfileScreen() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.profile.name);
  const [likes, setLikes] = useState(state.profile.likes);
  const [avoids, setAvoids] = useState(state.profile.avoids);
  const [busy, setBusy] = useState(false);
  const toggle = (accord, preferred) => {
    const addOrRemove = values =>
      values.includes(accord)
        ? values.filter(value => value !== accord)
        : [...values, accord];
    const remove = values => values.filter(value => value !== accord);
    setLikes(preferred ? addOrRemove : remove);
    setAvoids(preferred ? remove : addOrRemove);
  };
  const save = async skip => {
    setBusy(true);
    await dispatch({
      type: 'profile',
      profile: {
        ...state.profile,
        name: skip ? name.trim() || 'Explorer' : name,
        likes,
        avoids,
      },
      onboard: true,
    });
    setBusy(false);
  };
  return (
    <DesignScreen paper header={<PageHeader title="Essenza" />}>
      <Text style={s.h2}>Start with What You Like</Text>
      <Field
        label="Username"
        placeholder="What should we call you?"
        value={name}
        onChangeText={setName}
        maxLength={20}
      />
      {[
        ['Scents you like', likes, true],
        ['Scents you avoid', avoids, false],
      ].map(([title, selected, preferred]) => (
        <View key={title} style={designStyles.stack}>
          <Text style={s.body}>{title} (optional)</Text>
          <View style={s.wrap}>
            {ACCORDS.map(accord => (
              <Chip
                compact
                key={accord}
                label={accord}
                selected={selected.includes(accord)}
                onPress={() => toggle(accord, preferred)}
              />
            ))}
          </View>
        </View>
      ))}
      <Button
        label="Get Started"
        loading={busy}
        disabled={!name.trim()}
        onPress={() => save(false)}
      />
      <Button
        label="Explore Essenza"
        variant="secondary"
        disabled={busy}
        onPress={() => save(true)}
      />
    </DesignScreen>
  );
}
