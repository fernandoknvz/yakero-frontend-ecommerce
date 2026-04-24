import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_ROUTES } from '@/shared/constants/routes';
import { useCreatePaymentPreference, useOrder } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { Button, ErrorState, LoadingState } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';
import type { OrderOut, PaymentStatus } from '@/types';

type ResultTone = 'success' | 'failure' | 'pending';

function getOrderIdFromParams(params: URLSearchParams) {
  const rawOrderId = params.get('order_id') ?? params.get('external_reference');
  const orderId = Number(rawOrderId);
  return Number.isFinite(orderId) && orderId > 0 ? orderId : null;
}

function isPaidStatus(status?: PaymentStatus | string) {
  return status === 'pagado' || status === 'paid';
}

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
  action,
  children,
  description,
  title,
  tone,
}: {
  action?: ReactNode;
  children?: ReactNode;
  description: string;
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
        {children ? <div className="mt-5">{children}</div> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}

function OrderSummary({ order }: { order: OrderOut }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 text-left text-sm">
      <SummaryRow label="Orden" value={`#${order.id}`} />
      <SummaryRow label="Pago" value={paymentStatusLabel(order.payment_status)} />
      <SummaryRow label="Estado" value={String(order.status).replace(/_/g, ' ')} />
      <SummaryRow label="Total" value={formatCLP(order.total)} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-gray-600">
      <span>{label}</span>
      <span className="font-semibold capitalize text-gray-900">{value}</span>
    </div>
  );
}

function RetryPaymentButton({ orderId }: { orderId: number }) {
  const { pushToast } = useToast();
  const { mutateAsync: createPreference, isPending } = useCreatePaymentPreference();

  const handleRetry = async () => {
    try {
      const preference = await createPreference({ order_id: orderId });
      const paymentUrl = preference.sandbox_init_point || preference.init_point;

      if (!paymentUrl) {
        throw new Error('No recibimos una URL de pago valida.');
      }

      window.location.assign(paymentUrl);
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No pudimos reintentar el pago',
        description: getApiErrorMessage(error, 'Intenta nuevamente en unos minutos.'),
      });
    }
  };

  return (
    <Button disabled={isPending} fullWidth onClick={() => void handleRetry()}>
      {isPending ? 'Abriendo Mercado Pago...' : 'Reintentar pago'}
    </Button>
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
  const orderId = getOrderIdFromParams(params);
  const {
    data: order,
    error,
    isError,
    isLoading,
  } = useOrder(orderId ?? 0, kind === 'success' ? 4_000 : 15_000);

  const copy = useMemo(() => {
    if (kind === 'success') {
      return {
        title: isPaidStatus(order?.payment_status) ? 'Pago exitoso' : 'Estamos confirmando tu pago',
        description: isPaidStatus(order?.payment_status)
          ? 'Tu pago fue confirmado y el pedido ya esta en seguimiento.'
          : 'Mercado Pago nos redirigio correctamente. Estamos esperando la confirmacion final del backend.',
      };
    }

    if (kind === 'failure') {
      return {
        title: 'Pago no completado',
        description:
          'No pudimos confirmar el pago. Puedes reintentar con Mercado Pago si la orden sigue abierta.',
      };
    }

    return {
      title: 'Pago pendiente',
      description: 'Tu pago esta pendiente de confirmacion. Puedes revisar el estado del pedido.',
    };
  }, [kind, order?.payment_status]);

  if (!orderId) {
    return (
      <ResultLayout
        tone={kind}
        title={copy.title}
        description={missingOrderDescription}
        action={
          <Button fullWidth onClick={() => navigate(APP_ROUTES.home)} variant="secondary">
            Volver al menu
          </Button>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <ResultLayout
        tone={kind}
        title={copy.title}
        description="Consultando el estado actualizado de tu pedido."
        action={<LoadingState label="Cargando orden..." />}
      />
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <ErrorState
          description={getApiErrorMessage(error, 'No pudimos cargar el estado del pedido.')}
          onAction={() => navigate(`/orders/${orderId}`)}
          actionLabel="Ver seguimiento"
        />
      </div>
    );
  }

  const canRetryPayment = !isPaidStatus(order.payment_status);

  return (
    <ResultLayout
      tone={kind}
      title={copy.title}
      description={copy.description}
      action={
        <div className="flex flex-col gap-3">
          {canRetryPayment ? <RetryPaymentButton orderId={order.id} /> : null}
          <Button fullWidth onClick={() => navigate(`/orders/${order.id}`)} variant="secondary">
            Ver estado del pedido
          </Button>
          <Button fullWidth onClick={() => navigate(APP_ROUTES.home)} variant="ghost">
            Volver al menu
          </Button>
        </div>
      }
    >
      <OrderSummary order={order} />
    </ResultLayout>
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
