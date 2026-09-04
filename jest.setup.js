jest.mock('@react-native-async-storage/async-storage', () => {
  let data = new Map();
  return {getItem: jest.fn(async key => data.get(key) ?? null),
    setItem: jest.fn(async (key, value) => { data.set(key, value); }),
    clear: jest.fn(async () => data.clear())};
});
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/documents',
  mkdir: jest.fn(async () => undefined), exists: jest.fn(async () => false),
  hash: jest.fn(async path => {
    const manifest = require('./src/assets/metadata/model_manifest.json');
    return manifest.models.find(m => path.endsWith(m.filename) || path.endsWith(m.filename + '.tmp'))?.sha256;
  }),
  copyFileAssets: jest.fn(async () => undefined), moveFile: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
}));
jest.mock('onnxruntime-react-native', () => ({
  Tensor: class { constructor(type, data, dims) { Object.assign(this, {type, data, dims}); } },
  InferenceSession: {create: jest.fn(async path => {
    const manifest = require('./src/assets/metadata/model_manifest.json');
    const item = manifest.models.find(m => path.endsWith(m.filename));
    return {inputNames: [item.input_name], outputNames: [item.probability_output],
      run: jest.fn(async () => ({[item.probability_output]: {data: new Float32Array([.1, .9])}})),
      release: jest.fn(async () => undefined)};
  })},
}));
jest.mock('axios');
