import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App, { SPLASH_DURATION_MS } from '../src/App';
import { Button } from '../src/ui/components';
import { LabProvider, useLab } from '../src/storage/LabProvider';
import { HISTORY_KEY } from '../src/storage/history';
import { TUTORIAL_KEY } from '../src/tutorial/TutorialProvider';
import { FAVORITES_KEY } from '../src/storage/favorites';
import catalog from '../src/assets/catalog/compounds.json';
import { v7PredictionService } from '../src/services/v7Prediction';
jest.mock('../src/services/v7Prediction', () => ({
  v7PredictionService: { predict: jest.fn(), resolve: jest.fn() },
}));
let tree;
const scores = Array.from({ length: 109 }, (_, index) => ({
  label: index === 0 ? 'floral' : `label-${index}`,
  score: index === 0 ? 0.82 : 0.1,
}));
function prediction(smiles, sampleName) {
  return {
    id: `v7-${smiles}`, sampleName: sampleName || 'Linalool',
    inputSmiles: smiles, canonicalSmiles: smiles,
    createdAt: '2026-09-29T09:00:00.000Z', demo: false,
    modelId: 'perfume-five-grouped-v7-m2048-d8/lgbm_D',
    bundleId: 'a'.repeat(64), structureValidated: true,
    labels: [scores[0]], scores,
  };
}
async function finishSplash() {
  await act(async () => {
    jest.advanceTimersByTime(SPLASH_DURATION_MS);
  });
}
beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  AsyncStorage.getItem.mockImplementation(async key =>
    key === TUTORIAL_KEY ? 'seen' : null);
  AsyncStorage.setItem.mockResolvedValue(undefined);
  v7PredictionService.predict.mockImplementation(async ({ smiles, sampleName }) =>
    prediction(smiles, sampleName));
  v7PredictionService.resolve.mockResolvedValue([]);
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
  await press('Pilih senyawa dari katalog');
  await press('Pilih Linalool');
  await act(async () => {
    await button('Prediksi aroma').props.onPress();
  });
}
async function pressTab(label) {
  const text = tree.root.findAllByType(Text).find(node => node.props.children === label);
  let node = text;
  while (node && typeof node.props.onPress !== 'function') { node = node.parent; }
  await act(async () => node.props.onPress());
}
test('splash is shown for 1.5 seconds before the workspace', async () => {
  await act(async () => {
    tree.unmount();
    tree = TestRenderer.create(<App />);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Layar pembuka Essenza');
  expect(tree.toJSON()[0].props.style.opacity).toBe(0);
  await act(async () => {
    jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Layar pembuka Essenza');
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Analisis molekul');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Pilihan cepat');
});
test('successful prediction enters history automatically without adding to Koleksi', async () => {
  await act(async () => {
    button('Prediksi aroma').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Pilih senyawa dari katalog dulu.');
  expect(v7PredictionService.predict).not.toHaveBeenCalled();
  await showResult();
  expect(JSON.stringify(tree.toJSON())).toContain('HASIL PREDIKSI');
  expect(JSON.stringify(tree.toJSON())).toContain('Tercatat di Riwayat');
  expect(button('Coba simpan ke Riwayat')).toBeUndefined();
  const saved = JSON.parse(AsyncStorage.setItem.mock.calls
    .find(([key]) => key === HISTORY_KEY)[1]);
  expect(saved.records).toHaveLength(1);
  expect(saved.records[0].demo).toBe(false);
  expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(FAVORITES_KEY, expect.any(String));
});

test('running ML twice records two separate history entries', async () => {
  let run = 0;
  v7PredictionService.predict.mockImplementation(async ({ smiles, sampleName }) => ({
    ...prediction(smiles, sampleName), id: `run-${++run}`,
  }));
  await showResult();
  await press('Kembali');
  await act(async () => button('Prediksi aroma').props.onPress());
  const writes = AsyncStorage.setItem.mock.calls.filter(([key]) => key === HISTORY_KEY);
  const saved = JSON.parse(writes[writes.length - 1][1]);
  expect(saved.records.map(item => item.id)).toEqual(['run-2', 'run-1']);
  expect(v7PredictionService.predict).toHaveBeenCalledTimes(2);
});
test('catalog search selects a known structure and sends it for prediction', async () => {
  await press('Pilih senyawa dari katalog');
  await act(async () => {
    tree.root.findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Cari senyawa dalam katalog')
      .props.onChangeText('Vanillin');
  });
  await press('Pilih Vanillin, CID 1183');
  await act(async () => button('Prediksi aroma').props.onPress());
  expect(v7PredictionService.predict).toHaveBeenCalledWith(expect.objectContaining({
    smiles: catalog.compounds.find(item => item.name === 'Vanillin').smiles,
    catalogName: 'Vanillin',
  }));
});

test('name or formula mode requires a confirmed candidate before prediction', async () => {
  const candidates = [
    { name: 'Ethanol', smiles: 'CCO', molecular_formula: 'C2H6O', cid: '702', in_catalog: true, prediction_supported: true },
    { name: 'Dimethyl ether', smiles: 'COC', molecular_formula: 'C2H6O', cid: '8254', in_catalog: true, prediction_supported: true },
  ];
  v7PredictionService.resolve.mockResolvedValue(candidates);
  await press('Cari nama atau rumus');
  await act(async () => button('Prediksi aroma').props.onPress());
  expect(v7PredictionService.predict).not.toHaveBeenCalled();
  await act(async () => {
    tree.root.findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Nama atau rumus senyawa')
      .props.onChangeText('C2H6O');
  });
  await act(async () => button('Cari struktur').props.onPress());
  expect(v7PredictionService.resolve).toHaveBeenCalledWith(expect.objectContaining({ query: 'C2H6O' }));
  expect(JSON.stringify(tree.toJSON())).toContain('Dimethyl ether');
  expect(v7PredictionService.predict).not.toHaveBeenCalled();
  await press('Pilih struktur Ethanol, C2H6O');
  await act(async () => button('Prediksi aroma').props.onPress());
  expect(v7PredictionService.predict).toHaveBeenCalledWith(expect.objectContaining({
    smiles: 'CCO', catalogName: 'Ethanol',
  }));
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(HISTORY_KEY, expect.any(String));
});

test('editing a resolved query clears the selection and blocks stale prediction', async () => {
  v7PredictionService.resolve.mockResolvedValue([
    { name: 'Ethanol', smiles: 'CCO', molecular_formula: 'C2H6O', cid: '702', in_catalog: true, prediction_supported: true },
  ]);
  await press('Cari nama atau rumus');
  const input = tree.root.findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Nama atau rumus senyawa');
  await act(async () => input.props.onChangeText('Ethanol'));
  await act(async () => button('Cari struktur').props.onPress());
  await press('Pilih struktur Ethanol, C2H6O');
  await act(async () => input.props.onChangeText('Vanillin'));
  await act(async () => button('Prediksi aroma').props.onPress());
  expect(v7PredictionService.predict).not.toHaveBeenCalled();
});

test('common non-aroma input can be identified but cannot be predicted', async () => {
  v7PredictionService.resolve.mockResolvedValue([
    { name: 'Karbon dioksida (CO2)', smiles: 'O=C=O', molecular_formula: 'CO2', cid: null,
      in_catalog: false, prediction_supported: false },
  ]);
  await press('Cari nama atau rumus');
  await act(async () => {
    tree.root.findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Nama atau rumus senyawa')
      .props.onChangeText('CO2');
  });
  await act(async () => button('Cari struktur').props.onPress());
  await press('Pilih struktur Karbon dioksida (CO2), CO2');
  expect(button('Simpan senyawa ke Koleksi')).toBeUndefined();
  await act(async () => button('Prediksi aroma').props.onPress());
  expect(v7PredictionService.predict).not.toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain('di luar cakupan prediksi aroma');
});
test('saved compound can be edited and analyzed again from Koleksi', async () => {
  await press('Pilih senyawa dari katalog');
  await press('Pilih Vanillin');
  await act(async () => button('Simpan senyawa ke Koleksi').props.onPress());
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, expect.any(String));
  await pressTab('Koleksi');
  await press('Ubah Vanillin');
  await act(async () => {
    tree.root.findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Ubah nama senyawa')
      .props.onChangeText('Vanillin stok A');
  });
  await act(async () => button('Simpan perubahan').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Vanillin stok A');
  await act(async () => button('Analisis ulang').props.onPress());
  expect(v7PredictionService.predict).toHaveBeenCalledWith(expect.objectContaining({
    smiles: catalog.compounds.find(item => item.name === 'Vanillin').smiles,
    sampleName: 'Vanillin stok A',
  }));
  const stored = JSON.parse(AsyncStorage.setItem.mock.calls
    .find(([key]) => key === HISTORY_KEY)[1]);
  expect(stored.records).toHaveLength(1);
  expect(JSON.stringify(tree.toJSON())).toContain('Tercatat di Riwayat');
});
test('first launch shows tutorial and skipping persists it', async () => {
  await act(async () => tree.unmount());
  AsyncStorage.getItem.mockResolvedValue(null);
  await act(async () => { tree = TestRenderer.create(<App />); });
  await finishSplash();
  await act(async () => jest.advanceTimersByTime(1000));
  expect(JSON.stringify(tree.toJSON())).toContain('PANDUAN SINGKAT');
  await press('Langkah berikutnya');
  expect(JSON.stringify(tree.toJSON())).toContain('Atau ketik nama / rumus');
  await press('Lewati tutorial');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(TUTORIAL_KEY, 'seen');
});
test('automatic history write failure is visible and can be retried without rerunning ML', async () => {
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Penyimpanan penuh'));
  await showResult();
  expect(JSON.stringify(tree.toJSON())).toContain('Penyimpanan penuh');
  expect(button('Coba simpan ke Riwayat')).toBeDefined();
  await act(async () => {
    await button('Coba simpan ke Riwayat').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Tercatat di Riwayat');
  expect(v7PredictionService.predict).toHaveBeenCalledTimes(1);
});
test('stored results reload, duplicate saves are idempotent, and failed removal preserves history', async () => {
  await showResult();
  const raw = AsyncStorage.setItem.mock.calls.find(([key]) => key === HISTORY_KEY)[1];
  const result = JSON.parse(raw).records[0];
  let state;
  function Probe() {
    state = useLab();
    return null;
  }
  await act(async () => {
    tree.unmount();
  });
  AsyncStorage.getItem.mockImplementation(async key =>
    key === HISTORY_KEY ? raw : key === TUTORIAL_KEY ? 'seen' : null);
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
  AsyncStorage.getItem.mockImplementation(async key => {
    if (key === HISTORY_KEY) { throw new Error('read error'); }
    return key === TUTORIAL_KEY ? 'seen' : null;
  });
  await act(async () => {
    tree = TestRenderer.create(<App />);
  });
  await finishSplash();
  await showResult();
  expect(button('Coba simpan ke Riwayat').props.disabled).toBe(true);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  AsyncStorage.getItem.mockImplementation(async key =>
    key === TUTORIAL_KEY ? 'seen' : null);
  await act(async () => {
    await button('Muat ulang riwayat').props.onPress();
  });
  expect(button('Coba simpan ke Riwayat').props.disabled).toBe(false);
});
test('API failure does not navigate to a fabricated result', async () => {
  v7PredictionService.predict.mockRejectedValueOnce(new Error('Struktur SMILES tidak valid.'));
  await press('Input SMILES lanjutan');
  await act(async () => {
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'SMILES molekul')
      .props.onChangeText('CCN');
  });
  await act(async () => {
    await button('Prediksi aroma').props.onPress();
  });
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => String(node.props.children).includes('Struktur SMILES tidak valid.')),
  ).toBe(true);
  expect(
    tree.root
      .findAllByType(Button)
      .some(node => node.props.label === 'Coba simpan ke Riwayat'),
  ).toBe(false);
  expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(HISTORY_KEY, expect.any(String));
});
