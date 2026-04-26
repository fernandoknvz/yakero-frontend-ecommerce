import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/ui';
import type { PaymentStatus } from '@/types';

type ResultTone = 'success' | 'failure' | 'pending';

function paymentStatusLabel(status?: PaymentStatus | string) {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    rechazado: 'Rechazado',
    reembolso: 'Reembolsado',
    pending: 'Pendiente',
    paid: 'Pagado',
    rejected: 'Rechazado',
  };

  return status ? (labels[status] ?? status) : 'Sin informacion';
}

function ResultLayout({
  description,
  onGoHome,
  onViewOrders,
  reference,
  title,
  tone,
}: {
  description: string;
  onGoHome: () => void;
  onViewOrders: () => void;
  reference?: string | null;
  title: string;
  tone: ResultTone;
}) {
  const toneClasses: Record<ResultTone, string> = {
    success: 'bg-green-50 text-green-700',
    failure: 'bg-red-50 text-red-700',
    pending: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 rounded-full px-4 py-2 text-sm font-semibold ${toneClasses[tone]}`}
        >
          {paymentStatusLabel(
            tone === 'success' ? 'pagado' : tone === 'failure' ? 'rechazado' : 'pendiente'
          )}
        </div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">{description}</p>
        {reference ? (
          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3 py-1 text-gray-600">
              <span>Referencia</span>
              <span className="break-all text-right font-semibold text-gray-900">{reference}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-3">
          <Button fullWidth onClick={onViewOrders}>
            Ver mis pedidos
          </Button>
          <Button fullWidth onClick={onGoHome} variant="ghost">
            Volver al menu
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentResultPage({
  kind,
  missingOrderDescription,
}: {
  kind: ResultTone;
  missingOrderDescription: string;
}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reference =
    params.get('external_reference') ??
    window.sessionStorage.getItem('yakero:last_checkout_reference');

  const copy = useMemo(() => {
    if (kind === 'success') {
      return {
        title: 'Estamos confirmando tu pago',
        description:
          'Mercado Pago nos redirigio correctamente. Cuando el webhook apruebe el pago, el pedido aparecera en Mis pedidos.',
      };
    }

    if (kind === 'failure') {
      return {
        title: 'Pago no completado',
        description:
          'Mercado Pago no completo el cobro. No se creo ningun pedido; puedes volver al menu e iniciar una compra nueva.',
      };
    }

    return {
      title: 'Pago pendiente',
      description:
        'Tu pago esta pendiente de confirmacion. El pedido aparecera en Mis pedidos solo cuando el backend reciba la aprobacion.',
    };
  }, [kind]);

  return (
    <ResultLayout
      tone={kind}
      title={copy.title}
      description={reference ? copy.description : missingOrderDescription}
      onGoHome={() => navigate(APP_ROUTES.home)}
      onViewOrders={() => navigate(APP_ROUTES.accountOrders)}
      reference={reference}
    />
  );
}

export function PaymentSuccessPage() {
  return (
    <PaymentResultPage
      kind="success"
      missingOrderDescription="Mercado Pago retorno sin identificador de orden. Revisa tus pedidos para confirmar el estado."
    />
  );
}

export function PaymentFailurePage() {
  return (
    <PaymentResultPage
      kind="failure"
      missingOrderDescription="Mercado Pago retorno sin identificador de orden. Puedes volver al checkout si tu carrito sigue disponible."
    />
  );
}

export function PaymentPendingPage() {
  return (
    <PaymentResultPage
      kind="pending"
      missingOrderDescription="Mercado Pago retorno sin identificador de orden. Revisa tus pedidos para confirmar el estado."
    />
  );
}
