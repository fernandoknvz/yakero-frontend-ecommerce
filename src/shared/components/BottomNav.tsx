import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../features/cart/store/cartStore';

const NAV_ITEMS = [
  { path: '/',               icon: '🏠', label: 'Inicio' },
  { path: '/account/orders', icon: '📦', label: 'Pedidos', requiresAuth: true },
  { path: '/account',        icon: '👤', label: 'Perfil',  requiresAuth: true },
  { path: '/login',          icon: '👤', label: 'Ingresar', guestOnly: true },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {visibleItems.map((item) => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                active ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl relative">
                {item.icon}
                {item.path === '/' && count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-red-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}