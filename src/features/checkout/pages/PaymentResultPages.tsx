import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/ui';

type ResultTone = 'success' | 'failure' | 'pending';

function resolveExternalReference(params: URLSearchParams) {
  return (
    params.get('external_reference') ??
    params.get('collection_external_reference') ??
    window.sessionStorage.getItem('yakero:last_checkout_reference')
  );
}

function ResultLayout({
  description,
  onGoHome,
  onRetryPayment,
  onTrackPayment,
  reference,
  title,
  tone,
}: {
  description: string;
  onGoHome: () => void;
  onRetryPayment?: () => void;
  onTrackPayment?: () => void;
  reference?: string | null;
  title: string;
  tone: ResultTone;
}) {
  const toneClasses: Record<ResultTone, string> = {
    success: 'bg-green-50 text-green-700',
    failure: 'bg-red-50 text-red-700',
    pending: 'bg-yellow-50 text-yellow-700',
  };
  const labels: Record<ResultTone, string> = {
    success: 'Confirmando',
    failure: 'No completado',
    pending: 'Pendiente',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${toneClasses[tone]}`}
        >
          {labels[tone]}
        </div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
        {reference ? (
          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3 py-1 text-gray-600">
              <span>Referencia</span>
              <span className="break-all text-right font-semibold text-gray-900">{reference}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-3">
          {onTrackPayment ? (
            <Button fullWidth onClick={onTrackPayment}>
              Ver estado de mi compra
            </Button>
          ) : null}
          {onRetryPayment ? (
            <Button fullWidth onClick={onRetryPayment} variant="secondary">
              Reintentar pago
            </Button>
          ) : null}
          <Button fullWidth onClick={onGoHome} variant="ghost">
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentResultPage({
  kind,
  missingReferenceDescription,
}: {
  kind: ResultTone;
  missingReferenceDescription: string;
}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reference = resolveExternalReference(params);

  const copy = useMemo(() => {
    if (kind === 'success') {
      return {
        title: 'Estamos confirmando tu pago',
        description:
          'Mercado Pago nos redirigio correctamente. Consulta el seguimiento para saber cuando el pedido quede creado.',
      };
    }

    if (kind === 'failure') {
      return {
        title: 'Pago no completado',
        description:
          'Mercado Pago no completo el cobro. No limpiaremos tu carrito para que puedas revisar e intentar nuevamente.',
      };
    }

    return {
      title: 'Pago pendiente',
      description: 'Tu pago esta pendiente de confirmacion. Puedes seguir esta compra sin login.',
    };
  }, [kind]);

  return (
    <ResultLayout
      tone={kind}
      title={copy.title}
      description={reference ? copy.description : missingReferenceDescription}
      onGoHome={() => navigate(APP_ROUTES.home)}
      onRetryPayment={kind === 'failure' ? () => navigate(APP_ROUTES.checkout) : undefined}
      onTrackPayment={reference ? () => navigate(APP_ROUTES.paymentStatus(reference)) : undefined}
      reference={reference}
    />
  );
}

export function PaymentSuccessPage() {
  return (
    <PaymentResultPage
      kind="success"
      missingReferenceDescription="Mercado Pago retorno sin referencia publica. Si necesitas ayuda, contacta a Yakero con el comprobante de pago."
    />
  );
}

export function PaymentFailurePage() {
  return (
    <PaymentResultPage
      kind="failure"
      missingReferenceDescription="Mercado Pago retorno sin referencia publica. Puedes volver al checkout si tu carrito sigue disponible."
    />
  );
}

export function PaymentPendingPage() {
  return (
    <PaymentResultPage
      kind="pending"
      missingReferenceDescription="Mercado Pago retorno sin referencia publica. Si el cargo aparece en tu medio de pago, contacta a Yakero."
    />
  );
}
