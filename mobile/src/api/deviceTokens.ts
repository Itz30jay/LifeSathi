import { apiFetch } from './client';

export type DevicePlatform = 'IOS' | 'ANDROID';

export function registerDeviceToken(token: string | null, deviceToken: string, platform: DevicePlatform): Promise<void> {
  return apiFetch<void>('/api/device-tokens', {
    method: 'POST',
    body: { token: deviceToken, platform },
    token,
  });
}

export function unregisterDeviceToken(token: string | null, deviceToken: string): Promise<void> {
  return apiFetch<void>(`/api/device-tokens/${encodeURIComponent(deviceToken)}`, { method: 'DELETE', token });
}
