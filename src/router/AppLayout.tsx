import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/routes';
import { APP_EVENT_AUTH_EXPIRED } from '@/shared/lib/appEvents';
import { useToast } from '@/shared/toast';

import { BottomNav } from '../shared/components/BottomNav';

const hiddenNavRoutes = [
  APP_ROUTES.checkout,
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.checkoutSuccess,
  APP_ROUTES.checkoutFailure,
  APP_ROUTES.checkoutPending,
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { pushToast } = useToast();
  const showNav = !hiddenNavRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    const handleAuthExpired = () => {
      pushToast({
        tone: 'error',
        title: 'Sesion vencida',
        description: 'Vuelve a iniciar sesion para continuar.',
      });

      if (pathname !== APP_ROUTES.login) {
        navigate(APP_ROUTES.login, { replace: true, state: { from: pathname } });
      }
    };

    window.addEventListener(APP_EVENT_AUTH_EXPIRED, handleAuthExpired);

    return () => {
      window.removeEventListener(APP_EVENT_AUTH_EXPIRED, handleAuthExpired);
    };
  }, [navigate, pathname, pushToast]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Outlet />
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
