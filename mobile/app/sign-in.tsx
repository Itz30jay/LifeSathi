import { useSSO } from '@clerk/expo';
// `useSignIn` from the main '@clerk/expo' export now returns Clerk's newer
// signal-based "Future" API ({ errors, fetchStatus, signIn }), which doesn't
// have isLoaded/setActive. Clerk's own current custom-flow docs still teach
// the classic { isLoaded, signIn, setActive } shape used below, which lives
// at this /legacy subpath — confirmed against the installed package's own
// type definitions, not assumed. Revisit if/when Clerk's docs move the
// recommended pattern fully onto the Future API.
import { useSignIn } from '@clerk/expo/legacy';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';

// Required once per app for the OAuth browser flow to hand control back —
// see Clerk's Expo OAuth guide.
WebBrowser.maybeCompleteAuthSession();

/** Preloads the Android browser so the Google sign-in sheet opens faster. */
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function SignInRoute() {
  useWarmUpBrowser();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);

  const handleContinue = async (identifier: string, password: string) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({ identifier, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)/dashboard');
      } else {
        // Clerk asked for another step (e.g. MFA). That flow isn't built
        // yet — say so plainly instead of pretending sign-in finished.
        Alert.alert('Almost there', `Additional verification needed (${result.status}) — not built yet.`);
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage ?? err?.message ?? 'Sign-in failed';
      Alert.alert('Could not sign in', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { createdSessionId, setActive: activateSso } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'lifesathi', path: '/sign-in' }),
      });
      if (createdSessionId && activateSso) {
        await activateSso({ session: createdSessionId });
        router.replace('/(app)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Google sign-in failed', err?.message ?? 'Unknown error');
    }
  };

  return (
    <LoginScreen
      loading={loading}
      onContinue={handleContinue}
      onGooglePress={handleGoogle}
      onForgotPassword={() => router.push('/forgot-password')}
      onCreateAccount={() => router.push('/sign-up')}
    />
  );
}
