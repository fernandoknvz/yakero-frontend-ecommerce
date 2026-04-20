import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { CartItem, Product, Promotion, SelectedModifier } from '../types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  pointsToUse: number;

  // Acciones
  addProduct: (
    product: Product,
    quantity: number,
    selectedModifiers: SelectedModifier[],
    notes?: string
  ) => void;
  addPromotion: (
    promotion: Promotion,
    slotId: number,
    selectedModifiers: SelectedModifier[],
    notes?: string
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  setPoints: (points: number) => void;
  clearCart: () => void;

  // Computed (como getters)
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      pointsToUse: 0,

      addProduct: (product, quantity, selectedModifiers, notes) => {
        const extraPrice = selectedModifiers.reduce((acc, m) => acc + m.extra_price, 0);
        const unit_price = product.price + extraPrice;

        // Si existe el mismo producto con los mismos modificadores → sumar cantidad
        const existing = get().items.find(
          (i) =>
            i.product?.id === product.id &&
            JSON.stringify(i.selected_modifiers.map((m) => m.modifier_option_id).sort()) ===
            JSON.stringify(selectedModifiers.map((m) => m.modifier_option_id).sort())
        );

        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.cartItemId === existing.cartItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                cartItemId: uuid(),
                product,
                quantity,
                unit_price,
                selected_modifiers: selectedModifiers,
                notes,
              },
            ],
          }));
        }
      },

      addPromotion: (promotion, slotId, selectedModifiers, notes) => {
        set((state) => ({
          items: [
            ...state.items,
            {
              cartItemId: uuid(),
              promotion,
              promotion_slot_id: slotId,
              quantity: 1,
              unit_price: promotion.value,
              selected_modifiers: selectedModifiers,
              notes,
            },
          ],
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        }));
      },

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      setCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      setPoints: (points) => set({ pointsToUse: points }),

      clearCart: () =>
        set({ items: [], couponCode: null, couponDiscount: 0, pointsToUse: 0 }),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'yakero_cart' }
  )
);
