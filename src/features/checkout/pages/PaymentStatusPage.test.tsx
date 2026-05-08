import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartStore } from '@/features/cart/store/cartStore';
import { ToastProvider } from '@/shared/toast';
import type { PaymentStatusResponse, Product } from '@/types';

import PaymentStatusPage from './PaymentStatusPage';

let mockPaymentStatus: {
  data?: PaymentStatusResponse;
  error?: Error;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
};

vi.mock('@/shared/hooks', () => ({
  usePaymentStatus: () => mockPaymentStatus,
}));

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

function renderStatusPage(route = '/payment/status/ref-123') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/payment/status/:externalReference" element={<PaymentStatusPage />} />
            <Route path="*" element={<PaymentStatusPage />} />
          </Routes>
        </QueryClientProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

function status(overrides: Partial<PaymentStatusResponse>): PaymentStatusResponse {
  return {
    checkout_session_status: 'pending',
    created_at: '2026-05-08T12:00:00Z',
    external_reference: 'ref-123',
    message: 'Estamos esperando la confirmacion de Mercado Pago.',
    order_id: null,
    order_status: null,
    payment_status: null,
    total: 5990,
    updated_at: '2026-05-08T12:00:00Z',
    ...overrides,
  };
}

describe('PaymentStatusPage', () => {
  beforeEach(() => {
    mockPaymentStatus = {
      data: status({}),
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    };
    useCartStore.getState().clearCart();
  });

  it('shows waiting state for a pending guest payment', () => {
    renderStatusPage();

    expect(screen.getByText('Esperando confirmacion del pago')).toBeInTheDocument();
    expect(screen.getByText('ref-123')).toBeInTheDocument();
    expect(screen.getByText('$5.990')).toBeInTheDocument();
  });

  it('guest can view public tracking without login', () => {
    renderStatusPage('/payment/status/guest-reference');

    expect(screen.getByText('Esperando confirmacion del pago')).toBeInTheDocument();
    expect(screen.getByText('guest-reference')).toBeInTheDocument();
  });

  it('approved with order_id clears cart', async () => {
    useCartStore.getState().addProduct(product, 1, [], undefined);
    expect(useCartStore.getState().itemCount()).toBe(1);
    mockPaymentStatus.data = status({
      checkout_session_status: 'paid',
      message: 'Pago aprobado. Tu pedido fue creado.',
      order_id: 77,
      order_status: 'confirmed',
      payment_status: 'approved',
    });

    renderStatusPage();

    expect(screen.getByText('Pago aprobado, pedido creado')).toBeInTheDocument();
    await waitFor(() => expect(useCartStore.getState().itemCount()).toBe(0));
  });

  it('failure does not clear cart and allows retry', () => {
    useCartStore.getState().addProduct(product, 1, [], undefined);
    mockPaymentStatus.data = status({
      checkout_session_status: 'failed',
      message: 'El pago fue rechazado.',
      payment_status: 'rejected',
    });

    renderStatusPage();

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar pago' })).toBeInTheDocument();
    expect(useCartStore.getState().itemCount()).toBe(1);
  });

  it('amount mismatch shows contact action and keeps cart', () => {
    useCartStore.getState().addProduct(product, 1, [], undefined);
    mockPaymentStatus.data = status({
      checkout_session_status: 'amount_mismatch',
      message: 'Detectamos una diferencia en el monto aprobado.',
      payment_status: 'amount_mismatch',
    });

    renderStatusPage();

    expect(screen.getByText('Diferencia de monto detectada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contactar a Yakero' })).toBeInTheDocument();
    expect(useCartStore.getState().itemCount()).toBe(1);
  });

  it('missing external reference shows a controlled error', () => {
    renderStatusPage('/payment/status');

    expect(screen.getByText('No encontramos la referencia')).toBeInTheDocument();
  });

  it('not found response shows a controlled error', () => {
    mockPaymentStatus = {
      error: new Error('Checkout no encontrado.'),
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    };

    renderStatusPage();

    expect(screen.getByText('Pago no encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar consulta' })).toBeInTheDocument();
  });
});
