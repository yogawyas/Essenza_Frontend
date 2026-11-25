import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../ui/components';
import { DesignAction, DesignIcon } from '../ui/design';
import { colors, s, sans, sansBold, serif } from '../ui/theme';

const fieldIcons = { Username: 'person', Email: 'email' };

function AuthField({ label, value, onChangeText, secret = false }) {
  const [visible, setVisible] = useState(false);
  const email = label === 'Email';
  return (
    <View style={styles.field}>
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={email || secret ? 'none' : 'words'}
        autoCorrect={false}
        keyboardType={email ? 'email-address' : 'default'}
        autoComplete={email ? 'email' : secret ? 'password' : 'username'}
        secureTextEntry={secret && !visible}
        style={styles.input}
      />
      {secret ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            (visible ? 'Hide ' : 'Show ') + label.toLowerCase()
          }
          onPress={() => setVisible(!visible)}
          style={styles.fieldAction}
        >
          <DesignIcon name="password" />
          {visible ? (
            <DesignIcon name="passwordHidden" style={styles.eyeDetail} />
          ) : null}
        </Pressable>
      ) : (
        <DesignIcon name={fieldIcons[label]} style={styles.fieldAction} />
      )}
    </View>
  );
}

export function AuthScreen({
  mode,
  onBack,
  onSwitchMode,
  onSubmit,
  onGoogleSignIn,
  cloudMode,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const waveWidthScale = (width + 2) / 437;
  const heroInset = Math.max(insets.top - 24, 0);
  const register = mode === 'register';
  const [recover, setRecover] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const runAuthAction = async (method, action) => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setBusy(method);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      submitting.current = false;
      setBusy(null);
    }
  };

  const submit = () => {
    if (recover) {
      setError(
        /^\S+@\S+\.\S+$/.test(email.trim())
          ? 'Password reset is not available yet.'
          : 'Enter a valid email address.',
      );
      return;
    }
    return runAuthAction('email', () =>
      onSubmit({ name, email, password, confirmation }),
    );
  };

  const googleSignIn = () => {
    if (onGoogleSignIn) {
      return runAuthAction('google', onGoogleSignIn);
    }
    Alert.alert('Google', 'Google sign-in is not available yet.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBackground, { paddingTop: heroInset }]}>
          <View style={styles.hero}>
            <DesignIcon name="authEllipse" style={styles.leftCircle} />
            <DesignIcon name="authEllipse" style={styles.rightCircle} />
            <View style={styles.waveClip} pointerEvents="none">
              <DesignIcon
                name="authWave"
                style={[
                  styles.wave,
                  { transform: [{ scaleX: waveWidthScale }] },
                ]}
              />
            </View>
            <DesignAction
              name="back"
              label="Back"
              style={styles.back}
              onPress={
                recover
                  ? () => {
                      setRecover(false);
                      setError('');
                    }
                  : onBack
              }
            >
              <Text style={styles.backLabel}>Back</Text>
            </DesignAction>
            <DesignIcon name="authLogo" style={styles.logo} />
          </View>
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>
            {recover ? 'Reset Password' : 'Welcome to\nEssenza!'}
          </Text>
          <Text style={styles.description}>
            {recover
              ? 'Enter the email associated with your account.'
              : register
              ? 'Create your Essenza account.'
              : 'Sign in to your account.'}
          </Text>
          {register ? (
            <AuthField label="Username" value={name} onChangeText={setName} />
          ) : null}
          <AuthField label="Email" value={email} onChangeText={setEmail} />
          {!recover ? (
            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secret
            />
          ) : null}
          {register ? (
            <AuthField
              label="Confirm Password"
              value={confirmation}
              onChangeText={setConfirmation}
              secret
            />
          ) : null}
          {!cloudMode && !register && !recover ? (
            <Text
              accessibilityRole="button"
              style={styles.forgot}
              onPress={() => {
                setRecover(true);
                setError('');
              }}
            >
              Forgot password?
            </Text>
          ) : null}
          {error ? (
            <Text accessibilityLiveRegion="polite" style={s.error}>
              {error}
            </Text>
          ) : null}
          <Button
            label={
              recover
                ? 'Send Reset Link'
                : register
                ? 'Create Account'
                : 'Sign In'
            }
            disabled={Boolean(busy)}
            loading={busy === 'email'}
            style={styles.submit}
            onPress={submit}
          />
          {!recover ? (
            <>
              {(!cloudMode || onGoogleSignIn) && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.hint}>Or continue with</Text>
                    <View style={styles.line} />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      cloudMode ? 'Continue with Google' : 'Google'
                    }
                    accessibilityState={{
                      busy: busy === 'google',
                      disabled: Boolean(busy),
                    }}
                    disabled={Boolean(busy)}
                    style={styles.google}
                    onPress={googleSignIn}
                  >
                    <DesignIcon name="google" />
                    <Text style={styles.googleText}>
                      {busy === 'google'
                        ? 'Opening Google…'
                        : cloudMode
                        ? 'Continue with Google'
                        : 'Google'}
                    </Text>
                  </Pressable>
                </>
              )}
              <Text style={styles.switch}>
                {register ? 'Already have an account? ' : 'New to Essenza? '}
                <Text
                  accessibilityRole="button"
                  style={styles.link}
                  onPress={() => {
                    setError('');
                    onSwitchMode();
                  }}
                >
                  {register ? 'Sign in' : 'Create an account'}
                </Text>
              </Text>
              {!cloudMode && (
                <Text style={styles.legal}>
                  Terms of Service · Privacy Policy · Notice at Collection
                </Text>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  heroBackground: { backgroundColor: colors.ivory },
  hero: { height: 225, overflow: 'hidden', paddingTop: 33 },
  waveClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 35,
    overflow: 'hidden',
    alignItems: 'center',
  },
  wave: { width: 437 },
  leftCircle: { position: 'absolute', left: -61, top: 99 },
  rightCircle: { position: 'absolute', right: -33, top: 155 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
  },
  backLabel: { fontFamily: serif, color: colors.green, fontSize: 24 },
  logo: { position: 'absolute', top: 71, alignSelf: 'center' },
  form: {
    gap: 14,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 38,
    paddingTop: 22,
  },
  title: {
    fontFamily: serif,
    color: colors.green,
    fontSize: 36,
    lineHeight: 38,
    includeFontPadding: false,
  },
  description: { ...s.body, color: colors.ink, fontSize: 16 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFBFBF',
    borderRadius: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontFamily: sans,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 12,
  },
  fieldAction: {
    width: 44,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeDetail: { position: 'absolute' },
  forgot: { color: colors.green, fontFamily: sans, alignSelf: 'flex-end' },
  submit: { marginTop: 8, minHeight: 44, borderRadius: 8 },
  divider: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginVertical: 6,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.muted,
  },
  hint: { color: colors.muted, fontFamily: sans },
  google: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 24,
    minHeight: 44,
  },
  googleText: { color: colors.ink, fontFamily: sansBold, fontSize: 18 },
  switch: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: sans,
    paddingVertical: 6,
  },
  link: { fontFamily: sansBold, color: colors.green },
  legal: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: sans,
    textAlign: 'center',
  },
});
