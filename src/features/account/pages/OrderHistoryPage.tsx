import { useNavigate } from 'react-router-dom';

import type { OrderStatus } from '@/types';

import { useMyOrders } from '@/shared/hooks';
import { BackButton, Button, EmptyState, LoadingState, PageHeader } from '@/shared/ui';
import { formatCLP, formatDate } from '@/shared/utils/format';

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-gray-100 text-gray-600' },
  pagado: { label: 'Pagado', className: 'bg-blue-100 text-blue-700' },
  en_preparacion: { label: 'Preparando', className: 'bg-amber-100 text-amber-700' },
  listo: { label: 'Listo', className: 'bg-green-100 text-green-700' },
  despachado: { label: 'En camino', className: 'bg-blue-100 text-blue-700' },
  entregado: { label: 'Entregado', className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-600' },
  anulado: { label: 'Anulado', className: 'bg-red-100 text-red-600' },
};

const ACTIVE_STATUSES: OrderStatus[] = [
  'pendiente',
  'pagado',
  'en_preparacion',
  'listo',
  'despachado',
];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();

  const active = orders?.filter((order) => ACTIVE_STATUSES.includes(order.status)) ?? [];
  const past = orders?.filter((order) => !ACTIVE_STATUSES.includes(order.status)) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader leading={<BackButton onClick={() => navigate(-1)} />} title="Mis pedidos" />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-5">
        {isLoading ? <LoadingState label="Cargando pedidos..." /> : null}

        {!isLoading && !orders?.length ? (
          <EmptyState
            actionLabel="Ver menu"
            description="Tus proximos pedidos apareceran aqui con su estado e historial."
            icon="□"
            onAction={() => navigate('/')}
            title="Aun no tienes pedidos"
          />
        ) : null}

        {active.length ? (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              En curso
            </h2>
            <div className="space-y-3">
              {active.map((order) => (
                <OrderCard
                  key={order.id}
                  createdAt={order.created_at}
                  deliveryType={order.delivery_type}
                  isActive
                  itemCount={order.items.reduce((total, item) => total + item.quantity, 0)}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  orderId={order.id}
                  status={order.status}
                  total={order.total}
                />
              ))}
            </div>
          </section>
        ) : null}

        {past.length ? (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Historial
            </h2>
            <div className="space-y-3">
              {past.map((order) => (
                <OrderCard
                  key={order.id}
                  createdAt={order.created_at}
                  deliveryType={order.delivery_type}
                  itemCount={order.items.reduce((total, item) => total + item.quantity, 0)}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  orderId={order.id}
                  status={order.status}
                  total={order.total}
                />
              ))}
            </div>
          </section>
        ) : null}

        {!isLoading && orders?.length ? (
          <Button fullWidth onClick={() => navigate('/')} variant="secondary">
            Seguir comprando
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function OrderCard({
  createdAt,
  deliveryType,
  isActive,
  itemCount,
  onClick,
  orderId,
  status,
  total,
}: {
  createdAt: string;
  deliveryType: string;
  isActive?: boolean;
  itemCount: number;
  onClick: () => void;
  orderId: number;
  status: OrderStatus;
  total: number;
}) {
  const badge = STATUS_BADGE[status];

  return (
    <button
      className="w-full rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Pedido #{orderId}</span>
            {isActive ? <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> : null}
          </div>
          <p className="mt-1 text-xs text-gray-400">{formatDate(createdAt)}</p>
          <p className="mt-2 text-xs text-gray-500">
            {deliveryType === 'delivery' ? 'Delivery' : 'Retiro'} - {itemCount} item
            {itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-sm font-bold text-gray-900">{formatCLP(total)}</span>
        </div>
      </div>
    </button>
  );
}
