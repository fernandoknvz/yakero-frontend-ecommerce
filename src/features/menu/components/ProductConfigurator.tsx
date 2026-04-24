import { FormTextarea } from '@/shared/forms';
import { Button } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';
import type { Product, SelectedModifier } from '@/types';

import { ProductModifierGroup } from './product-modal/ProductModifierGroup';
import { useProductConfiguration } from './product-modal/useProductConfiguration';

interface ProductConfiguratorProps {
  product: Product;
  onAdd: (data: {
    quantity: number;
    selectedModifiers: SelectedModifier[];
    notes?: string;
    unitPrice: number;
  }) => void;
  submitLabel?: string;
}

export function ProductConfigurator({
  onAdd,
  product,
  submitLabel = 'Agregar al carrito',
}: ProductConfiguratorProps) {
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

  const totalPrice = unitPrice * quantity;
  const hasRequiredGroups = product.modifier_groups.some((group) => group.is_required);

  const handleAdd = () => {
    if (!validate()) return;

    onAdd({
      quantity,
      selectedModifiers,
      notes: notes.trim() || undefined,
      unitPrice,
    });
  };

  return (
    <div className="space-y-5">
      {product.modifier_groups.length ? (
        <section className="space-y-4" aria-label="Modificadores del producto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Personaliza tu producto</h2>
              <p className="mt-1 text-sm text-gray-500">
                {hasRequiredGroups
                  ? 'Completa las opciones obligatorias antes de agregarlo.'
                  : 'Puedes sumar extras opcionales si quieres.'}
              </p>
            </div>
          </div>

          {product.modifier_groups.map((group) => (
            <ProductModifierGroup
              key={group.id}
              error={errors[group.id]}
              group={group}
              onToggle={(optionId) => toggleOption(group, optionId)}
              selectedOptions={selections[group.id] ?? []}
            />
          ))}
        </section>
      ) : null}

      <FormTextarea
        label="Notas"
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Sin cebolla, extra salsa..."
        rows={2}
        value={notes}
      />

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Precio base</span>
          <span>{formatCLP(product.price)}</span>
        </div>
        {selectedModifiers.length ? (
          <div className="mt-2 space-y-1">
            {selectedModifiers.map((modifier) => (
              <div
                key={`${modifier.group_name}-${modifier.modifier_option_id}`}
                className="flex items-center justify-between text-sm text-gray-600"
              >
                <span>{modifier.option_name}</span>
                <span>+{formatCLP(modifier.extra_price)}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
          <span>Total</span>
          <span className="text-brand">{formatCLP(totalPrice)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white">
        <div className="flex items-center gap-3">
          <button
            aria-label="Disminuir cantidad"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 disabled:text-gray-300"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            -
          </button>
          <span className="w-8 text-center text-xl font-bold">{quantity}</span>
          <button
            aria-label="Aumentar cantidad"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700"
            onClick={() => setQuantity((current) => current + 1)}
            type="button"
          >
            +
          </button>
        </div>

        <Button className="flex-1" disabled={!product.is_available} onClick={handleAdd}>
          {submitLabel} - {formatCLP(totalPrice)}
        </Button>
      </div>
    </div>
  );
}
