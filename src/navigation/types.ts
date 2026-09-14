import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Occasion, ShelfStatus } from '../domain/models';

export type ShelfSection = 'perfumes' | 'lists' | 'recipes' | 'journal';
export type ShelfTarget = {
  section?: ShelfSection;
  status?: ShelfStatus | 'favorites';
  highlightId?: string;
  requestId?: string;
};
export type FeatureParams = {
  TodayHome: undefined;
  DiscoverHome: undefined;
  StudioHome: undefined;
  ShelfHome: ShelfTarget | undefined;
  Fragrance: { id: string };
  List: { id: string };
  Scentlists:
    | { filter?: 'Explore' | 'Milikku' | 'Disimpan' | 'Following' }
    | undefined;
  Recipe: { id: string };
  Journal: undefined;
};
export type TabParams = {
  Today: NavigatorScreenParams<FeatureParams> | undefined;
  Discover: NavigatorScreenParams<FeatureParams> | undefined;
  Studio: NavigatorScreenParams<FeatureParams> | undefined;
  Shelf: NavigatorScreenParams<FeatureParams> | undefined;
};
export type RootParams = FeatureParams & {
  Home: NavigatorScreenParams<TabParams> | undefined;
  EditList: { id?: string } | undefined;
  StudioEditor:
    | { recipeId?: string; remixId?: string; resume?: boolean }
    | undefined;
  Wear: {
    fragranceId: string;
    logId?: string;
    occasion?: Occasion;
    quick?: boolean;
  };
  Profile: undefined;
};
export type AppNavigation = NativeStackNavigationProp<RootParams>;
export const useAppNavigation = () => useNavigation<AppNavigation>();

export function shelfDestination(
  target: ShelfTarget = {},
): NavigatorScreenParams<TabParams> {
  return {
    screen: 'Shelf',
    params: { screen: 'ShelfHome', params: target, pop: true },
  };
}
export function openShelf(nav: AppNavigation, target: ShelfTarget = {}) {
  nav.navigate(
    'Home',
    shelfDestination({ ...target, requestId: String(Date.now()) }),
  );
}
