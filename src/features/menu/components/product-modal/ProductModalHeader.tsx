import type { Product } from '@/types';

import { formatCLP } from '@/shared/utils/format';

export function ProductModalHeader({
  onClose,
  product,
}: {
  onClose: () => void;
  product: Product;
}) {
  return (
    <>
      {product.image_url ? (
        <img alt={product.name} className="h-48 w-full object-cover" src={product.image_url} />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
          □
        </div>
      )}

      <button
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700"
        onClick={onClose}
        type="button"
      >
        x
      </button>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        {product.description ? (
          <p className="text-sm text-gray-500">{product.description}</p>
        ) : null}
        <p className="text-lg font-bold text-brand">{formatCLP(product.price)}</p>
      </div>
    </>
  );
}
