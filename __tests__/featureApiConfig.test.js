import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadFeatureApiUrl,
  saveFeatureApiUrl,
  validateFeatureApiUrl,
} from '../src/services/featureApiConfig';

test('accepts an HTTPS API and persists it independently from lab history', async () => {
  AsyncStorage.setItem.mockResolvedValue(undefined);
  AsyncStorage.getItem.mockResolvedValueOnce(null).mockResolvedValueOnce('https://api.example.com');
  expect(await saveFeatureApiUrl('https://api.example.com/')).toBe('https://api.example.com');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    '@essenza/b2b-feature-api-v1', 'https://api.example.com');
  expect(await loadFeatureApiUrl()).toBe('http://127.0.0.1:8000');
  expect(await loadFeatureApiUrl()).toBe('https://api.example.com');
});

test('rejects HTTP remote URLs and unexpected API paths', () => {
  expect(() => validateFeatureApiUrl('http://example.com')).toThrow();
  expect(() => validateFeatureApiUrl('https://example.com/fingerprint')).toThrow();
  expect(() => validateFeatureApiUrl('https://user:pass@example.com')).toThrow();
});
