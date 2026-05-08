import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCartStore } from '@/features/cart/store/cartStore';
import { getApiErrorMessage, isApiError } from '@/shared/api/errors';
import { APP_ROUTES } from '@/shared/constants/routes';
import { usePaymentStatus } from '@/shared/hooks';
import { Button, LoadingState } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';
import type { PaymentStatusResponse, PublicOrderStatus } from '@/types';

const toneClasses = {
  good: 'border-green-100 bg-green-50 text-green-700',
  warn: 'border-yellow-100 bg-yellow-50 text-yellow-700',
  bad: 'border-red-100 bg-red-50 text-red-700',
  calm: 'border-gray-100 bg-gray-50 text-gray-700',
};

const orderStatusLabels: Record<PublicOrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparacion',
  ready: 'Listo',
  dispatched: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  voided: 'Anulado',
};
const supportContactHref = 'mailto:contacto@yakero.cl?subject=Ayuda%20con%20pago%20Yakero';

type Tone = keyof typeof toneClasses;

function getView(status?: PaymentStatusResponse): {
  title: string;
  description: string;
  tone: Tone;
} {
  if (!status) {
    return {
      title: 'Buscando tu pago',
      description: 'Estamos consultando el estado de Mercado Pago.',
      tone: 'calm',
    };
  }

  if (status.checkout_session_status === 'amount_mismatch') {
    return {
      title: 'Diferencia de monto detectada',
      description: status.message,
      tone: 'bad',
    };
  }

  if (status.payment_status === 'rejected' || status.checkout_session_status === 'failed') {
    return {
      title: 'Pago rechazado',
      description: status.message,
      tone: 'bad',
    };
  }

  if (status.order_id) {
    return {
      title: 'Pago aprobado, pedido creado',
      description: status.message,
      tone: 'good',
    };
  }

  if (status.payment_status === 'approved') {
    return {
      title: 'Pago aprobado',
      description: status.message,
      tone: 'warn',
    };
  }

  if (status.payment_status === 'pending') {
    return {
      title: 'Pago pendiente',
      description: status.message,
      tone: 'warn',
    };
  }

  return {
    title: 'Esperando confirmacion del pago',
    description: status.message,
    tone: 'warn',
  };
}

function statusLabel(status?: PaymentStatusResponse) {
  if (!status) return 'Consultando';
  if (status.checkout_session_status === 'amount_mismatch') return 'Requiere revision';
  if (status.payment_status === 'rejected') return 'Rechazado';
  if (status.order_id) return 'Confirmado';
  if (status.payment_status === 'approved') return 'Aprobado';
  if (status.payment_status === 'pending') return 'Pendiente';
  return 'Esperando';
}

function isNotFoundError(error: unknown) {
  if (isApiError(error) && error.response?.status === 404) return true;
  return getApiErrorMessage(error).toLowerCase().includes('no encontrado');
}

export default function PaymentStatusPage() {
  const { externalReference } = useParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  const { data, error, isError, isLoading, refetch } = usePaymentStatus(externalReference);
  const view = useMemo(() => getView(data), [data]);

  useEffect(() => {
    if (data?.payment_status === 'approved' && data.order_id) {
      clearCart();
      window.sessionStorage.removeItem('yakero:last_checkout_reference');
    }
  }, [clearCart, data?.order_id, data?.payment_status]);

  if (!externalReference) {
    return (
      <PaymentStatusShell
        title="No encontramos la referencia"
        description="Mercado Pago no envio un identificador para consultar esta compra."
        tone="bad"
        onGoHome={() => navigate(APP_ROUTES.home)}
      />
    );
  }

  if (isLoading) {
    return <LoadingState fullScreen label="Consultando estado del pago..." />;
  }

  if (isError) {
    const notFound = isNotFoundError(error);

    return (
      <PaymentStatusShell
        title={notFound ? 'Pago no encontrado' : 'Error de conexion'}
        description={
          notFound
            ? 'No encontramos una compra asociada a esta referencia.'
            : 'No pudimos consultar el estado. Revisa tu conexion e intenta nuevamente.'
        }
        tone="bad"
        onContact={notFound ? () => window.location.assign(supportContactHref) : undefined}
        onGoHome={() => navigate(APP_ROUTES.home)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <PaymentStatusShell
      title={view.title}
      description={view.description}
      tone={view.tone}
      reference={externalReference}
      statusLabel={statusLabel(data)}
      status={data}
      onContact={
        data?.checkout_session_status === 'amount_mismatch'
          ? () => window.location.assign(supportContactHref)
          : undefined
      }
      onGoHome={() => navigate(APP_ROUTES.home)}
      onRetryPayment={
        data?.payment_status === 'rejected' || data?.checkout_session_status === 'failed'
          ? () => navigate(APP_ROUTES.checkout)
          : undefined
      }
    />
  );
}

function PaymentStatusShell({
  description,
  onContact,
  onGoHome,
  onRetry,
  onRetryPayment,
  reference,
  status,
  statusLabel: label = 'Estado',
  title,
  tone,
}: {
  description: string;
  onContact?: () => void;
  onGoHome: () => void;
  onRetry?: () => void;
  onRetryPayment?: () => void;
  reference?: string;
  status?: PaymentStatusResponse;
  statusLabel?: string;
  title: string;
  tone: Tone;
}) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <main className="mx-auto flex max-w-xl flex-col gap-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}
          >
            {label}
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <dl className="space-y-3 text-sm">
            {reference ? <InfoRow label="Referencia" value={reference} /> : null}
            {status ? <InfoRow label="Total" value={formatCLP(status.total)} /> : null}
            {status?.order_id ? <InfoRow label="Pedido" value={`#${status.order_id}`} /> : null}
            {status?.order_status ? (
              <InfoRow label="Estado pedido" value={orderStatusLabels[status.order_status]} />
            ) : null}
          </dl>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onRetry ? <Button onClick={onRetry}>Reintentar consulta</Button> : null}
          {onRetryPayment ? <Button onClick={onRetryPayment}>Reintentar pago</Button> : null}
          {onContact ? (
            <Button onClick={onContact} variant="secondary">
              Contactar a Yakero
            </Button>
          ) : null}
          <Button onClick={onGoHome} variant="ghost">
            Volver al inicio
          </Button>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="break-all text-right font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
