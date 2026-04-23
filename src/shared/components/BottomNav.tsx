import { useLocation, useNavigate } from 'react-router-dom';

import { useCartStore } from '@/features/cart/store/cartStore';
import { APP_ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { path: APP_ROUTES.home, icon: '⌂', label: 'Inicio' },
  { path: APP_ROUTES.accountOrders, icon: '□', label: 'Pedidos', requiresAuth: true },
  { path: APP_ROUTES.account, icon: '◌', label: 'Perfil', requiresAuth: true },
  { path: APP_ROUTES.login, icon: '◍', label: 'Ingresar', guestOnly: true },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { itemCount } = useCartStore();
  const count = itemCount();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.guestOnly && isAuthenticated) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const active = pathname === item.path;

          return (
            <button
              key={item.path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 transition-colors ${
                active ? 'text-brand' : 'text-gray-400'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="relative text-xl">
                {item.icon}
                {item.path === APP_ROUTES.home && count > 0 ? (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                ) : null}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-brand' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
