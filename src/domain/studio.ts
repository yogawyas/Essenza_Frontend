import {
  ACCORDS,
  Accord,
  Dominance,
  LayeringRecipe,
  StudioDraft,
  StudioInput,
} from './models';
import { fragranceById } from './catalog';

export const ENGINE_VERSION = 'mock-accord-v1' as const;
export const DOMINANCE_LABELS: Record<Dominance, string> = {
  a: 'A dominant',
  balanced: 'Balanced',
  b: 'B dominant',
};
const weights: Record<Dominance, number> = { a: 0.7, balanced: 0.5, b: 0.3 };
export interface StudioPrediction {
  source: 'demo';
  engineVersion: typeof ENGINE_VERSION;
  summary: string;
  profile: { accord: Accord; intensity: number }[];
}
export interface PredictionService {
  predict(input: StudioInput): Promise<StudioPrediction>;
}

export function validateDraft(draft: StudioDraft) {
  if (
    !draft ||
    typeof draft.id !== 'string' ||
    !draft.id.trim() ||
    typeof draft.title !== 'string' ||
    draft.title.length > 60 ||
    typeof draft.note !== 'string' ||
    draft.note.length > 280 ||
    !Object.hasOwn(weights, draft.dominance) ||
    (draft.recipeId !== undefined &&
      (typeof draft.recipeId !== 'string' || !draft.recipeId.trim()))
  ) {
    throw new Error('Invalid Studio draft.');
  }
  for (const id of [draft.fragranceA, draft.fragranceB]) {
    if (id !== null && (typeof id !== 'string' || !fragranceById(id))) {
      throw new Error('Studio fragrance not found.');
    }
  }
  if (draft.fragranceA && draft.fragranceA === draft.fragranceB) {
    throw new Error('Select two different fragrances.');
  }
}
export function validateRecipe(recipe: LayeringRecipe) {
  validateDraft(recipe);
  if (
    !recipe.fragranceA ||
    !recipe.fragranceB ||
    !recipe.title.trim() ||
    recipe.engineVersion !== ENGINE_VERSION ||
    !Number.isFinite(Date.parse(recipe.updatedAt))
  ) {
    throw new Error('Complete two fragrances and a recipe name.');
  }
}

// Ordinal catalog accords are illustrative inputs, not measured chemical composition.
export function simulate(input: StudioInput): StudioPrediction {
  validateDraft({ ...input, id: 'prediction', title: '', note: '' });
  const a = fragranceById(input.fragranceA);
  const b = fragranceById(input.fragranceB);
  if (!a || !b) {
    throw new Error('Select fragrance A and B first.');
  }
  const vector = (accords: Accord[], accord: Accord) => {
    const index = accords.indexOf(accord);
    const total = (accords.length * (accords.length + 1)) / 2;
    return index < 0 ? 0 : (accords.length - index) / total;
  };
  const weight = weights[input.dominance];
  const profile = ACCORDS.map(accord => ({
    accord,
    intensity: Number(
      (
        weight * vector(a.accords, accord) +
        (1 - weight) * vector(b.accords, accord)
      ).toFixed(6),
    ),
  })).sort(
    (x, y) => y.intensity - x.intensity || x.accord.localeCompare(y.accord),
  );
  const top = profile
    .filter(item => item.intensity > 0)
    .slice(0, 3)
    .map(item => item.accord);
  return {
    source: 'demo',
    engineVersion: ENGINE_VERSION,
    profile,
    summary:
      top.length > 1
        ? top[0] +
          ' dominant, with hints of ' +
          top.slice(1).join(' and ') +
          '.'
        : top[0] + ' dominant.',
  };
}
export const mockPredictor: PredictionService = {
  predict: async input => simulate(input),
};
