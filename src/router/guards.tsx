import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/shared/toast';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const { pushToast } = useToast();
  const didNotify = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !didNotify.current) {
      pushToast({
        tone: 'error',
        title: 'Acceso restringido',
        description: 'Inicia sesion para continuar.',
      });
      didNotify.current = true;
    }
  }, [isAuthenticated, pushToast]);

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={APP_ROUTES.login} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate replace to={APP_ROUTES.home} />;
  }

  return <Outlet />;
}
