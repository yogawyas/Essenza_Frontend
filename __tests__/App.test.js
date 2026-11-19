import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/storage/AppProvider';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { Button, Chip } from '../src/ui/components';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
test('onboarding persists a local profile and explicit preferences', async () => {
  let renderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AppProvider>
        <ProfileScreen onboarding />
      </AppProvider>,
    );
  });
  const name = renderer.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Username');
  await act(async () => {
    name.props.onChangeText('Marvel');
  });
  await act(async () => {
    renderer.root
      .findAllByType(Chip)
      .find(chip => chip.props.label === 'citrus')
      .props.onPress();
  });
  await act(async () => {
    await renderer.root
      .findAllByType(Button)
      .find(button => button.props.label === 'Get Started')
      .props.onPress();
  });
  const calls = AsyncStorage.setItem.mock.calls;
  const persisted = JSON.parse(calls[calls.length - 1][1]);
  expect(persisted.onboarded).toBe(true);
  expect(persisted.profile.name).toBe('Marvel');
  expect(persisted.profile.likes).toEqual(['citrus']);
  await act(async () => {
    renderer.unmount();
  });
});
