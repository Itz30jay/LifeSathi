import { apiFetch } from './client';

// Mirrors backend/.../user/UserProfileResponse.java
export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  preferredLanguage: string;
  monthlyBudget: number | null;
}

export type PreferredLanguage = 'en' | 'hi' | 'or';

export interface UpdateProfileRequest {
  fullName: string | null;
  preferredLanguage: PreferredLanguage;
  monthlyBudget: number | null;
}

export function fetchProfile(token: string | null): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/api/me', { token });
}

export function updateProfile(token: string | null, request: UpdateProfileRequest): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/api/me', { method: 'PUT', body: request, token });
}
