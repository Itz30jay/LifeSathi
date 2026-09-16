import { useSignIn } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import ForgotPasswordScreen from '../src/screens/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (formEmail: string) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: formEmail });
      setEmail(formEmail);
      setStage('reset');
    } catch (err: any) {
      Alert.alert('Could not send code', err?.errors?.[0]?.longMessage ?? err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Verifying the code and setting the new password happen in one call in
  // Clerk's legacy API (attemptFirstFactor with the reset strategy) --
  // confirmed against Clerk's own docs rather than assumed, since the
  // sign-in flow already turned up a legacy-vs-current API split once.
  const handleSubmitReset = async (code: string, newPassword: string) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      } else {
        Alert.alert('Almost there', `Additional step required (${result.status}) — not built yet.`);
      }
    } catch (err: any) {
      Alert.alert('Could not reset password', err?.errors?.[0]?.longMessage ?? err?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordScreen
      stage={stage}
      email={email}
      loading={loading}
      onRequestCode={handleRequestCode}
      onSubmitReset={handleSubmitReset}
      onBackToSignIn={() => router.replace('/sign-in')}
    />
  );
}
