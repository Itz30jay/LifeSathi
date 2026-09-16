import React, { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { colors, typography, spacing } from '../theme';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

type Stage = 'request' | 'reset';

type Props = {
  stage: Stage;
  email: string;
  loading?: boolean;
  onRequestCode: (email: string) => void;
  onSubmitReset: (code: string, newPassword: string) => void;
  onBackToSignIn: () => void;
};

export default function ForgotPasswordScreen({
  stage,
  email,
  loading = false,
  onRequestCode,
  onSubmitReset,
  onBackToSignIn,
}: Props) {
  const [formEmail, setFormEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{stage === 'request' ? 'Reset your password' : 'Set a new password'}</Text>
        <Text style={styles.subtitle}>
          {stage === 'request'
            ? "We'll email you a code to reset your password."
            : `Enter the code sent to ${email}, and a new password.`}
        </Text>

        {stage === 'request' ? (
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
            <PrimaryButton
              label="Send code"
              onPress={() => onRequestCode(formEmail.trim())}
              disabled={!formEmail.trim()}
              loading={loading}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <TextField label="Code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" />
            <TextField
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              textContentType="newPassword"
            />
            <PrimaryButton
              label="Reset password"
              onPress={() => onSubmitReset(code.trim(), newPassword)}
              disabled={code.trim().length < 4 || newPassword.length < 8}
              loading={loading}
            />
          </View>
        )}

        <Text style={styles.footer}>
          <Text style={styles.link} onPress={onBackToSignIn}>
            Back to sign in
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
  footer: { textAlign: 'center', fontSize: 12.5, color: colors.textMuted, marginTop: spacing.xl },
  link: { color: colors.teal, fontWeight: '500' },
});
