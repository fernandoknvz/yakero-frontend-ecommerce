import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../shared/components/BottomNav';

// Rutas donde NO se muestra la barra de navegación inferior
const HIDE_NAV = ['/checkout', '/login', '/register', '/checkout/success', '/checkout/failure', '/checkout/pending'];

export default function AppLayout() {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV.some((p) => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      {showNav && <BottomNav />}
    </div>
  );
}
