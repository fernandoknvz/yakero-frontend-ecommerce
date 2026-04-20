import { useState, useEffect } from 'react';
import type { Product, ModifierGroup, SelectedModifier } from '../../../types';
import { useCartStore } from '../../cart/store/cartStore';
import { formatCLP } from '../../../shared/utils/format';

interface Props {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { addProduct } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Inicializar selecciones vacías
  useEffect(() => {
    const init: Record<number, number[]> = {};
    product.modifier_groups.forEach((g) => { init[g.id] = []; });
    setSelections(init);
  }, [product]);

  const toggleOption = (group: ModifierGroup, optionId: number) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.modifier_type === 'single') {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= group.max_selections) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
    // Limpiar error del grupo al seleccionar
    setErrors((prev) => { const e = { ...prev }; delete e[group.id]; return e; });
  };

  const validate = (): boolean => {
    const newErrors: Record<number, string> = {};
    product.modifier_groups.forEach((g) => {
      if (g.is_required && (selections[g.id]?.length ?? 0) < g.min_selections) {
        newErrors[g.id] = `Elige al menos ${g.min_selections} opción`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;

    const selectedModifiers: SelectedModifier[] = [];
    product.modifier_groups.forEach((group) => {
      (selections[group.id] ?? []).forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId)!;
        selectedModifiers.push({
          modifier_option_id: opt.id,
          option_name: opt.name,
          group_name: group.name,
          extra_price: opt.extra_price,
        });
      });
    });

    addProduct(product, quantity, selectedModifiers, notes || undefined);
    onClose();
  };

  const extraTotal = Object.values(selections)
    .flat()
    .reduce((acc, optId) => {
      for (const g of product.modifier_groups) {
        const opt = g.options.find((o) => o.id === optId);
        if (opt) return acc + opt.extra_price;
      }
      return acc;
    }, 0);

  const unitPrice = product.price + extraTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden">
        {/* Image */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-4xl">
            🍱
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 text-gray-700"
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="text-gray-500 text-sm mt-1">{product.description}</p>
            )}
            <p className="text-red-600 font-bold text-lg mt-2">{formatCLP(product.price)}</p>
          </div>

          {/* Modifier groups */}
          {product.modifier_groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{group.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  group.is_required
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {group.is_required ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>
              {errors[group.id] && (
                <p className="text-red-500 text-xs mb-2">{errors[group.id]}</p>
              )}
              <div className="space-y-2">
                {group.options.filter((o) => o.is_available).map((opt) => {
                  const selected = selections[group.id]?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group, opt.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors text-left ${
                        selected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-800">{opt.name}</span>
                      <div className="flex items-center gap-2">
                        {opt.extra_price > 0 && (
                          <span className="text-sm text-gray-500">+{formatCLP(opt.extra_price)}</span>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                        }`}>
                          {selected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sin cebolla, extra salsa..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {/* Quantity */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-xl font-bold flex items-center justify-center"
            >
              −
            </button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-xl font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-base transition-colors"
          >
            Agregar al carrito — {formatCLP(unitPrice * quantity)}
          </button>
        </div>
      </div>
    </div>
  );
}
