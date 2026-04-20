import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatCLP } from '../../../shared/utils/format';
import type { CartItem } from '../../../types';

// ─── FAB ─────────────────────────────────────────────────────────────────────
export function CartFab() {
  const { itemCount, subtotal, items } = useCartStore();
  const [open, setOpen] = useState(false);
  const count = itemCount();

  if (count === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-40 active:scale-95 transition-transform"
      >
        <span className="bg-white text-red-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
        <span className="font-semibold">Ver carrito</span>
        <span className="font-bold">{formatCLP(subtotal())}</span>
      </button>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────
function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, subtotal, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-t-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              onRemove={() => removeItem(item.cartItemId)}
              onQtyChange={(q) => updateQuantity(item.cartItemId, q)}
            />
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCLP(subtotal())}</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            El costo de envío se calcula en el siguiente paso
          </p>
          <button
            onClick={handleCheckout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-base transition-colors"
          >
            Ir al checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onRemove,
  onQtyChange,
}: {
  item: CartItem;
  onRemove: () => void;
  onQtyChange: (q: number) => void;
}) {
  const name = item.product?.name ?? item.promotion?.name ?? 'Ítem';
  const modifiers = item.selected_modifiers.map((m) => m.option_name).join(', ');

  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
        {modifiers && (
          <p className="text-gray-400 text-xs mt-0.5 truncate">{modifiers}</p>
        )}
        {item.notes && (
          <p className="text-gray-400 text-xs italic mt-0.5">"{item.notes}"</p>
        )}
        <p className="text-red-600 font-bold text-sm mt-1">
          {formatCLP(item.unit_price * item.quantity)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onQtyChange(item.quantity - 1)}
          className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold"
        >
          {item.quantity === 1 ? '🗑' : '−'}
        </button>
        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
