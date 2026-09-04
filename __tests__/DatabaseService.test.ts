import AsyncStorage from '@react-native-async-storage/async-storage';
import {DatabaseService, CATALOG_LABELS} from '../src/services/DatabaseService';
const key = '@essenza_user_perfumes';
const item = {name: 'My perfume', accords: {floral: .8}, top_accords: '', mode: 'simple' as const};
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });

test('catalog is valid and filters use its own taxonomy', async () => {
  await DatabaseService.init();
  expect(CATALOG_LABELS).not.toContain('aldehydic');
  await expect(DatabaseService.getPerfumesByLabels(['aldehydic'])).rejects.toThrow('Invalid catalog');
  const once = await DatabaseService.getPerfumesByLabels(['floral'],0,30);
  const twice = await DatabaseService.getPerfumesByLabels(['floral','floral'],0,30);
  expect(twice).toEqual(once);
  expect(once[0].matchScore).toBe(once[0].accords.floral || 0);
  expect(await DatabaseService.searchPerfumes('')).toEqual([]);
});
test('concurrent creates retain every record and unique ids', async () => {
  const ids = await Promise.all(Array.from({length: 8},() => DatabaseService.createUserPerfume(item)));
  expect(new Set(ids).size).toBe(8);
  expect(await DatabaseService.getAllUserPerfumes()).toHaveLength(8);
  const stored = JSON.parse((await AsyncStorage.getItem(key))!);
  expect(stored.version).toBe(1);
});
test('updates and deletes serialize without lost writes', async () => {
  const a = await DatabaseService.createUserPerfume(item), b = await DatabaseService.createUserPerfume(item);
  await Promise.all([DatabaseService.updateUserPerfume(a,{name:'Updated'}),DatabaseService.deleteUserPerfume(b)]);
  expect((await DatabaseService.getAllUserPerfumes()).map(p => p.name)).toEqual(['Updated']);
});
test('corrupt storage is surfaced and preserved', async () => {
  await AsyncStorage.setItem(key,'broken');
  await expect(DatabaseService.createUserPerfume(item)).rejects.toThrow('corrupt');
  expect(await AsyncStorage.getItem(key)).toBe('broken');
});
test('legacy arrays migrate only on successful mutation and preserve unknown custom labels', async () => {
  await AsyncStorage.setItem(key,JSON.stringify([{...item,id:'old',accords:{legacy_label:.5}}]));
  expect(await DatabaseService.getAllUserPerfumes()).toHaveLength(1);
  expect(Array.isArray(JSON.parse((await AsyncStorage.getItem(key))!))).toBe(true);
  await DatabaseService.updateUserPerfume('old',{name:'Migrated'});
  expect(JSON.parse((await AsyncStorage.getItem(key))!).items[0].accords).toEqual({legacy_label:.5});
});
