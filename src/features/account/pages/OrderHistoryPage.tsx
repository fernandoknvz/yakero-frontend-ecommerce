import { useNavigate } from 'react-router-dom';
import { useMyOrders } from '../../../shared/hooks';
import { formatCLP, formatDate } from '../../../shared/utils/format';
import type { OrderStatus } from '../../../types';

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pendiente:      { label: 'Pendiente',    className: 'bg-gray-100 text-gray-600' },
  pagado:         { label: 'Pagado',       className: 'bg-blue-100 text-blue-700' },
  en_preparacion: { label: 'Preparando',   className: 'bg-amber-100 text-amber-700' },
  listo:          { label: 'Listo',        className: 'bg-green-100 text-green-700' },
  despachado:     { label: 'En camino',    className: 'bg-blue-100 text-blue-700' },
  entregado:      { label: 'Entregado',    className: 'bg-green-100 text-green-700' },
  cancelado:      { label: 'Cancelado',    className: 'bg-red-100 text-red-600' },
  anulado:        { label: 'Anulado',      className: 'bg-red-100 text-red-600' },
};

const ACTIVE_STATUSES: OrderStatus[] = ['pendiente', 'pagado', 'en_preparacion', 'listo', 'despachado'];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();

  const active = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)) ?? [];
  const past   = orders?.filter((o) => !ACTIVE_STATUSES.includes(o.status)) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Mis pedidos</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {isLoading && (
          <div className="flex justify-center pt-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
          </div>
        )}

        {!isLoading && orders?.length === 0 && (
          <div className="text-center pt-16 space-y-3">
            <div className="text-5xl">🍱</div>
            <p className="text-gray-500 font-medium">Aún no tienes pedidos</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm"
            >
              Ver el menú
            </button>
          </div>
        )}

        {active.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              En curso
            </h2>
            <div className="space-y-3">
              {active.map((order) => (
                <OrderCard
                  key={order.id}
                  orderId={order.id}
                  status={order.status}
                  total={order.total}
                  itemCount={order.items.reduce((a, i) => a + i.quantity, 0)}
                  createdAt={order.created_at}
                  deliveryType={order.delivery_type}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  isActive
                />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Historial
            </h2>
            <div className="space-y-3">
              {past.map((order) => (
                <OrderCard
                  key={order.id}
                  orderId={order.id}
                  status={order.status}
                  total={order.total}
                  itemCount={order.items.reduce((a, i) => a + i.quantity, 0)}
                  createdAt={order.created_at}
                  deliveryType={order.delivery_type}
                  onClick={() => navigate(`/orders/${order.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  orderId, status, total, itemCount, createdAt, deliveryType, onClick, isActive,
}: {
  orderId: number;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
  deliveryType: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  const badge = STATUS_BADGE[status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Pedido #{orderId}</span>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(createdAt)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {deliveryType === 'delivery' ? '🛵 Delivery' : '🏪 Retiro'} · {itemCount} ítem{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <span className="font-bold text-gray-900 text-sm">{formatCLP(total)}</span>
        </div>
      </div>
    </button>
  );
}
