import { httpClient, ApiResponse } from './httpClient';

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  full_name: string;
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'ADMIN';
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export const AuthApi = {
  async login(username_or_email: string, password: string): Promise<ApiResponse<TokenResponse>> {
    const res = await httpClient.post<TokenResponse>('/auth/login', {
      username_or_email,
      password,
    });
    if (res.success && res.data?.access_token) {
      localStorage.setItem('medikiosk_token', res.data.access_token);
      localStorage.setItem('medikiosk_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async getMe(): Promise<ApiResponse<UserResponse>> {
    return httpClient.get<UserResponse>('/auth/me');
  },

  logout(): void {
    localStorage.removeItem('medikiosk_token');
    localStorage.removeItem('medikiosk_user');
  },

  getCurrentUser(): UserResponse | null {
    try {
      const userStr = localStorage.getItem('medikiosk_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('medikiosk_token'));
  },

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },
};
