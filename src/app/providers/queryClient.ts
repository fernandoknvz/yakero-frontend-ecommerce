import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';

type Notify = (message: string) => void;

export function createAppQueryClient(notifyError: Notify) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        notifyError(getApiErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        notifyError(getApiErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
}
