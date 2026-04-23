import { useCartStore } from '@/features/cart/store/cartStore';
import { FormTextarea } from '@/shared/forms';
import type { Product } from '@/types';

import { ProductModalFooter } from './product-modal/ProductModalFooter';
import { ProductModalHeader } from './product-modal/ProductModalHeader';
import { ProductModifierGroup } from './product-modal/ProductModifierGroup';
import { useProductConfiguration } from './product-modal/useProductConfiguration';

interface ProductModalProps {
  onClose: () => void;
  product: Product;
}

export function ProductModal({ onClose, product }: ProductModalProps) {
  const { addProduct } = useCartStore();
  const {
    errors,
    notes,
    quantity,
    selectedModifiers,
    selections,
    setNotes,
    setQuantity,
    toggleOption,
    unitPrice,
    validate,
  } = useProductConfiguration(product);

  const handleAdd = () => {
    if (!validate()) return;

    addProduct(product, quantity, selectedModifiers, notes || undefined);
    onClose();
  };

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

          {product.modifier_groups.map((group) => (
            <ProductModifierGroup
              key={group.id}
              error={errors[group.id]}
              group={group}
              onToggle={(optionId) => toggleOption(group, optionId)}
              selectedOptions={selections[group.id] ?? []}
            />
          ))}

          <FormTextarea
            label="Notas"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Sin cebolla, extra salsa..."
            rows={2}
            value={notes}
          />
        </div>

        <ProductModalFooter
          onAdd={handleAdd}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() => setQuantity((current) => current + 1)}
          quantity={quantity}
          totalPrice={unitPrice * quantity}
        />
      </div>
    </div>
  );
}
