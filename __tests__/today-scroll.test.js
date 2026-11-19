import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AppProvider, useApp } from '../src/storage/AppProvider';
import { HomeScreen } from '../src/screens/HomeScreen';
import { DesignScreen } from '../src/ui/design';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));
jest.mock('../src/ui/useNow', () => ({
  useNow: () => new Date('2025-04-10T12:00:00'),
}));
test('a new Now Wearing record scrolls the result into view', async () => {
  jest.useFakeTimers();
  let store;
  function Harness() {
    store = useApp();
    return <HomeScreen />;
  }
  let renderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AppProvider>
        <Harness />
      </AppProvider>,
    );
  });
  const scrollTo = jest.fn();
  renderer.root.findByType(DesignScreen).props.scrollRef.current = {
    scrollTo,
  };
  await act(async () => {
    await store.dispatch({
      type: 'wear',
      log: {
        id: 'qa-scroll',
        fragranceId: 'ck-one',
        wornAt: new Date('2025-04-10T10:00:00').toISOString(),
        occasion: 'Kuliah',
        note: '',
      },
    });
  });
  await act(async () => {
    jest.advanceTimersByTime(32);
  });
  expect(scrollTo).toHaveBeenCalledWith({
    y: 0,
    animated: false,
  });
  await act(async () => {
    renderer.unmount();
  });
  jest.useRealTimers();
});
