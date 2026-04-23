import { useNavigate, useParams } from 'react-router-dom';

import type { OrderStatus } from '@/types';

import { useOrder } from '@/shared/hooks';
import { BackButton, Button, EmptyState, LoadingState, PageHeader, SectionCard } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';

const STATUS_CONFIG: Record<OrderStatus, { label: string; tone: string; step: number }> = {
  pendiente: { label: 'Pedido recibido', tone: 'text-gray-700', step: 0 },
  pagado: { label: 'Pago confirmado', tone: 'text-green-700', step: 1 },
  en_preparacion: { label: 'En preparacion', tone: 'text-amber-700', step: 2 },
  listo: { label: 'Listo para entrega', tone: 'text-green-700', step: 3 },
  despachado: { label: 'En camino', tone: 'text-blue-700', step: 3 },
  entregado: { label: 'Entregado', tone: 'text-green-700', step: 4 },
  cancelado: { label: 'Cancelado', tone: 'text-red-700', step: -1 },
  anulado: { label: 'Anulado', tone: 'text-red-700', step: -1 },
};

const STEPS = ['Recibido', 'Pagado', 'Preparando', 'Listo', 'Entregado'];

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return <LoadingState fullScreen label="Cargando estado del pedido..." />;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <EmptyState
          actionLabel="Volver al inicio"
          description="No encontramos el pedido solicitado o aun no esta disponible."
          icon="?"
          onAction={() => navigate('/')}
          title="Pedido no encontrado"
        />
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader leading={<BackButton onClick={() => navigate('/')} />} title={`Pedido #${order.id}`} />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <SectionCard>
          <div className="text-center">
            <h2 className={`text-xl font-bold ${config.tone}`}>{config.label}</h2>
            <p className="mt-2 text-sm text-gray-500">
              Creado el{' '}
              {new Date(order.created_at).toLocaleDateString('es-CL', {
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                month: 'long',
              })}
            </p>
            {['pendiente', 'pagado', 'en_preparacion', 'listo', 'despachado'].includes(order.status) ? (
              <p className="mt-3 text-xs text-gray-400">Actualizando automaticamente cada 15 segundos.</p>
            ) : null}
          </div>
        </SectionCard>

        {config.step >= 0 ? (
          <SectionCard title="Progreso">
            <div className="relative flex items-start justify-between">
              {STEPS.map((step, index) => (
                <div key={step} className="z-10 flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      index <= config.step
                        ? 'border-brand bg-brand text-white'
                        : 'border-gray-200 bg-white text-gray-300'
                    }`}
                  >
                    {index < config.step ? '✓' : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-center text-xs ${
                      index <= config.step ? 'font-medium text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{ width: `${(config.step / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard title="Detalle del pedido">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.quantity}x {item.product_name}
                  </p>
                  {item.modifiers.length ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.modifiers.map((modifier) => modifier.option_name).join(', ')}
                    </p>
                  ) : null}
                  {item.notes ? <p className="mt-1 text-xs italic text-gray-400">"{item.notes}"</p> : null}
                </div>
                <span className="text-sm font-semibold text-gray-700">{formatCLP(item.total_price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCLP(order.subtotal)}</span>
            </div>
            {order.delivery_fee > 0 ? (
              <div className="flex justify-between text-gray-500">
                <span>Envio</span>
                <span>{formatCLP(order.delivery_fee)}</span>
              </div>
            ) : null}
            {order.discount > 0 ? (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatCLP(order.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-1 text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand">{formatCLP(order.total)}</span>
            </div>
          </div>
        </SectionCard>

        <Button fullWidth onClick={() => navigate('/')} variant="secondary">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
