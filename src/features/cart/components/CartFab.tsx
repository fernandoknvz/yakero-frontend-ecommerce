import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CartItem } from '@/types';

import { APP_ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';

import { useCartStore } from '../store/cartStore';

export function CartFab() {
  const { itemCount, subtotal } = useCartStore();
  const [open, setOpen] = useState(false);
  const count = itemCount();

  if (count === 0) return null;

  return (
    <>
      <button
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-brand px-6 py-3.5 text-white shadow-xl transition-transform active:scale-95"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-brand">
          {count}
        </span>
        <span className="font-semibold">Ver carrito</span>
        <span className="font-bold">{formatCLP(subtotal())}</span>
      </button>

      {open ? <CartDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, subtotal, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        type="button"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
          <Button className="h-10 w-10 rounded-full px-0" onClick={onClose} variant="ghost">
            x
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.map((item) => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              onQtyChange={(quantity) => updateQuantity(item.cartItemId, quantity)}
              onRemove={() => removeItem(item.cartItemId)}
            />
          ))}
        </div>

        <div className="space-y-3 border-t border-gray-100 p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCLP(subtotal())}</span>
          </div>
          <p className="text-center text-xs text-gray-400">
            El costo de envio se calcula en el siguiente paso.
          </p>
          <Button
            fullWidth
            onClick={() => {
              onClose();
              navigate(APP_ROUTES.checkout);
            }}
          >
            Ir al checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const name = item.product?.name ?? item.promotion?.name ?? 'Item';
  const modifiers = item.selected_modifiers.map((modifier) => modifier.option_name).join(', ');

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
        {modifiers ? <p className="mt-1 truncate text-xs text-gray-500">{modifiers}</p> : null}
        {item.notes ? (
          <p className="mt-1 text-xs italic text-gray-400">{`"${item.notes}"`}</p>
        ) : null}
        <p className="mt-2 text-sm font-bold text-brand">
          {formatCLP(item.unit_price * item.quantity)}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700"
          onClick={() => {
            if (item.quantity === 1) {
              onRemove();
              return;
            }

            onQtyChange(item.quantity - 1);
          }}
          type="button"
        >
          {item.quantity === 1 ? 'x' : '-'}
        </button>
        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700"
          onClick={() => onQtyChange(item.quantity + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
