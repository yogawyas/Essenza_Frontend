import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Switch, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/storage/AppProvider';
import { createInitialState } from '../src/domain/models';
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
let mockParams;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNav,
  useRoute: () => ({
    params: mockParams,
  }),
  usePreventRemove: jest.fn(),
  useFocusEffect: callback => {
    require('react').useEffect(callback, [callback]);
  },
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
const tap = async label => {
  await act(async () => {
    await renderer.root
      .findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress();
  });
};
const input = async (label, value) => {
  await act(async () => {
    renderer.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)
      .props.onChangeText(value);
  });
};
const persisted = () => {
  const calls = AsyncStorage.setItem.mock.calls;
  return JSON.parse(calls[calls.length - 1][1]);
};
const recipe = {
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
  AsyncStorage.getItem.mockResolvedValue(null);
  AsyncStorage.setItem.mockResolvedValue(undefined);
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
  expect(button('Preview Combination').props.disabled).toBe(true);
  await tap('Choose perfume A');
  await press('CK One · Catalog');
  await tap('Choose perfume B');
  expect(button('CK One · Catalog')).toBeUndefined();
  await press('Light Blue · Catalog');
  await press('Preview Combination');
  await input('Recipe Name', 'QA Citrus duet');
  await press('Save Recipe');
  expect(persisted().recipes).toEqual([
    expect.objectContaining({
      title: 'QA Citrus duet',
      fragranceA: 'ck-one',
      fragranceB: 'light-blue',
      engineVersion: ENGINE_VERSION,
    }),
  ]);
  expect(persisted().studioDraft).toBeNull();
  await press('View in MyShelf');
  expect(mockNav.popTo).toHaveBeenCalledWith(
    'Home',
    expect.objectContaining({
      screen: 'Shelf',
      params: expect.objectContaining({
        screen: 'ShelfHome',
        pop: true,
        params: expect.objectContaining({
          section: 'recipes',
        }),
      }),
    }),
  );
});
test('a partial draft persists and resumes with the original selection', async () => {
  await mount(<StudioEditorScreen />);
  await tap('Choose perfume A');
  await press('CK One · Catalog');
  await press('Save Draft and Exit');
  const state = persisted();
  expect(state.studioDraft.fragranceA).toBe('ck-one');
  expect(state.studioDraft.fragranceB).toBeNull();
  expect(mockNav.goBack).toHaveBeenCalled();
  await act(async () => renderer.unmount());
  mockParams = {
    resume: true,
  };
  AsyncStorage.getItem.mockResolvedValue(JSON.stringify(state));
  await mount(<StudioEditorScreen />);
  expect(JSON.stringify(renderer.toJSON())).toContain('CK One');
  await tap('Choose perfume B');
  await press('Light Blue · Catalog');
  await press('Preview Combination');
  expect(button('Save Recipe')).toBeDefined();
});
test.each([
  {
    recipeId: 'existing',
  },
  {
    remixId: 'existing',
  },
])(
  'editing/remixing preserves the correct recipe identity: %o',
  async params => {
    mockParams = params;
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        ...createInitialState(),
        recipes: [recipe],
      }),
    );
    await mount(<StudioEditorScreen />);
    await press('Preview Combination');
    await input('Recipe Name', 'My changed recipe');
    await press('recipeId' in params ? 'Save Recipe Changes' : 'Save Recipe');
    const saved = persisted().recipes;
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
  mockParams = {
    recipeId: 'existing',
  };
  AsyncStorage.getItem.mockResolvedValue(
    JSON.stringify({
      ...createInitialState(),
      recipes: [recipe],
    }),
  );
  jest
    .spyOn(mockPredictor, 'predict')
    .mockRejectedValueOnce(new Error('QA prediction unavailable'));
  await mount(<StudioEditorScreen />);
  await press('Preview Combination');
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'QA prediction unavailable',
  );
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  expect(button('Preview Combination').props.disabled).toBe(false);
  await press('Preview Combination');
  expect(button('Save Recipe Changes')).toBeDefined();
});
test('a saved recipe opens after reload with a layering preview and edit/remix actions', async () => {
  mockParams = {
    id: 'existing',
  };
  AsyncStorage.getItem.mockResolvedValue(
    JSON.stringify({
      ...createInitialState(),
      recipes: [recipe],
    }),
  );
  await mount(<RecipeScreen />);
  expect(JSON.stringify(renderer.toJSON())).toContain('LAYERING PREVIEW');
  expect(button('Edit Recipe')).toBeDefined();
  expect(button('Remix as a New Recipe')).toBeDefined();
});
test('Shelf consumes explicit target filters and selects the intended category', async () => {
  mockParams = {
    section: 'perfumes',
    status: 'want',
    highlightId: 'ck-one',
    requestId: 'qa',
  };
  AsyncStorage.getItem.mockResolvedValue(
    JSON.stringify({
      ...createInitialState(),
      shelf: [
        {
          fragranceId: 'ck-one',
          status: 'want',
          format: 'Sample',
        },
      ],
    }),
  );
  await mount(<ShelfScreen />);
  expect(
    renderer.root
      .findAllByType(Chip)
      .find(chip => chip.props.label === 'Wishlist').props.selected,
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
  const privacy = renderer.root.findByType(Switch);
  expect(privacy.props.value).toBe(false);
  await input('Scentlist Name', 'QA private list');
  await act(async () => privacy.props.onValueChange(true));
  await tap('Save Scentlist');
  expect(persisted().lists[0].visibility).toBe('private');
  expect(mockNav.navigate).toHaveBeenCalledWith(
    'Home',
    expect.objectContaining({
      screen: 'Shelf',
      params: expect.objectContaining({
        params: expect.objectContaining({
          section: 'lists',
        }),
      }),
    }),
  );
});
