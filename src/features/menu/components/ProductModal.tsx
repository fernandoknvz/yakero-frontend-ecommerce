import { useCartStore } from '@/features/cart/store/cartStore';
import { useToast } from '@/shared/toast';
import type { Product } from '@/types';

import { ProductConfigurator } from './ProductConfigurator';
import { ProductModalHeader } from './product-modal/ProductModalHeader';

interface ProductModalProps {
  onClose: () => void;
  product: Product;
}

export function ProductModal({ onClose, product }: ProductModalProps) {
  const { addProduct } = useCartStore();
  const { pushToast } = useToast();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        type="button"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white md:rounded-3xl">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <ProductModalHeader onClose={onClose} product={product} />

          <ProductConfigurator
            onAdd={({ notes, quantity, selectedModifiers }) => {
              addProduct(product, quantity, selectedModifiers, notes);
              pushToast({
                tone: 'success',
                title: 'Producto agregado',
                description: `${product.name} ya esta en tu carrito.`,
              });
              onClose();
            }}
            product={product}
          />
        </div>
      </div>
    </div>
  );
}
