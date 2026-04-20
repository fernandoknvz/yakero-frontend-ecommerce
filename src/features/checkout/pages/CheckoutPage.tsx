import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { useAuthStore } from '../../../stores/authStore';
import { useCreateOrder, useAddresses, useDeliveryFee, useValidateCoupon } from '../../../shared/hooks';
import { formatCLP } from '../../../shared/utils/format';
import type { CreateOrderInput, DeliveryType } from '../../../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, couponCode, couponDiscount, pointsToUse,
          setCoupon, clearCoupon, setPoints, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { data: addresses } = useAddresses();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retiro');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Coordenadas de la dirección seleccionada
  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId);
  const { data: deliveryInfo } = useDeliveryFee(
    deliveryType === 'delivery' ? selectedAddress?.latitude : undefined,
    deliveryType === 'delivery' ? selectedAddress?.longitude : undefined,
  );

  const deliveryFee = deliveryType === 'delivery' ? (deliveryInfo?.fee ?? 0) : 0;
  const total = Math.max(subtotal() + deliveryFee - couponDiscount - pointsToUse, 0);

  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { mutateAsync: validateCoupon, isPending: validatingCoupon } = useValidateCoupon();

  const handleCoupon = async () => {
    setCouponError('');
    try {
      const result = await validateCoupon({ code: couponInput, subtotal: subtotal() });
      setCoupon(result.code, result.calculated_discount);
    } catch {
      setCouponError('Cupón inválido o no aplica para este pedido');
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    if (deliveryType === 'delivery' && !selectedAddressId) {
      alert('Selecciona una dirección de entrega');
      return;
    }
    if (!isAuthenticated && !guestEmail) {
      alert('Ingresa tu email para continuar');
      return;
    }

    const orderItems = items.map((item) => ({
      product_id: item.product?.id,
      promotion_id: item.promotion?.id,
      promotion_slot_id: item.promotion_slot_id,
      quantity: item.quantity,
      notes: item.notes,
      selected_modifiers: item.selected_modifiers.map((m) => ({
        modifier_option_id: m.modifier_option_id,
      })),
    }));

    const payload: CreateOrderInput = {
      delivery_type: deliveryType,
      address_id: deliveryType === 'delivery' ? selectedAddressId ?? undefined : undefined,
      guest_email: !isAuthenticated ? guestEmail : undefined,
      guest_phone: !isAuthenticated ? guestPhone : undefined,
      items: orderItems,
      notes: notes || undefined,
      coupon_code: couponCode ?? undefined,
      points_to_use: pointsToUse,
    };

    try {
      const order = await createOrder(payload);
      clearCart();

      // Redirigir a MercadoPago si hay preference_id
      if (order.mp_preference_id) {
        const mpUrl = import.meta.env.VITE_MP_CHECKOUT_URL ?? 'https://www.mercadopago.cl/checkout/v1/redirect';
        window.location.href = `${mpUrl}?pref_id=${order.mp_preference_id}`;
      } else {
        navigate(`/orders/${order.id}`);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Error al crear el pedido');
    }
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Tipo de entrega */}
        <section className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3">¿Cómo quieres recibirlo?</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['retiro', 'delivery'] as DeliveryType[]).map((type) => (
              <button
                key={type}
                onClick={() => setDeliveryType(type)}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors capitalize ${
                  deliveryType === type
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {type === 'retiro' ? '🏪 Retiro' : '🛵 Delivery'}
              </button>
            ))}
          </div>
        </section>

        {/* Dirección (solo delivery) */}
        {deliveryType === 'delivery' && isAuthenticated && addresses && (
          <section className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-3">Dirección de entrega</h2>
            {addresses.length === 0 ? (
              <button
                onClick={() => navigate('/account/addresses')}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-500 text-sm"
              >
                + Agregar dirección
              </button>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800">{addr.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {addr.street} {addr.number}, {addr.commune}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {deliveryInfo && selectedAddressId && (
              <div className={`mt-3 p-3 rounded-xl text-sm ${
                deliveryInfo.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {deliveryInfo.is_available
                  ? `✓ Delivery disponible — ${deliveryInfo.distance_km} km — ${formatCLP(deliveryInfo.fee)}`
                  : `✗ Fuera de zona de cobertura (${deliveryInfo.distance_km} km)`}
              </div>
            )}
          </section>
        )}

        {/* Guest info */}
        {!isAuthenticated && (
          <section className="bg-white rounded-2xl p-4 space-y-3">
            <h2 className="font-bold text-gray-900">Tus datos</h2>
            <input
              type="email"
              placeholder="Email para confirmación *"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-400 text-center">
              ¿Tienes cuenta?{' '}
              <button onClick={() => navigate('/login')} className="text-red-600 font-medium">
                Inicia sesión
              </button>
            </p>
          </section>
        )}

        {/* Cupón */}
        <section className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3">Cupón de descuento</h2>
          {couponCode ? (
            <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-green-700 font-semibold text-sm">{couponCode}</p>
                <p className="text-green-600 text-xs">−{formatCLP(couponDiscount)}</p>
              </div>
              <button onClick={clearCoupon} className="text-gray-400 text-sm">✕</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Ingresa tu cupón"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleCoupon}
                disabled={!couponInput || validatingCoupon}
                className="bg-gray-900 text-white px-4 rounded-xl text-sm font-medium disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          )}
          {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
        </section>

        {/* Puntos */}
        {isAuthenticated && user && user.points_balance > 0 && (
          <section className="bg-white rounded-2xl p-4">
            <h2 className="font-bold text-gray-900 mb-1">Usar puntos</h2>
            <p className="text-xs text-gray-400 mb-3">
              Tienes {user.points_balance} pts = {formatCLP(user.points_balance)} disponibles
            </p>
            <input
              type="range"
              min={0}
              max={Math.min(user.points_balance, subtotal())}
              value={pointsToUse}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 pts</span>
              <span className="font-semibold text-red-600">
                {pointsToUse > 0 ? `−${formatCLP(pointsToUse)}` : 'Sin usar'}
              </span>
              <span>{Math.min(user.points_balance, subtotal())} pts</span>
            </div>
          </section>
        )}

        {/* Notas */}
        <section className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-2">Notas del pedido</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones especiales, alergias..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </section>

        {/* Resumen */}
        <section className="bg-white rounded-2xl p-4 space-y-2 text-sm">
          <h2 className="font-bold text-gray-900 mb-3">Resumen</h2>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCLP(subtotal())}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>{formatCLP(deliveryFee)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Cupón {couponCode}</span>
              <span>−{formatCLP(couponDiscount)}</span>
            </div>
          )}
          {pointsToUse > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Puntos usados</span>
              <span>−{formatCLP(pointsToUse)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 mt-2">
            <span>Total</span>
            <span className="text-red-600">{formatCLP(total)}</span>
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-colors"
        >
          {isPending ? 'Procesando...' : `Pagar ${formatCLP(total)}`}
        </button>
      </div>
    </div>
  );
}
