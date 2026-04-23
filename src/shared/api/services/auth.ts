import type { LoginInput, RegisterInput, TokenResponse, User } from '@/types';

import { apiClient } from '../client';

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<TokenResponse>('/auth/register', data).then((response) => response.data),
  login: (data: LoginInput) =>
    apiClient.post<TokenResponse>('/auth/login', data).then((response) => response.data),
  me: () => apiClient.get<User>('/auth/me').then((response) => response.data),
};
