import axios from 'axios';
import RNFS from 'react-native-fs';
import {InferenceSession} from 'onnxruntime-react-native';
import {InferenceService, MODEL_INFO, validateFeatures, parseGradioQueueResult} from '../src/services/InferenceService';
const features = () => new Array(2053).fill(0);
beforeEach(async () => { await InferenceService.releaseAll(); jest.clearAllMocks(); });
afterEach(async () => { jest.restoreAllMocks(); await InferenceService.releaseAll(); });

test('rejects wrong dimensions, fractional bits and nonfinite descriptors', () => {
  expect(() => validateFeatures([1,2])).toThrow();
  let fp=features(); fp[0]=.5; expect(() => validateFeatures(fp)).toThrow();
  fp=features(); fp[2050]=Infinity; expect(() => validateFeatures(fp)).toThrow();
});
test('SSE handles heartbeats and structured completed data', () => {
  expect(parseGradioQueueResult('event: heartbeat\ndata: null\n\nevent: complete\ndata: [{"status":"ok"}]\n\n')).toEqual({status:'ok'});
  expect(() => parseGradioQueueResult('event: error\ndata: null\n\n')).toThrow();
  expect(() => parseGradioQueueResult('event: complete\ndata: invalid\n\n')).toThrow();
});
test('version mismatch prevents incompatible features reaching models', async () => {
  jest.mocked(axios.post).mockResolvedValue({data:{event_id:'job'}});
  jest.mocked(axios.get).mockResolvedValue({data:'event: complete\ndata: [{"feature_schema_id":"wrong"}]\n\n'});
  await expect(InferenceService.getFingerprint('CC')).rejects.toMatchObject({code:'FEATURE_SCHEMA_MISMATCH'});
  expect(InferenceSession.create).not.toHaveBeenCalled();
});
test('all models use versioned cache and results require every model', async () => {
  const result=await InferenceService.predict(features());
  expect(result).toHaveLength(MODEL_INFO.models.length);
  expect(InferenceSession.create).toHaveBeenCalledTimes(MODEL_INFO.models.length);
  expect(jest.mocked(RNFS.mkdir).mock.calls[0][0]).toContain(MODEL_INFO.bundle_id);
  await InferenceService.releaseAll();
  jest.mocked(InferenceSession.create).mockRejectedValueOnce(new Error('native failure'));
  await expect(InferenceService.predict(features())).rejects.toMatchObject({code:'MODEL_ERROR'});
});
test('corrupt bundled model fails before session creation', async () => {
  jest.mocked(RNFS.hash).mockResolvedValueOnce('corrupt');
  await expect(InferenceService.predict(features())).rejects.toMatchObject({code:'MODEL_ERROR'});
  expect(InferenceSession.create).not.toHaveBeenCalled();
});
test('pre-cancelled inference does not load any model', async () => {
  const controller=new AbortController();controller.abort();
  await expect(InferenceService.predict(features(),controller.signal)).rejects.toMatchObject({code:'CANCELLED'});
  expect(InferenceSession.create).not.toHaveBeenCalled();
});
