import { useAuth } from '@clerk/expo';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken as getFcmToken } from '@react-native-firebase/messaging';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ProfileScreen, { type ProfileData, type PreferredLanguage } from '../../src/screens/ProfileScreen';
import { fetchProfile, updateProfile } from '../../src/api/profile';
import { unregisterDeviceToken } from '../../src/api/deviceTokens';
import { colors } from '../../src/theme';

export default function ProfileRoute() {
  const { getToken, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const remote = await fetchProfile(token);
      setProfile({
        email: remote.email,
        fullName: remote.fullName,
        preferredLanguage: remote.preferredLanguage as PreferredLanguage,
        monthlyBudget: remote.monthlyBudget,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load your profile.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (update: { fullName: string; preferredLanguage: PreferredLanguage; monthlyBudget: number | null }) => {
    setSaving(true);
    try {
      const token = await getToken();
      const remote = await updateProfile(token, {
        fullName: update.fullName || null,
        preferredLanguage: update.preferredLanguage,
        monthlyBudget: update.monthlyBudget,
      });
      setProfile({
        email: remote.email,
        fullName: remote.fullName,
        preferredLanguage: remote.preferredLanguage as PreferredLanguage,
        monthlyBudget: remote.monthlyBudget,
      });
    } catch (err: any) {
      setError(err?.message ?? 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const authToken = await getToken();
      const fcmToken = await getFcmToken(getMessaging(getApp()));
      await unregisterDeviceToken(authToken, fcmToken);
    } catch {
      // Firebase isn't configured yet in this workspace, so this is
      // expected to fail for now — signing out should proceed regardless.
    }
    await signOut();
    router.replace('/sign-in');
  };

  if (error && !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return <ProfileScreen profile={profile} saving={saving} onSave={handleSave} onSignOut={handleSignOut} />;
}

const styles = {
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.sand,
    padding: 24,
  },
  errorText: { color: colors.coral, textAlign: 'center' as const },
};
