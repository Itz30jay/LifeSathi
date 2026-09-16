import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

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
