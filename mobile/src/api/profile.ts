import { apiFetch } from './client';

// Mirrors backend/.../user/UserProfileResponse.java
export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  preferredLanguage: string;
  monthlyBudget: number | null;
}

export function fetchProfile(token: string | null): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/api/me', { token });
}
