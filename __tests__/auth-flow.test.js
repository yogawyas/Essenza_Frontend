import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  Alert,
  Animated,
  BackHandler,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntryFlow } from '../src/navigation/EntryFlow';
import { AuthScreen } from '../src/screens/AuthScreen';
import { SplashScreen } from '../src/screens/SplashScreen';
import { LaunchSplashScreen } from '../src/screens/LaunchSplashScreen';
import { useSession } from '../src/storage/SessionContext';
import { DesignAction } from '../src/ui/design';
import {
  AUTH_SESSION_KEY,
  AuthRepository,
  DUMMY_ACCOUNT,
  INTRO_SEEN_KEY,
} from '../src/storage/auth';

const mockDispatch = jest.fn(async () => true);
jest.mock('../src/storage/AppProvider', () => ({
  useApp: () => ({
    state: {
      profile: {
        id: 'local-profile',
        name: '',
        bio: '',
        likes: [],
        avoids: [],
      },
    },
    dispatch: mockDispatch,
  }),
}));

let stored;
let renderer;
beforeEach(() => {
  stored = new Map();
  AsyncStorage.getItem.mockImplementation(async key => stored.get(key) ?? null);
  AsyncStorage.setItem.mockImplementation(async (key, value) => {
    stored.set(key, value);
  });
  AsyncStorage.removeItem.mockImplementation(async key => {
    stored.delete(key);
  });
  mockDispatch.mockClear();
  // Advance native transitions deterministically without starting an app.
  jest.spyOn(Animated, 'timing').mockImplementation((value, config) => ({
    start: callback => {
      value.setValue(config.toValue);
      callback?.({ finished: true });
    },
    stop: jest.fn(),
    reset: jest.fn(),
  }));
});
afterEach(async () => {
  if (renderer) {
    await act(async () => renderer.unmount());
    renderer = undefined;
  }
  jest.restoreAllMocks();
});

function SessionProbe() {
  const { signOut } = useSession();
  return (
    <Text testID="session-sign-out" onPress={signOut}>
      Log Out
    </Text>
  );
}

async function openApp({ showSignOut = false, ...props } = {}) {
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <EntryFlow {...props}>
        <Text>Home aplikasi</Text>
        {showSignOut ? <SessionProbe /> : null}
      </EntryFlow>,
    );
  });
}

function activeAuthScreen() {
  const page = ['login', 'register']
    .map(mode => renderer.root.findByProps({ testID: `auth-${mode}-page` }))
    .find(node => node.props.pointerEvents === 'auto');
  return page.findByType(AuthScreen);
}

async function openLogin(props = {}) {
  await openApp(props);
  await act(async () =>
    renderer.root.findByType(SplashScreen).props.onContinue(),
  );
}

test('design splash remains part of startup until login succeeds, even after a previous swipe', async () => {
  await openApp();
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(1);
  await act(async () =>
    renderer.root.findByType(SplashScreen).props.onContinue(),
  );
  expect(stored.get(INTRO_SEEN_KEY)).toBe('true');
  expect(activeAuthScreen().props.mode).toBe('login');
  await act(async () => renderer.unmount());
  await openApp();
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(1);
  expect(
    renderer.root.findByType(SplashScreen).props.progress.__getValue(),
  ).toBe(0);
});

test('dummy login persists a session without a password and restores home on restart', async () => {
  stored.set(INTRO_SEEN_KEY, 'true');
  await openLogin();
  await act(async () =>
    activeAuthScreen().props.onSubmit({ ...DUMMY_ACCOUNT, confirmation: '' }),
  );
  expect(renderer.root.findAllByType(AuthScreen)).toHaveLength(0);
  const session = JSON.parse(stored.get(AUTH_SESSION_KEY));
  expect(session).toEqual({
    mode: 'dummy',
    email: DUMMY_ACCOUNT.email,
    name: DUMMY_ACCOUNT.name,
  });
  expect(stored.get(AUTH_SESSION_KEY)).not.toContain(DUMMY_ACCOUNT.password);
  expect(mockDispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'profile', onboard: true }),
  );
  await act(async () => renderer.unmount());
  await openApp();
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(0);
  expect(renderer.root.findAllByType(AuthScreen)).toHaveLength(0);
  expect(renderer.root.findByType(Text).props.children).toBe('Home aplikasi');
});

test.each(['on-screen Back', 'Android Back'])(
  'login after logout returns to the intro with %s',
  async backControl => {
    stored.set(
      AUTH_SESSION_KEY,
      JSON.stringify({
        mode: 'dummy',
        email: DUMMY_ACCOUNT.email,
        name: DUMMY_ACCOUNT.name,
      }),
    );
    const backListener = jest.spyOn(BackHandler, 'addEventListener');
    const exitApp = jest.spyOn(BackHandler, 'exitApp');
    await openApp({ showSignOut: true });
    await act(async () =>
      renderer.root.findByProps({ testID: 'session-sign-out' }).props.onPress(),
    );
    expect(stored.has(AUTH_SESSION_KEY)).toBe(false);
    expect(activeAuthScreen().props.mode).toBe('login');

    await act(async () => {
      if (backControl === 'on-screen Back') {
        activeAuthScreen().findByType(DesignAction).props.onPress();
      } else {
        const [, handleBack] = backListener.mock.calls.at(-1);
        expect(handleBack()).toBe(true);
      }
    });

    expect(exitApp).not.toHaveBeenCalled();
    const splash = renderer.root.findByType(SplashScreen);
    expect(splash.props.progress.__getValue()).toBe(0);
    await act(async () => splash.props.onContinue());
    expect(activeAuthScreen().props.mode).toBe('login');
  },
);

test('wrong login and mismatched registration passwords do not create sessions', async () => {
  const repository = new AuthRepository();
  expect(() => repository.signIn(DUMMY_ACCOUNT.email, 'wrong')).toThrow(
    'Incorrect email or password.',
  );
  expect(() =>
    repository.register(
      'Marvel',
      'marvel@example.com',
      'Password123!',
      'different',
    ),
  ).toThrow('Passwords do not match.');
  expect(stored.has(AUTH_SESSION_KEY)).toBe(false);
});

test('registration and its back button connect to login; valid dummy registration opens home', async () => {
  stored.set(INTRO_SEEN_KEY, 'true');
  await openLogin();
  await act(async () => activeAuthScreen().props.onSwitchMode());
  expect(activeAuthScreen().props.mode).toBe('register');
  await act(async () => activeAuthScreen().props.onBack());
  expect(activeAuthScreen().props.mode).toBe('login');
  await act(async () => activeAuthScreen().props.onSwitchMode());
  await act(async () =>
    activeAuthScreen().props.onSubmit({
      name: 'Marvel',
      email: 'marvel@example.com',
      password: 'Password123!',
      confirmation: 'Password123!',
    }),
  );
  expect(JSON.parse(stored.get(AUTH_SESSION_KEY)).name).toBe('Marvel');
  expect(renderer.root.findAllByType(AuthScreen)).toHaveLength(0);
});

test('form inputs submit entered credentials and the eye toggles password visibility', async () => {
  const onSubmit = jest.fn(async () => {});
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthScreen
        mode="login"
        onBack={jest.fn()}
        onSwitchMode={jest.fn()}
        onSubmit={onSubmit}
      />,
    );
  });
  const input = label =>
    renderer.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label);
  const button = label =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
  await act(async () => {
    input('Email').props.onChangeText(DUMMY_ACCOUNT.email);
    input('Password').props.onChangeText(DUMMY_ACCOUNT.password);
  });
  expect(input('Password').props.secureTextEntry).toBe(true);
  await act(async () => button('Show password').props.onPress());
  expect(input('Password').props.secureTextEntry).toBe(false);
  await act(async () => button('Sign In').props.onPress());
  expect(onSubmit).toHaveBeenCalledWith({
    name: '',
    email: DUMMY_ACCOUNT.email,
    password: DUMMY_ACCOUNT.password,
    confirmation: '',
  });
});

test('Google remains a placeholder and cannot authenticate a session', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  stored.set(INTRO_SEEN_KEY, 'true');
  await openLogin();
  await act(async () =>
    renderer.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Google' &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
  expect(alert).toHaveBeenCalledWith(
    'Google',
    expect.stringContaining('not available yet'),
  );
  expect(stored.has(AUTH_SESSION_KEY)).toBe(false);
});

test('a corrupt session safely returns to the design splash before login', async () => {
  stored.set(INTRO_SEEN_KEY, 'true');
  stored.set(AUTH_SESSION_KEY, 'not-json');
  await openApp();
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(1);
  await act(async () =>
    renderer.root.findByType(SplashScreen).props.onContinue(),
  );
  expect(activeAuthScreen().props.mode).toBe('login');
});

test('an upward swipe is accepted before y0 is populated and opens login once', async () => {
  const responder = jest.spyOn(PanResponder, 'create');
  let finishAnimation;
  const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: callback => {
      finishAnimation = callback;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  await openApp();
  const gesture = responder.mock.calls[0][0];
  const movement = { numberActiveTouches: 1, y0: 0, dx: 2, dy: -80, vy: -0.6 };
  expect(gesture.onMoveShouldSetPanResponder({}, movement)).toBe(true);
  expect(gesture.onMoveShouldSetPanResponder({}, { ...movement, dx: 90 })).toBe(
    false,
  );
  expect(gesture.onMoveShouldSetPanResponder({}, { ...movement, dy: 80 })).toBe(
    false,
  );
  await act(async () => {
    gesture.onPanResponderGrant();
    gesture.onPanResponderMove({}, movement);
    gesture.onPanResponderRelease({}, movement);
    gesture.onPanResponderRelease({}, movement);
  });
  expect(timing).toHaveBeenCalledTimes(1);
  expect(stored.has(INTRO_SEEN_KEY)).toBe(false);
  await act(async () => finishAnimation({ finished: true }));
  expect(stored.get(INTRO_SEEN_KEY)).toBe('true');
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(0);
  expect(activeAuthScreen().props.mode).toBe('login');
});

test('a failed intro save restores the splash and lets the user retry the swipe', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const responder = jest.spyOn(PanResponder, 'create');
  let finishAnimation;
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: callback => {
      finishAnimation = callback;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  const spring = jest.spyOn(Animated, 'spring').mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage unavailable'));
  await openApp();
  const gesture = responder.mock.calls[0][0];
  const movement = { numberActiveTouches: 1, y0: 0, dx: 0, dy: -80, vy: -0.6 };
  await act(async () => gesture.onPanResponderRelease({}, movement));
  await act(async () => finishAnimation({ finished: true }));
  expect(spring).toHaveBeenCalled();
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(1);
  expect(stored.has(INTRO_SEEN_KEY)).toBe(false);
  expect(gesture.onMoveShouldSetPanResponder({}, movement)).toBe(true);
  await act(async () => gesture.onPanResponderRelease({}, movement));
  await act(async () => finishAnimation({ finished: true }));
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(0);
  expect(stored.get(INTRO_SEEN_KEY)).toBe('true');
});

test('login is pulled upwards with the splash and back reverses the movement', async () => {
  const responder = jest.spyOn(PanResponder, 'create');
  await openApp();
  const loginOffset = () => {
    const offset = StyleSheet.flatten(
      renderer.root.findByProps({ testID: 'auth-vertical-page' }).props.style,
    ).transform[0].translateY;
    return typeof offset === 'number' ? offset : offset.__getValue();
  };
  const splashOffset = () =>
    StyleSheet.flatten(
      renderer.root.findByProps({ testID: 'intro-swipe' }).props.style,
    ).transform[0].translateY.__getValue();
  const initialLoginOffset = loginOffset();
  const gesture = responder.mock.calls[0][0];
  const movement = { numberActiveTouches: 1, y0: 0, dx: 0, dy: -120, vy: -0.6 };
  await act(async () => {
    gesture.onPanResponderGrant();
    gesture.onPanResponderMove({}, movement);
  });
  expect(splashOffset()).toBeCloseTo(-120);
  expect(loginOffset()).toBeCloseTo(initialLoginOffset - 120);
  await act(async () => gesture.onPanResponderRelease({}, movement));
  expect(loginOffset()).toBe(0);
  await act(async () => activeAuthScreen().props.onBack());
  expect(renderer.root.findAllByType(SplashScreen)).toHaveLength(1);
  expect(splashOffset()).toBe(0);
  expect(loginOffset()).toBe(initialLoginOffset);
});

test('the entered email survives an animated round trip to register', async () => {
  stored.set(INTRO_SEEN_KEY, 'true');
  await openLogin();
  const emailInput = () =>
    activeAuthScreen()
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Email');
  await act(async () => emailInput().props.onChangeText(DUMMY_ACCOUNT.email));
  await act(async () => activeAuthScreen().props.onSwitchMode());
  expect(activeAuthScreen().props.mode).toBe('register');
  await act(async () => activeAuthScreen().props.onBack());
  expect(activeAuthScreen().props.mode).toBe('login');
  expect(emailInput().props.value).toBe(DUMMY_ACCOUNT.email);
});

test('login after the design splash has full-screen bounds and visible resting styles', async () => {
  stored.set(INTRO_SEEN_KEY, 'true');
  const onReady = jest.fn();
  await openLogin({ onReady });
  const vertical = renderer.root.findByProps({ testID: 'auth-vertical-page' });
  const login = renderer.root.findByProps({ testID: 'auth-login-page' });
  const layer = renderer.root.findByProps({ testID: 'auth-transition-layer' });
  // Missing full-screen constraints collapse the flex-based form to zero height.
  // React Native 0.86 has no StyleSheet.absoluteFillObject export.
  const register = renderer.root.findByProps({ testID: 'auth-register-page' });
  for (const page of [login, register]) {
    expect(StyleSheet.flatten(page.props.style)).toEqual(
      expect.objectContaining({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }),
    );
  }
  expect(StyleSheet.flatten(vertical.props.style).transform[0].translateY).toBe(
    0,
  );
  expect(StyleSheet.flatten(login.props.style).transform[0].translateX).toBe(0);
  expect(StyleSheet.flatten(layer.props.style).opacity).toBe(1);
  expect(onReady).not.toHaveBeenCalled();
  await act(async () => login.props.onLayout());
  expect(onReady).toHaveBeenCalledTimes(1);
});

test('launch animation waits for the next screen before fading out', async () => {
  jest.spyOn(Animated, 'spring').mockImplementation((value, config) => ({
    start: callback => {
      value.setValue(config.toValue);
      callback?.({ finished: true });
    },
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  const onComplete = jest.fn();
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <LaunchSplashScreen canFinish={false} onComplete={onComplete} />,
    );
  });
  expect(onComplete).not.toHaveBeenCalled();
  await act(async () => {
    renderer.update(<LaunchSplashScreen canFinish onComplete={onComplete} />);
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
});
