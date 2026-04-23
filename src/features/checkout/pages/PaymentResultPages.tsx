import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button, LoadingState } from '@/shared/ui';

function ResultLayout({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const externalRef = params.get('external_reference');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (externalRef) {
        navigate(`/orders/${externalRef}`, { replace: true });
      } else {
        navigate('/account/orders', { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [externalRef, navigate]);

  return (
    <ResultLayout
      description="Tu pedido fue confirmado. Te llevamos al seguimiento automaticamente."
      title="Pago exitoso"
      action={<LoadingState label="Preparando seguimiento..." />}
    />
  );
}

export function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <ResultLayout
      description="No pudimos procesar el pago. Tu carrito permanece guardado para reintentar."
      title="Pago no completado"
      action={
        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => navigate('/checkout')}>
            Reintentar pago
          </Button>
          <Button fullWidth onClick={() => navigate('/')} variant="secondary">
            Volver al menu
          </Button>
        </div>
      }
    />
  );
}

export function PaymentPendingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const externalRef = params.get('external_reference');

  return (
    <ResultLayout
      description="Tu pago esta en revision. Puedes seguir el estado del pedido mientras se confirma."
      title="Pago pendiente"
      action={
        externalRef ? (
          <Button onClick={() => navigate(`/orders/${externalRef}`)}>Ver estado del pedido</Button>
        ) : undefined
      }
    />
  );
}
