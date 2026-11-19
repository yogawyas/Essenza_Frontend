import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Image, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/storage/AppProvider';
import { createInitialState } from '../src/domain/models';
import { PerfumeScreen } from '../src/screens/PerfumeScreen';
import { SearchScreen } from '../src/screens/SearchScreen';
import { WearScreen } from '../src/screens/WearScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { Button, IconButton } from '../src/ui/components';
const mockNav = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
};
let mockParams = {
  id: 'ck-one',
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({
    params: mockParams,
  }),
}));
jest.mock('../src/ui/useNow', () => ({
  useNow: () => new Date('2025-04-10T12:00:00'),
}));
let renderer;
const mount = async screen => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<AppProvider>{screen}</AppProvider>);
  });
};
const button = label =>
  renderer.root
    .findAllByType(Button)
    .filter(item => item.props.label === label)
    .slice(-1)[0];
const press = async label => {
  await act(async () => {
    await button(label).props.onPress();
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockResolvedValue(null);
  AsyncStorage.setItem.mockResolvedValue(undefined);
  mockParams = {
    id: 'ck-one',
  };
});
afterEach(async () => {
  if (renderer) {
    await act(async () => renderer.unmount());
  }
  jest.restoreAllMocks();
  jest.useRealTimers();
});
test('Discover finds a fragrance by note and detail shows its local bottle photo', async () => {
  await mount(<SearchScreen />);
  const search = renderer.root
    .findAllByType(TextInput)
    .find(
      input =>
        input.props.accessibilityLabel === 'Perfume, MyShelf, Account, Brand',
    );
  await act(async () => search.props.onChangeText('cinnamon'));
  expect(
    renderer.root
      .findAllByType(Text)
      .some(text => text.props.children === 'Khamrah'),
  ).toBe(true);

  await act(async () => renderer.unmount());
  mockParams = { id: 'lattafa-khamrah' };
  await mount(<PerfumeScreen />);
  const bottle = renderer.root
    .findAllByType(Image)
    .find(image => image.props.accessibilityLabel === 'Khamrah');
  expect(bottle.props.source).toBeDefined();
  expect(
    renderer.root
      .findAllByType(Text)
      .some(text => text.props.children === 'Cinnamon'),
  ).toBe(true);
});

test('adds to the selected scentlist and opens the perfume journal', async () => {
  const state = createInitialState();
  state.lists = [
    {
      id: 'rotation',
      title: 'Rotation',
      authorId: state.profile.id,
      description: '',
      visibility: 'private',
      color: '#163A2C',
      updatedAt: '2025-04-10T10:00:00Z',
      items: [],
    },
  ];
  AsyncStorage.getItem.mockResolvedValue(JSON.stringify(state));
  await mount(<PerfumeScreen />);
  await press('Add to MyShelf');
  await act(async () =>
    renderer.root
      .findAllByType(IconButton)
      .find(control => control.props.label === 'Add to Rotation')
      .props.onPress(),
  );
  const calls = AsyncStorage.setItem.mock.calls;
  expect(JSON.parse(calls[calls.length - 1][1]).lists[0].items).toEqual([
    { fragranceId: 'ck-one', note: '' },
  ]);
  expect(button('Already Added to MyShelf')).toBeDefined();
  await press('See in Journal');
  expect(mockNav.navigate).toHaveBeenCalledWith('JournalDetail', {
    id: 'ck-one',
  });
});
test('quick wear confirms the chosen occasion and prevents duplicate rapid taps', async () => {
  mockParams = {
    fragranceId: 'ck-one',
    quick: true,
    occasion: 'Kerja',
  };
  await mount(<WearScreen />);
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(0);
  const save = button('Confirm Wear Today').props.onPress;
  await act(async () => {
    await Promise.all([save(), save()]);
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  const state = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
  expect(state.logs).toHaveLength(1);
  expect(state.logs[0].occasion).toBe('Kerja');
  expect(state.logs[0]).not.toHaveProperty('visibility');
  expect(mockNav.goBack).toHaveBeenCalledTimes(1);
});
test('quick wear uses the current day when the confirmation spans midnight', async () => {
  jest.useFakeTimers({
    now: new Date('2025-04-10T23:59:50'),
  });
  mockParams = {
    fragranceId: 'ck-one',
    quick: true,
    occasion: 'Kerja',
  };
  await mount(<WearScreen />);
  const confirmedAt = new Date('2025-04-11T00:01:00');
  jest.setSystemTime(confirmedAt);
  await press('Confirm Wear Today');
  const state = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
  expect(state.logs[0].wornAt).toBe(confirmedAt.toISOString());
});
test('Today shows recorded wearing instead of repeating the wear prompt', async () => {
  const state = createInitialState();
  state.logs = [
    {
      id: 'one',
      fragranceId: 'ck-one',
      wornAt: new Date('2025-04-10T10:00:00').toISOString(),
      occasion: 'Kerja',
      note: '',
    },
  ];
  state.shelf = [
    {
      fragranceId: 'ck-one',
      status: 'have',
      format: 'Sample',
    },
  ];
  AsyncStorage.getItem.mockResolvedValue(JSON.stringify(state));
  await mount(<HomeScreen />);
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Edit CK One wear entry',
    }).length,
  ).toBeGreaterThan(0);
  expect(button('Log wear today')).toBeUndefined();
});
