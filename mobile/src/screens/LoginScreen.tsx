import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../theme';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

type Props = {
  onContinue: (identifier: string, password: string) => void;
  onGooglePress: () => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  loading?: boolean;
};

/**
 * Login screen. Deliberately has no navigation or auth-SDK calls wired in —
 * those depend on decisions (React Navigation? Clerk SDK version?) that
 * belong to the Phase 1 backend/auth wiring step, not this UI pass. Callbacks
 * are passed in as props so this component stays a pure presentation layer.
 */
export default function LoginScreen({
  onContinue,
  onGooglePress,
  onCreateAccount,
  onForgotPassword,
  loading = false,
}: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo mark — simple placeholder shape; swap for the real asset (SVG/PNG) once branding is final */}
        <View style={styles.logoBadge}>
          <View style={styles.logoArcA} />
          <View style={styles.logoArcB} />
        </View>

        <Text style={styles.wordmark}>LifeSathi</Text>
        <Text style={styles.tagline}>Everything important, in one place</Text>

        <View style={styles.form}>
          <TextField
            label="Phone number or email"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="98765 43210"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="username"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            textContentType="password"
            rightAdornment={
              <Text style={styles.link} onPress={onForgotPassword}>
                Forgot?
              </Text>
            }
          />

          <PrimaryButton
            label="Continue"
            onPress={() => onContinue(identifier, password)}
            loading={loading}
            disabled={!identifier || !password}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <PrimaryButton label="Continue with Google" onPress={onGooglePress} variant="secondary" />
        </View>

        <Text style={styles.footer}>
          New here?{' '}
          <Text style={styles.link} onPress={onCreateAccount}>
            Create account
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.indigo,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoArcA: {
    position: 'absolute',
    width: 22,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.marigold,
    transform: [{ rotate: '-20deg' }],
    top: 18,
    left: 15,
  },
  logoArcB: {
    position: 'absolute',
    width: 22,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.marigold,
    opacity: 0.55,
    transform: [{ rotate: '160deg' }],
    top: 26,
    left: 18,
  },
  wordmark: {
    textAlign: 'center',
    fontSize: 22,
    color: colors.ink,
    marginTop: spacing.md + 2,
    ...typography.heading,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 12.5,
    color: colors.textFaint,
    marginTop: 2,
    marginBottom: spacing.xxxl - 4,
  },
  form: { width: '100%' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginVertical: spacing.lg + 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 11, color: colors.textFaint },
  footer: { textAlign: 'center', fontSize: 12.5, color: colors.textMuted, marginTop: spacing.xl },
  link: { color: colors.teal, fontWeight: '500' },
});
