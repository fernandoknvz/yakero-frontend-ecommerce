import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartStore } from '@/features/cart/store/cartStore';
import { renderWithProviders } from '@/test/testUtils';
import { useAuthStore } from '@/stores/authStore';
import type { Product } from '@/types';

import CheckoutPage from './CheckoutPage';

const mockCreateOrder = vi.fn();
const mockCreatePaymentPreference = vi.fn();

type PreviewState = {
  data?: {
    delivery_fee: number;
    discount: number;
    items: Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      selected_modifiers: [];
      total_price: number;
    }>;
    subtotal: number;
    total: number;
  };
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
};

let mockPreviewState: PreviewState = {
  data: {
    delivery_fee: 0,
    discount: 0,
    items: [
      {
        product_id: 1,
        product_name: 'California Roll',
        quantity: 1,
        selected_modifiers: [],
        total_price: 5990,
      },
    ],
    subtotal: 5990,
    total: 5990,
  },
  error: null,
  isError: false,
  isFetching: false,
};

vi.mock('@/shared/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/shared/hooks')>('@/shared/hooks');

  return {
    ...actual,
    useAddresses: () => ({ data: [] }),
    useCreateOrder: () => ({ isPending: false, mutateAsync: mockCreateOrder }),
    useCreatePaymentPreference: () => ({
      isPending: false,
      mutateAsync: mockCreatePaymentPreference,
    }),
    useDeliveryFee: () => ({ data: undefined }),
    useOrderPreview: () => mockPreviewState,
    useValidateCoupon: () => ({ isPending: false, mutateAsync: vi.fn() }),
  };
});

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

describe('CheckoutPage', () => {
  beforeEach(() => {
    mockCreateOrder.mockReset();
    mockCreatePaymentPreference.mockReset();
    mockCreatePaymentPreference.mockResolvedValue({
      external_reference: 'checkout-session-123',
      init_point: 'https://www.mercadopago.cl/checkout',
      preference_id: 'pref-123',
      sandbox_init_point: 'https://sandbox.mercadopago.cl/checkout',
    });
    mockPreviewState = {
      data: {
        delivery_fee: 0,
        discount: 0,
        items: [
          {
            product_id: 1,
            product_name: 'California Roll',
            quantity: 1,
            selected_modifiers: [],
            total_price: 5990,
          },
        ],
        subtotal: 5990,
        total: 5990,
      },
      error: null,
      isError: false,
      isFetching: false,
    };
    useAuthStore.setState({ accessToken: null, isAuthenticated: false, user: null });
    useCartStore.getState().clearCart();
    useCartStore.getState().addProduct(product, 1, [], undefined);
  });

  it('validates required guest email before submitting', async () => {
    renderWithProviders(<CheckoutPage />);

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }));

    expect(
      await screen.findByText('Ingresa un email valido para confirmar el pedido.')
    ).toBeInTheDocument();
  });

  it('shows backend preview totals', () => {
    renderWithProviders(<CheckoutPage />);

    expect(screen.getAllByText('$5.990').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /pagar \$5.990/i })).toBeInTheDocument();
  });

  it('blocks submit when preview fails', async () => {
    mockPreviewState = {
      data: undefined,
      error: new Error('Producto no disponible'),
      isError: true,
      isFetching: false,
    };

    renderWithProviders(<CheckoutPage />);

    expect(screen.getByText('Producto no disponible')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pagar/i })).toBeDisabled();
  });

  it('creates a payment preference without creating an order and redirects to sandbox', async () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });

    renderWithProviders(<CheckoutPage />);

    await userEvent.type(screen.getByLabelText('Email para confirmacion'), 'buyer@example.com');
    await userEvent.click(screen.getByRole('button', { name: /pagar/i }));

    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockCreatePaymentPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        delivery_type: 'retiro',
        guest_email: 'buyer@example.com',
        items: [
          expect.objectContaining({
            product_id: 1,
            quantity: 1,
          }),
        ],
      })
    );
    expect(assign).toHaveBeenCalledWith('https://sandbox.mercadopago.cl/checkout');
  });
});
