import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../../shared/hooks';
import { formatCLP } from '../../../shared/utils/format';
import type { OrderStatus } from '../../../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; step: number }> = {
  pendiente:      { label: 'Pedido recibido',   emoji: '📋', color: 'text-gray-600',  step: 0 },
  pagado:         { label: 'Pago confirmado',   emoji: '✅', color: 'text-green-600', step: 1 },
  en_preparacion: { label: 'En preparación',    emoji: '👨‍🍳', color: 'text-amber-600', step: 2 },
  listo:          { label: '¡Tu pedido está listo!', emoji: '🎉', color: 'text-green-700', step: 3 },
  despachado:     { label: 'En camino',          emoji: '🛵', color: 'text-blue-600',  step: 3 },
  entregado:      { label: 'Entregado',          emoji: '✅', color: 'text-green-700', step: 4 },
  cancelado:      { label: 'Cancelado',          emoji: '❌', color: 'text-red-600',   step: -1 },
  anulado:        { label: 'Anulado',            emoji: '❌', color: 'text-red-600',   step: -1 },
};

const STEPS = ['Recibido', 'Pagado', 'Preparando', 'Listo', 'Entregado'];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Pedido no encontrado</p>
        <button onClick={() => navigate('/')} className="text-red-600 font-medium">
          Volver al inicio
        </button>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Pedido #{order.id}</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* Status hero */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">{config.emoji}</div>
          <h2 className={`text-xl font-bold ${config.color}`}>{config.label}</h2>
          <p className="text-gray-400 text-sm mt-1">
            Pedido del {new Date(order.created_at).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {['pendiente', 'pagado', 'en_preparacion', 'listo', 'despachado'].includes(order.status) && (
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Actualizando en tiempo real
            </div>
          )}
        </div>

        {/* Progress bar */}
        {config.step >= 0 && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between relative">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i <= config.step
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-gray-200 text-gray-300'
                  }`}>
                    {i < config.step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center leading-tight ${
                    i <= config.step ? 'text-gray-700 font-medium' : 'text-gray-300'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
              {/* Progress line */}
              <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: `${(config.step / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">Tu pedido</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item.quantity}× {item.product_name}
                  </p>
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.modifiers.map((m) => m.option_name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-gray-400 italic">"{item.notes}"</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatCLP(item.total_price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCLP(order.subtotal)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Envío</span>
                <span>{formatCLP(order.delivery_fee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>−{formatCLP(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
              <span>Total</span>
              <span className="text-red-600">{formatCLP(order.total)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
