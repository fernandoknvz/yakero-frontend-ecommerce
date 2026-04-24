import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';

import { PaymentFailurePage, PaymentSuccessPage } from './PaymentResultPages';

const mockCreatePreference = vi.fn();
let mockOrderState = {
  data: {
    delivery_fee: 0,
    discount: 0,
    delivery_type: 'retiro',
    id: 321,
    items: [],
    payment_status: 'pagado',
    status: 'pendiente',
    subtotal: 5990,
    total: 5990,
    created_at: '',
  },
  error: null,
  isError: false,
  isLoading: false,
};

vi.mock('@/shared/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/shared/hooks')>('@/shared/hooks');

  return {
    ...actual,
    useCreatePaymentPreference: () => ({
      isPending: false,
      mutateAsync: mockCreatePreference,
    }),
    useOrder: vi.fn(() => mockOrderState),
  };
});

describe('PaymentResultPages', () => {
  beforeEach(() => {
    mockCreatePreference.mockReset();
    mockCreatePreference.mockResolvedValue({
      init_point: 'https://www.mercadopago.cl/checkout',
      order_id: 321,
      preference_id: 'pref-321',
      sandbox_init_point: 'https://sandbox.mercadopago.cl/checkout',
    });
    mockOrderState = {
      data: {
        delivery_fee: 0,
        discount: 0,
        delivery_type: 'retiro',
        id: 321,
        items: [],
        payment_status: 'pagado',
        status: 'pendiente',
        subtotal: 5990,
        total: 5990,
        created_at: '',
      },
      error: null,
      isError: false,
      isLoading: false,
    };
  });

  it('success page reads order_id and renders order status', () => {
    renderWithProviders(<PaymentSuccessPage />, { route: '/checkout/success?order_id=321' });

    expect(screen.getByText('Pago exitoso')).toBeInTheDocument();
    expect(screen.getByText('#321')).toBeInTheDocument();
    expect(screen.getByText('$5.990')).toBeInTheDocument();
  });

  it('failure page allows retrying payment for an unpaid order', async () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });
    mockOrderState = {
      ...mockOrderState,
      data: {
        ...mockOrderState.data,
        payment_status: 'rechazado',
      },
    };

    renderWithProviders(<PaymentFailurePage />, { route: '/checkout/failure?order_id=321' });

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar pago' }));

    await waitFor(() => {
      expect(mockCreatePreference).toHaveBeenCalledWith({ order_id: 321 });
      expect(assign).toHaveBeenCalledWith('https://sandbox.mercadopago.cl/checkout');
    });
  });
});
