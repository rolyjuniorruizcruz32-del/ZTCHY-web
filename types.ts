
export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-otp';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}
