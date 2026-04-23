import { Outlet, useLocation } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/routes';

import { BottomNav } from '../shared/components/BottomNav';

const hiddenNavRoutes = [
  APP_ROUTES.checkout,
  APP_ROUTES.login,
  APP_ROUTES.register,
  '/checkout/success',
  '/checkout/failure',
  '/checkout/pending',
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const showNav = !hiddenNavRoutes.some((route) => pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Outlet />
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
