import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LoginInput, RegisterInput } from '@/types';

import { queryKeys } from '@/shared/api/queryKeys';
import { authApi } from '@/shared/api/services';
import { useAuthStore } from '@/stores/authStore';

export function useRegister() {
  const { setAccessToken, setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      const user = await authApi.me();
      setAuth(tokenResponse.access_token, user);
    },
  });
}

export function useLogin() {
  const { setAccessToken, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      const user = await authApi.me();
      setAuth(tokenResponse.access_token, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useMe() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    enabled: Boolean(accessToken),
    staleTime: 10 * 60 * 1000,
  });
}
