import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';

import { PaymentFailurePage, PaymentSuccessPage } from './PaymentResultPages';

describe('PaymentResultPages', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('success page reads external_reference and offers public tracking', () => {
    renderWithProviders(<PaymentSuccessPage />, {
      route: '/checkout/success?external_reference=checkout-session-321',
    });

    expect(screen.getByText('Estamos confirmando tu pago')).toBeInTheDocument();
    expect(screen.getByText('checkout-session-321')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver estado de mi compra' })).toBeInTheDocument();
    expect(screen.queryByText(/Mis pedidos/i)).not.toBeInTheDocument();
  });

  it('failure page keeps retry available without assuming an order exists', () => {
    renderWithProviders(<PaymentFailurePage />, {
      route: '/checkout/failure?external_reference=checkout-session-321',
    });

    expect(screen.getByText('Pago no completado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar pago' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver estado de mi compra' })).toBeInTheDocument();
  });

  it('shows a controlled message when Mercado Pago returns without reference', () => {
    renderWithProviders(<PaymentSuccessPage />, {
      route: '/checkout/success',
    });

    expect(screen.getByText(/retorno sin referencia publica/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver estado de mi compra' })
    ).not.toBeInTheDocument();
  });
});
