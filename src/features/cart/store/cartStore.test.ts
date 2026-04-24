import { beforeEach, describe, expect, it } from 'vitest';

import type { Product } from '@/types';

import { useCartStore } from './cartStore';

const product: Product = {
  category_id: 1,
  description: 'Roll',
  id: 1,
  image_url: '',
  is_available: true,
  modifier_groups: [],
  name: 'California Roll',
  price: 5990,
  slug: 'california-roll',
  ticket_tag: 'cocina_sushi',
};

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds, updates and removes products', () => {
    useCartStore.getState().addProduct(product, 2, [], undefined);

    expect(useCartStore.getState().itemCount()).toBe(2);
    expect(useCartStore.getState().subtotal()).toBe(11980);

    const cartItemId = useCartStore.getState().items[0].cartItemId;
    useCartStore.getState().updateQuantity(cartItemId, 3);

    expect(useCartStore.getState().itemCount()).toBe(3);
    expect(useCartStore.getState().subtotal()).toBe(17970);

    useCartStore.getState().removeItem(cartItemId);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
