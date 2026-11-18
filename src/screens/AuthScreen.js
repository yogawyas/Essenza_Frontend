import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignArt } from '../ui/DesignArt';
const green = '#163B2C';
const sage = '#687F6D';
function FieldIcon({ name, hidden = false }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {name === 'email' ? (
        <>
          <Rect x="1.5" y="5.5" width="21" height="14" rx="1" stroke="#777" />
          <Path d="m2 6 10 8 10-8M2 19l7-7m13 7-7-7" stroke="#777" />
        </>
      ) : name === 'user' ? (
        <>
          <Circle cx="12" cy="7" r="4" fill="#686868" />
          <Path d="M4.5 22v-2a7.5 7.5 0 0 1 15 0v2Z" fill="#686868" />
        </>
      ) : (
        <>
          <Path
            d="M1.5 12S5 6 12 6s10.5 6 10.5 6S19 18 12 18 1.5 12 1.5 12Z"
            stroke="#686868"
            strokeWidth="1.4"
          />
          <Circle cx="12" cy="12" r="3" stroke="#686868" strokeWidth="1.4" />
          {!hidden && (
            <Path d="m3 3 18 18" stroke="#686868" strokeWidth="1.4" />
          )}
        </>
      )}
    </Svg>
  );
}
export function AuthScreen({
  mode,
  registrationSuccess,
  onBack,
  onSwitchMode,
  onSubmit,
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width, 600) / 360;
  const isRegister = mode === 'register';
  const artwork = isRegister ? 'register' : 'login';
  const offset = registrationSuccess && !isRegister ? 68 : 0;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (registrationSuccess && !isRegister) {
      setEmail(registrationSuccess);
      setPassword('');
    }
  }, [registrationSuccess, isRegister]);
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmationRef = useRef(null);
  const submit = async () => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await onSubmit({ name, email, password, confirmation });
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const field = (type, top) => {
    const secret = type === 'password' || type === 'confirmation';
    const visible = type === 'password' ? showPassword : showConfirmation;
    const values = { name, email, password, confirmation };
    const setters = {
      name: setName,
      email: setEmail,
      password: setPassword,
      confirmation: setConfirmation,
    };
    const labels = {
      name: 'Username',
      email: 'Email',
      password: 'Password',
      confirmation: 'Confirm password',
    };
    const placeholders = {
      name: 'Enter your username...',
      email: 'Enter your email...',
      password: 'Enter your password...',
      confirmation: 'Confirm your password...',
    };
    return (
      <View
        style={[
          styles.field,
          {
            top: (top + offset) * scale,
            left: 38 * scale,
            width: 284 * scale,
            height: 42 * scale,
            borderRadius: 8 * scale,
          },
        ]}
      >
        <TextInput
          ref={
            type === 'email'
              ? emailRef
              : type === 'password'
              ? passwordRef
              : type === 'confirmation'
              ? confirmationRef
              : undefined
          }
          accessibilityLabel={labels[type]}
          placeholder={placeholders[type]}
          placeholderTextColor="#858585"
          value={values[type]}
          onChangeText={setters[type]}
          secureTextEntry={secret && !visible}
          autoCapitalize={type === 'name' ? 'words' : 'none'}
          autoCorrect={false}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoComplete={
            type === 'email'
              ? 'email'
              : type === 'name'
              ? 'name'
              : isRegister
              ? 'new-password'
              : 'current-password'
          }
          maxLength={type === 'name' ? 40 : type === 'email' ? 254 : 128}
          returnKeyType={
            type === 'confirmation' || (!isRegister && type === 'password')
              ? 'done'
              : 'next'
          }
          submitBehavior={
            type === 'confirmation' || (!isRegister && type === 'password')
              ? 'blurAndSubmit'
              : 'submit'
          }
          onSubmitEditing={() => {
            if (type === 'name') {
              emailRef.current?.focus();
            } else if (type === 'email') {
              passwordRef.current?.focus();
            } else if (type === 'password' && isRegister) {
              confirmationRef.current?.focus();
            } else {
              submit();
            }
          }}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            {
              fontSize: 16 * scale,
              paddingLeft: 12 * scale,
              paddingRight: 44 * scale,
            },
          ]}
        />
        {secret ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${
              type === 'confirmation' ? 'confirm password' : 'password'
            }`}
            onPress={() =>
              type === 'password'
                ? setShowPassword(value => !value)
                : setShowConfirmation(value => !value)
            }
            style={[styles.fieldIcon, { width: 44 * scale }]}
          >
            <FieldIcon name="password" hidden={!visible} />
          </Pressable>
        ) : (
          <View
            pointerEvents="none"
            style={[styles.fieldIcon, { width: 44 * scale }]}
          >
            <FieldIcon name={type === 'name' ? 'user' : 'email'} />
          </View>
        )}
      </View>
    );
  };
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom },
        ]}
      >
        <View
          style={{
            width: 360 * scale,
            minHeight: Math.max(height, (800 + offset) * scale),
            backgroundColor: '#FFFFFF',
          }}
        >
          <DesignArt
            name={artwork}
            crop="0 0 360 224"
            width={360 * scale}
            height={224 * scale}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={{
              position: 'absolute',
              top: 32 * scale,
              left: 10 * scale,
              width: 130 * scale,
              height: 44 * scale,
            }}
          />
          <View
            accessibilityRole="header"
            accessibilityLabel="Welcome to Essenza!"
            style={{ position: 'absolute', left: 38 * scale, top: 250 * scale }}
          >
            <DesignArt
              name={artwork}
              crop="38 250 284 72"
              width={284 * scale}
              height={72 * scale}
            />
          </View>
          {!isRegister && (
            <Text
              style={[
                styles.subtitle,
                {
                  top: 331 * scale,
                  left: 38 * scale,
                  fontSize: 16 * scale,
                  lineHeight: 22 * scale,
                },
              ]}
            >
              Sign in to access your account!
            </Text>
          )}
          {offset > 0 && (
            <View
              accessibilityLabel="Registration successful"
              style={{
                position: 'absolute',
                left: 37 * scale,
                top: 355 * scale,
              }}
            >
              <DesignArt
                name="loginSuccess"
                crop="37 355 286 67"
                width={286 * scale}
                height={67 * scale}
              />
            </View>
          )}
          {isRegister && field('name', 364)}
          {field('email', isRegister ? 422 : 362)}
          {field('password', isRegister ? 480 : 420)}
          {isRegister && field('confirmation', 540)}
          {!isRegister && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot password?"
              onPress={() =>
                Alert.alert(
                  'Forgot password?',
                  'Password recovery is not available yet.',
                )
              }
              style={{
                position: 'absolute',
                top: (465 + offset) * scale,
                right: 38 * scale,
                minHeight: 40 * scale,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: green, fontSize: 14 * scale }}>
                Forgot password?
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: busy, busy }}
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                top: ((isRegister ? 609 : 519) + offset) * scale,
                left: 38 * scale,
                width: 285 * scale,
                height: 38 * scale,
                borderRadius: 8 * scale,
                opacity: pressed || busy ? 0.75 : 1,
              },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 * scale }}>
              Sign In
            </Text>
          </Pressable>
          <View
            style={[
              styles.divider,
              {
                top: ((isRegister ? 672 : 582) + offset) * scale,
                left: 38 * scale,
                width: 284 * scale,
                gap: 5 * scale,
              },
            ]}
          >
            <View style={styles.dividerLine} />
            <Text style={{ color: sage, fontSize: 14 * scale }}>
              Or sign in with
            </Text>
            <View style={styles.dividerLine} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Google"
            onPress={() =>
              Alert.alert('Google', 'Google login is not available yet.')
            }
            style={({ pressed }) => [
              styles.googleButton,
              {
                top: ((isRegister ? 710 : 620) + offset) * scale,
                left: 37 * scale,
                width: 285 * scale,
                height: 40 * scale,
                borderRadius: 22 * scale,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <DesignArt
              name={artwork}
              crop={isRegister ? '134 720 93 23' : '134 628 93 23'}
              width={93 * scale}
              height={23 * scale}
            />
          </Pressable>
          <View
            style={[
              styles.switchRow,
              {
                top: ((isRegister ? 765 : 675) + offset) * scale,
                left: 20 * scale,
                right: 20 * scale,
                minHeight: 32 * scale,
              },
            ]}
          >
            <Text style={{ color: sage, fontSize: 14 * scale }}>
              {isRegister ? 'Already have an Essenza account? ' : "Don't have an account? "}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onSwitchMode}
              hitSlop={8}
            >
              <Text
                style={{
                  color: green,
                  fontSize: 14 * scale,
                  fontWeight: '700',
                }}
              >
                {isRegister ? 'Sign in here' : 'Sign up here'}
              </Text>
            </Pressable>
          </View>
          {!isRegister && (
            <Text
              style={[
                styles.legal,
                { top: 729 * scale, width: 360 * scale, fontSize: 12 * scale },
              ]}
            >
              <Text style={styles.underlined}>Terms of Service</Text>
              {' · '}
              <Text style={styles.underlined}>Privacy Policy</Text>
              {' · '}
              <Text style={styles.underlined}>Notice at Collection</Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { alignItems: 'center', flexGrow: 1 },
  subtitle: { position: 'absolute', color: '#444444' },
  field: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#BFBFBF',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: '#163B2C',
    includeFontPadding: false,
  },
  fieldIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: green,
  },
  divider: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: sage,
  },
  googleButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: sage,
    backgroundColor: '#FFFFFF',
  },
  switchRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legal: { position: 'absolute', textAlign: 'center', color: sage },
  underlined: { textDecorationLine: 'underline' },
});
