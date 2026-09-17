import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerDeviceToken, type DevicePlatform } from '../api/deviceTokens';

/**
 * @react-native-firebase/messaging v26 deprecated its own requestPermission()
 * / hasPermission() (confirmed via the installed package's own type
 * definitions — the deprecation notice points at exactly this replacement),
 * so permission comes from expo-notifications instead; messaging is still
 * used for the actual token + message handling, which it still owns.
 *
 * Also v26-specific: the whole API is now modular functions taking a
 * `Messaging` instance (getToken(messaging, ...), onMessage(messaging, ...))
 * rather than the old `messaging().getToken()` singleton-method style from
 * earlier majors — easy to get wrong if writing this from memory.
 */
export async function setUpPushNotifications(authToken: string | null): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const messaging = getMessaging(getApp());
  const platform: DevicePlatform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

  const fcmToken = await getToken(messaging);
  await registerDeviceToken(authToken, fcmToken, platform);

  // Tokens can rotate (reinstall, app data cleared, etc.) — keep the
  // backend in sync rather than silently going stale.
  onTokenRefresh(messaging, (refreshedToken) => {
    void registerDeviceToken(authToken, refreshedToken, platform);
  });
}

/**
 * FCM only auto-displays a system notification when the app is backgrounded
 * or killed — in the foreground it just delivers a JS event, so the app has
 * to decide how to show it. Returns an unsubscribe function.
 */
export function subscribeToForegroundMessages(onReceive: (title: string, body: string) => void): () => void {
  const messaging = getMessaging(getApp());
  return onMessage(messaging, (remoteMessage) => {
    onReceive(remoteMessage.notification?.title ?? 'LifeSathi', remoteMessage.notification?.body ?? '');
  });
}
