import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/storage/AppProvider';
import { createInitialState } from '../src/domain/models';
import { FragranceScreen } from '../src/screens/FragranceScreen';
import { WearScreen } from '../src/screens/WearScreen';
import { TodayScreen } from '../src/screens/TodayScreen';
import { Button, Chip } from '../src/ui/components';

const mockNav = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
};
let mockParams: object = { id: 'ck-one' };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: mockParams }),
}));
jest.mock('../src/ui/useNow', () => ({
  useNow: () => new Date('2025-04-10T12:00:00'),
}));
let renderer: ReactTestRenderer.ReactTestRenderer;
const mount = async (screen: React.ReactNode) => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<AppProvider>{screen}</AppProvider>);
  });
};
const button = (label: string) =>
  renderer.root
    .findAllByType(Button)
    .filter(item => item.props.label === label)
    .slice(-1)[0];
const press = async (label: string) => {
  await act(async () => {
    await button(label).props.onPress();
  });
};
const select = async (label: string) => {
  await act(async () => {
    renderer.root
      .findAllByType(Chip)
      .find(item => item.props.label === label)!
      .props.onPress();
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  mockParams = { id: 'ck-one' };
});
afterEach(async () => {
  if (renderer) {
    await act(async () => renderer.unmount());
  }
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('saving from Discover requires a status and links to the exact shelf category', async () => {
  await mount(<FragranceScreen />);
  await press('Tambah ke My Shelf');
  expect(button('Simpan ke My Shelf').props.disabled).toBe(true);
  await select('Wishlist');
  await select('Sample');
  await press('Simpan ke My Shelf');
  const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
  expect(JSON.parse(calls[calls.length - 1][1]).shelf).toEqual([
    { fragranceId: 'ck-one', status: 'want', format: 'Sample' },
  ]);
  await press('Lihat My Shelf');
  expect(mockNav.navigate).toHaveBeenCalledWith(
    'Home',
    expect.objectContaining({
      screen: 'Shelf',
      params: expect.objectContaining({
        screen: 'ShelfHome',
        params: expect.objectContaining({
          status: 'want',
          highlightId: 'ck-one',
        }),
      }),
    }),
  );
});
test('failed shelf save keeps choices and never announces success; retry works', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
    new Error('disk full'),
  );
  await mount(<FragranceScreen />);
  await press('Tambah ke My Shelf');
  await select('Punya');
  await press('Simpan ke My Shelf');
  expect(button('Lihat My Shelf')).toBeUndefined();
  expect(
    renderer.root
      .findAllByType(Chip)
      .find(item => item.props.label === 'Punya')!.props.selected,
  ).toBe(true);
  await press('Simpan ke My Shelf');
  expect(button('Lihat My Shelf')).toBeDefined();
});
test('quick wear confirms the chosen occasion and prevents duplicate rapid taps', async () => {
  mockParams = { fragranceId: 'ck-one', quick: true, occasion: 'Kerja' };
  await mount(<WearScreen />);
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(0);
  const save = button('Konfirmasi pemakaian hari ini').props.onPress;
  await act(async () => {
    await Promise.all([save(), save()]);
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  const state = JSON.parse(
    (AsyncStorage.setItem as jest.Mock).mock.calls[0][1],
  );
  expect(state.logs).toHaveLength(1);
  expect(state.logs[0].occasion).toBe('Kerja');
  expect(state.logs[0]).not.toHaveProperty('visibility');
  expect(mockNav.goBack).toHaveBeenCalledTimes(1);
});
test('quick wear uses the current day when the confirmation spans midnight', async () => {
  jest.useFakeTimers({ now: new Date('2025-04-10T23:59:50') });
  mockParams = { fragranceId: 'ck-one', quick: true, occasion: 'Kerja' };
  await mount(<WearScreen />);
  const confirmedAt = new Date('2025-04-11T00:01:00');
  jest.setSystemTime(confirmedAt);
  await press('Konfirmasi pemakaian hari ini');
  const state = JSON.parse(
    (AsyncStorage.setItem as jest.Mock).mock.calls[0][1],
  );
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
  state.shelf = [{ fragranceId: 'ck-one', status: 'have', format: 'Sample' }];
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(state));
  await mount(<TodayScreen />);
  expect(button('Tambah kesan')).toBeDefined();
  expect(button('Pakai hari ini')).toBeUndefined();
});
