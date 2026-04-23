import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

import { ToastProvider, useToast } from '@/shared/toast';

import { createAppQueryClient } from './queryClient';

function QueryProvider({ children }: PropsWithChildren) {
  const { pushToast } = useToast();
  const [queryClient] = useState(() =>
    createAppQueryClient((message) => {
      pushToast({
        tone: 'error',
        title: 'Ocurrio un error',
        description: message,
      });
    })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <QueryProvider>{children}</QueryProvider>
    </ToastProvider>
  );
}
