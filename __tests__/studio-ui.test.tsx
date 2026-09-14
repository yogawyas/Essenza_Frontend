import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/storage/AppProvider';
import { createInitialState, LayeringRecipe } from '../src/domain/models';
import { ENGINE_VERSION, mockPredictor } from '../src/domain/studio';
import { StudioEditorScreen } from '../src/screens/StudioEditorScreen';
import { RecipeScreen } from '../src/screens/RecipeScreen';
import { ShelfScreen } from '../src/screens/ShelfScreen';
import { EditListScreen } from '../src/screens/EditListScreen';
import { Button, Chip } from '../src/ui/components';

const mockNav = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  popTo: jest.fn(),
  dispatch: jest.fn(),
};
let mockParams: object | undefined;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: mockParams }),
  usePreventRemove: jest.fn(),
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, [callback]);
  },
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
const tap = async (label: string) => {
  await act(async () => {
    renderer.root
      .findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress();
  });
};
const input = async (label: string, value: string) => {
  await act(async () => {
    renderer.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value);
  });
};
const persisted = () => {
  const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
  return JSON.parse(calls[calls.length - 1][1]);
};
const recipe: LayeringRecipe = {
  id: 'existing',
  title: 'Original',
  note: 'Keep me',
  fragranceA: 'ck-one',
  fragranceB: 'light-blue',
  dominance: 'balanced',
  engineVersion: ENGINE_VERSION,
  updatedAt: '2025-01-01T00:00:00.000Z',
};
beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  mockParams = undefined;
});
afterEach(async () => {
  if (renderer) {
    await act(async () => renderer.unmount());
  }
  jest.restoreAllMocks();
});

test('Studio selects distinct perfumes, predicts, saves and links to the recipe shelf', async () => {
  await mount(<StudioEditorScreen />);
  expect(button('Simulasikan kombinasi').props.disabled).toBe(true);
  await tap('Pilih parfum A');
  await press('CK One · Katalog demo');
  await tap('Pilih parfum B');
  expect(button('CK One · Katalog demo')).toBeUndefined();
  await press('Light Blue · Katalog demo');
  await press('Simulasikan kombinasi');
  await input('Nama resep', 'QA Citrus duet');
  await press('Simpan resep');
  expect(persisted().recipes).toEqual([
    expect.objectContaining({
      title: 'QA Citrus duet',
      fragranceA: 'ck-one',
      fragranceB: 'light-blue',
      engineVersion: ENGINE_VERSION,
    }),
  ]);
  expect(persisted().studioDraft).toBeNull();
  await press('Lihat di My Shelf');
  expect(mockNav.popTo).toHaveBeenCalledWith(
    'Home',
    expect.objectContaining({
      screen: 'Shelf',
      params: expect.objectContaining({
        screen: 'ShelfHome',
        pop: true,
        params: expect.objectContaining({ section: 'recipes' }),
      }),
    }),
  );
});
test('a partial draft persists and resumes with the original selection', async () => {
  await mount(<StudioEditorScreen />);
  await tap('Pilih parfum A');
  await press('CK One · Katalog demo');
  await press('Simpan draft & keluar');
  const state = persisted();
  expect(state.studioDraft.fragranceA).toBe('ck-one');
  expect(state.studioDraft.fragranceB).toBeNull();
  expect(mockNav.goBack).toHaveBeenCalled();
  await act(async () => renderer.unmount());
  mockParams = { resume: true };
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(state));
  await mount(<StudioEditorScreen />);
  expect(JSON.stringify(renderer.toJSON())).toContain('CK One');
  await tap('Pilih parfum B');
  await press('Light Blue · Katalog demo');
  await press('Simulasikan kombinasi');
  expect(button('Simpan resep')).toBeDefined();
});
test.each([{ recipeId: 'existing' }, { remixId: 'existing' }])(
  'editing/remixing preserves the correct recipe identity: %o',
  async params => {
    mockParams = params;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ ...createInitialState(), recipes: [recipe] }),
    );
    await mount(<StudioEditorScreen />);
    await press('Simulasikan kombinasi');
    await input('Nama resep', 'My changed recipe');
    await press(
      'recipeId' in params ? 'Simpan perubahan resep' : 'Simpan resep',
    );
    const saved = persisted().recipes as LayeringRecipe[];
    if ('recipeId' in params) {
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({
        id: 'existing',
        title: 'My changed recipe',
      });
    } else {
      expect(saved).toHaveLength(2);
      expect(saved[0].id).not.toBe('existing');
      expect(saved[1]).toEqual(recipe);
    }
  },
);
test('prediction failures retain inputs and allow retry without saving fake results', async () => {
  mockParams = { recipeId: 'existing' };
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify({ ...createInitialState(), recipes: [recipe] }),
  );
  jest
    .spyOn(mockPredictor, 'predict')
    .mockRejectedValueOnce(new Error('QA prediction unavailable'));
  await mount(<StudioEditorScreen />);
  await press('Simulasikan kombinasi');
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'QA prediction unavailable',
  );
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  expect(button('Simulasikan kombinasi').props.disabled).toBe(false);
  await press('Simulasikan kombinasi');
  expect(button('Simpan perubahan resep')).toBeDefined();
});
test('a saved recipe opens after reload with demo labeling and edit/remix actions', async () => {
  mockParams = { id: 'existing' };
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify({ ...createInitialState(), recipes: [recipe] }),
  );
  await mount(<RecipeScreen />);
  expect(JSON.stringify(renderer.toJSON())).toContain('SIMULASI DEMO');
  expect(button('Edit resep')).toBeDefined();
  expect(button('Remix sebagai resep baru')).toBeDefined();
});
test('Shelf consumes explicit target filters and selects the intended category', async () => {
  mockParams = {
    section: 'perfumes',
    status: 'want',
    highlightId: 'ck-one',
    requestId: 'qa',
  };
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    JSON.stringify({
      ...createInitialState(),
      shelf: [{ fragranceId: 'ck-one', status: 'want', format: 'Sample' }],
    }),
  );
  await mount(<ShelfScreen />);
  expect(
    renderer.root
      .findAllByType(Chip)
      .find(chip => chip.props.label === 'Wishlist')!.props.selected,
  ).toBe(true);
  expect(JSON.stringify(renderer.toJSON())).toContain('CK One');
  expect(mockNav.setParams).toHaveBeenCalledWith({
    section: undefined,
    status: undefined,
    highlightId: undefined,
    requestId: undefined,
  });
});
test('new private scentlists lead to My Shelf instead of public Explore', async () => {
  await mount(<EditListScreen />);
  await input('Judul scentlist', 'QA private list');
  await press('Simpan scentlist');
  expect(persisted().lists[0].visibility).toBe('private');
  expect(mockNav.popTo).toHaveBeenCalledWith(
    'Home',
    expect.objectContaining({
      screen: 'Shelf',
      params: expect.objectContaining({
        params: expect.objectContaining({ section: 'lists' }),
      }),
    }),
  );
});
