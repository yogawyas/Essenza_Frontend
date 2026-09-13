import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TabParams = {
  Today: undefined;
  Discover: undefined;
  Scentlists: undefined;
  Shelf: undefined;
};
export type RootParams = {
  Home: NavigatorScreenParams<TabParams> | undefined;
  Fragrance: { id: string };
  List: { id: string };
  EditList: { id?: string } | undefined;
  Wear: { fragranceId: string; logId?: string };
  Journal: undefined;
  Profile: undefined;
};
export const useAppNavigation = () =>
  useNavigation<NativeStackNavigationProp<RootParams>>();
