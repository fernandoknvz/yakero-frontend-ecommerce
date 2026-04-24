import type { Product } from '@/types';

import { APP_ROUTES } from '@/shared/constants/routes';
import { formatCLP } from '@/shared/utils/format';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const navigate = useNavigate();
  const hasModifiers = product.modifier_groups.length > 0;

  return (
    <button
      onClick={() => {
        if (onSelect) {
          onSelect();
          return;
        }

        navigate(APP_ROUTES.product(product.id));
      }}
      className={`flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition-all active:scale-[0.98] ${
        !product.is_available ? 'opacity-75' : 'hover:shadow-md'
      }`}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
        {product.image_url ? (
          <img alt={product.name} className="h-full w-full object-cover" src={product.image_url} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
            □
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{product.name}</h3>
        {product.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{product.description}</p>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-bold text-brand">{formatCLP(product.price)}</span>
          {!product.is_available ? (
            <span className="text-xs font-semibold text-red-500">No disponible</span>
          ) : hasModifiers ? (
            <span className="text-xs text-gray-400">Personalizable</span>
          ) : null}
        </div>
      </div>

      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-lg font-light text-white">
        {product.is_available ? '+' : 'i'}
      </div>
    </button>
  );
}
