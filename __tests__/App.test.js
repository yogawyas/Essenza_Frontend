import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App, { SPLASH_DURATION_MS } from '../src/App';
import { Button } from '../src/ui/components';
import { LabProvider, useLab } from '../src/storage/LabProvider';
let tree;
async function finishSplash() {
  await act(async () => {
    jest.advanceTimersByTime(SPLASH_DURATION_MS);
  });
}
beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  AsyncStorage.getItem.mockResolvedValue(null);
  AsyncStorage.setItem.mockResolvedValue(undefined);
  await act(async () => {
    tree = TestRenderer.create(<App />);
  });
  await finishSplash();
});
afterEach(async () => {
  await act(async () => {
    tree.unmount();
  });
  jest.useRealTimers();
});
const button = label =>
  tree.root.findAllByType(Button).find(node => node.props.label === label);
async function press(label) {
  await act(async () => {
    const node = tree.root.findAll(
      candidate =>
        candidate.props.accessibilityLabel === label &&
        typeof candidate.props.onPress === 'function',
    )[0];
    node.props.onPress();
  });
}
async function showResult() {
  await press('Pilih Linalool');
  await act(async () => {
    button('Lihat contoh hasil').props.onPress();
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}
test('splash is shown for 1.5 seconds before the workspace', async () => {
  await act(async () => {
    tree.unmount();
    tree = TestRenderer.create(<App />);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Menyiapkan ruang kerja');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Analisis molekul');
  await act(async () => {
    jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Menyiapkan ruang kerja');
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Analisis molekul');
});
test('blank input reports an actionable error; demo can be saved without duplicate records', async () => {
  await act(async () => {
    button('Lihat contoh hasil').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Masukkan SMILES');
  await showResult();
  expect(JSON.stringify(tree.toJSON())).toContain(
    'bukan hasil model penelitian',
  );
  await act(async () => {
    await button('Simpan ke riwayat').props.onPress();
  });
  expect(button('Tersimpan di riwayat').props.disabled).toBe(true);
  const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
  expect(saved.records).toHaveLength(1);
  expect(saved.records[0].demo).toBe(true);
});
test('write failure stays visible and the result can be saved on retry', async () => {
  await showResult();
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Penyimpanan penuh'));
  await act(async () => {
    await button('Simpan ke riwayat').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Penyimpanan penuh');
  expect(button('Simpan ke riwayat')).toBeDefined();
  await act(async () => {
    await button('Simpan ke riwayat').props.onPress();
  });
  expect(button('Tersimpan di riwayat')).toBeDefined();
});
test('stored results reload, duplicate saves are idempotent, and failed removal preserves history', async () => {
  await showResult();
  await act(async () => {
    await button('Simpan ke riwayat').props.onPress();
  });
  const raw = AsyncStorage.setItem.mock.calls[0][1];
  const result = JSON.parse(raw).records[0];
  let state;
  function Probe() {
    state = useLab();
    return null;
  }
  await act(async () => {
    tree.unmount();
  });
  AsyncStorage.getItem.mockResolvedValueOnce(raw);
  await act(async () => {
    tree = TestRenderer.create(
      <LabProvider>
        <Probe />
      </LabProvider>,
    );
  });
  expect(state.records[0].id).toBe(result.id);
  await act(async () => {
    await Promise.all([state.save(result), state.save(result)]);
  });
  expect(state.records).toHaveLength(1);
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('disk error'));
  await act(async () => {
    await expect(state.remove(result.id)).rejects.toThrow();
  });
  expect(state.records).toHaveLength(1);
  await act(async () => {
    await state.remove(result.id);
  });
  expect(state.records).toHaveLength(0);
});
test('unreadable history blocks writes until a successful reload', async () => {
  await act(async () => {
    tree.unmount();
  });
  AsyncStorage.getItem.mockRejectedValueOnce(new Error('read error'));
  await act(async () => {
    tree = TestRenderer.create(<App />);
  });
  await finishSplash();
  await showResult();
  expect(button('Simpan ke riwayat').props.disabled).toBe(true);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  await act(async () => {
    await button('Muat ulang riwayat').props.onPress();
  });
  expect(button('Simpan ke riwayat').props.disabled).toBe(false);
});
test('unsupported SMILES do not navigate to a fabricated result', async () => {
  await act(async () => {
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'SMILES molekul')
      .props.onChangeText('CCN');
  });
  await act(async () => {
    button('Lihat contoh hasil').props.onPress();
  });
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => String(node.props.children).includes('belum tersedia')),
  ).toBe(true);
  expect(
    tree.root
      .findAllByType(Button)
      .some(node => node.props.label === 'Simpan ke riwayat'),
  ).toBe(false);
});
