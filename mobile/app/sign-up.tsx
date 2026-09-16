import { useSignUp } from '@clerk/expo/legacy';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import SignUpScreen from '../src/screens/SignUpScreen';

export default function SignUpRoute() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [stage, setStage] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitForm = async (formEmail: string, password: string) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({ emailAddress: formEmail, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setEmail(formEmail);
      setStage('verify');
    } catch (err: any) {
      Alert.alert('Could not create account', err?.errors?.[0]?.longMessage ?? err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (code: string) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      } else {
        Alert.alert('Almost there', `Additional step required (${result.status}) — not built yet.`);
      }
    } catch (err: any) {
      Alert.alert('Verification failed', err?.errors?.[0]?.longMessage ?? err?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Code resent', `Check ${email} again.`);
    } catch (err: any) {
      Alert.alert('Could not resend', err?.message ?? 'Unknown error');
    }
  };

  return (
    <SignUpScreen
      stage={stage}
      email={email}
      loading={loading}
      onSubmitForm={handleSubmitForm}
      onSubmitCode={handleSubmitCode}
      onResendCode={handleResendCode}
      onBackToSignIn={() => router.replace('/sign-in')}
    />
  );
}
