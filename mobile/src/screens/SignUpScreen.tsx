import React, { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { colors, typography, spacing } from '../theme';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

type Stage = 'form' | 'verify';

type Props = {
  stage: Stage;
  /** The address verification was sent to, once known — only meaningful in the 'verify' stage. */
  email: string;
  loading?: boolean;
  onSubmitForm: (email: string, password: string) => void;
  onSubmitCode: (code: string) => void;
  onResendCode: () => void;
  onBackToSignIn: () => void;
};

export default function SignUpScreen({
  stage,
  email,
  loading = false,
  onSubmitForm,
  onSubmitCode,
  onResendCode,
  onBackToSignIn,
}: Props) {
  const [formEmail, setFormEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{stage === 'form' ? 'Create your account' : 'Check your email'}</Text>
        <Text style={styles.subtitle}>
          {stage === 'form' ? 'Everything important, in one place.' : `Enter the code we sent to ${email}`}
        </Text>

        {stage === 'form' ? (
          <View style={styles.form}>
            <TextField
              label="Email"
              value={formEmail}
              onChangeText={setFormEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              textContentType="newPassword"
            />
            <PrimaryButton
              label="Create account"
              onPress={() => onSubmitForm(formEmail.trim(), password)}
              disabled={!formEmail.trim() || password.length < 8}
              loading={loading}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <TextField
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
            />
            <PrimaryButton
              label="Verify"
              onPress={() => onSubmitCode(code.trim())}
              disabled={code.trim().length < 4}
              loading={loading}
            />
            <Text style={styles.resend} onPress={onResendCode}>
              Didn't get a code? Resend
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={onBackToSignIn}>
            Sign in
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  title: { fontSize: 20, color: colors.ink, textAlign: 'center', ...typography.heading },
  subtitle: {
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  form: { width: '100%' },
  resend: { fontSize: 12.5, color: colors.teal, textAlign: 'center', marginTop: spacing.sm, fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 12.5, color: colors.textMuted, marginTop: spacing.xl },
  link: { color: colors.teal, fontWeight: '500' },
});
