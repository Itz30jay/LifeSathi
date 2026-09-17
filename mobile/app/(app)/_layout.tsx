import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { colors } from '../../src/theme';
import { setUpPushNotifications, subscribeToForegroundMessages } from '../../src/lib/pushNotifications';

export default function AppLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Hooks must run unconditionally (before the early returns below), so the
  // "only do this once signed in" check lives inside the effect instead.
  useEffect(() => {
    if (!isSignedIn) return;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const token = await getToken();
      try {
        await setUpPushNotifications(token);
        unsubscribe = subscribeToForegroundMessages((title, body) => {
          Alert.alert(title, body);
        });
      } catch (err: any) {
        // No Firebase project exists yet in this workspace, so this is
        // expected to fail for now — shouldn't block the rest of the app.
        console.warn('Push notification setup skipped:', err?.message ?? err);
      }
    })();

    return () => unsubscribe?.();
  }, [isSignedIn, getToken]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  // Text-only tabs for now — no icon library added yet (flagged, not
  // silently added, in mobile/README.md). Functionally complete either way.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.marigold,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.borderSoft },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders' }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses' }} />
    </Tabs>
  );
}
