import { useNavigation } from '@react-navigation/native';
export const useAppNavigation = () => useNavigation();
export function shelfDestination(target = {}) {
  return {
    screen: 'Shelf',
    params: {
      screen: 'ShelfHome',
      params: target,
      pop: true,
    },
  };
}
export function openShelf(nav, target = {}) {
  nav.navigate(
    'Home',
    shelfDestination({
      ...target,
      requestId: String(Date.now()),
    }),
  );
}
