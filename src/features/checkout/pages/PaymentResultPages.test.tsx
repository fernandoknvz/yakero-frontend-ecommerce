import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';

import { PaymentFailurePage, PaymentSuccessPage } from './PaymentResultPages';

describe('PaymentResultPages', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('success page reads external_reference and explains webhook confirmation', () => {
    renderWithProviders(<PaymentSuccessPage />, {
      route: '/checkout/success?external_reference=checkout-session-321',
    });

    expect(screen.getByText('Estamos confirmando tu pago')).toBeInTheDocument();
    expect(screen.getByText('checkout-session-321')).toBeInTheDocument();
    expect(screen.getByText(/pedido aparecera en Mis pedidos/i)).toBeInTheDocument();
  });

  it('failure page does not offer retrying an old order payment', () => {
    renderWithProviders(<PaymentFailurePage />, {
      route: '/checkout/failure?external_reference=checkout-session-321',
    });

    expect(screen.getByText('Pago no completado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar pago' })).not.toBeInTheDocument();
  });
});
