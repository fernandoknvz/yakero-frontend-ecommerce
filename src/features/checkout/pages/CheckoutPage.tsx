import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { env } from '@/config/env';
import { useCartStore } from '@/features/cart/store/cartStore';
import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_ROUTES } from '@/shared/constants/routes';
import {
  createCheckoutContactSchema,
  FormInput,
  FormTextarea,
  type CheckoutFormValues,
} from '@/shared/forms';
import { useAddresses, useCreateOrder, useDeliveryFee, useValidateCoupon } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { BackButton, Button, PageHeader, SectionCard } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';
import { useAuthStore } from '@/stores/authStore';
import type { CreateOrderInput, DeliveryType } from '@/types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const {
    clearCart,
    clearCoupon,
    couponCode,
    couponDiscount,
    items,
    pointsToUse,
    setCoupon,
    setPoints,
    subtotal,
  } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const schema = useMemo(() => createCheckoutContactSchema(isAuthenticated), [isAuthenticated]);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    trigger,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      couponInput: '',
      guestEmail: '',
      guestPhone: '',
      notes: '',
    },
    resolver: zodResolver(schema),
  });
  const { data: addresses = [] } = useAddresses();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retiro');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const { data: deliveryInfo } = useDeliveryFee(
    deliveryType === 'delivery' ? selectedAddress?.latitude : undefined,
    deliveryType === 'delivery' ? selectedAddress?.longitude : undefined
  );
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { mutateAsync: validateCoupon, isPending: validatingCoupon } = useValidateCoupon();
  const watchedCouponInput = useWatch({
    control,
    name: 'couponInput',
  });

  const subtotalAmount = subtotal();
  const deliveryFee = deliveryType === 'delivery' ? (deliveryInfo?.fee ?? 0) : 0;
  const total = Math.max(subtotalAmount + deliveryFee - couponDiscount - pointsToUse, 0);

  const validationMessage = useMemo(() => {
    if (!items.length) return 'Tu carrito esta vacio.';
    if (deliveryType === 'delivery' && !selectedAddressId) {
      return 'Selecciona una direccion para despacho.';
    }
    if (
      deliveryType === 'delivery' &&
      selectedAddressId &&
      deliveryInfo &&
      !deliveryInfo.is_available
    ) {
      return 'La direccion seleccionada esta fuera de la zona de cobertura.';
    }

    return '';
  }, [deliveryInfo, deliveryType, items.length, selectedAddressId]);

  if (!items.length) {
    return <Navigate replace to={APP_ROUTES.home} />;
  }

  const handleCoupon = async () => {
    const isValid = await trigger('couponInput');
    if (!isValid) return;

    try {
      const couponInput = getValues('couponInput').trim().toUpperCase();
      const result = await validateCoupon({ code: couponInput, subtotal: subtotalAmount });
      setCoupon(result.code, result.calculated_discount);
      pushToast({
        tone: 'success',
        title: 'Cupon aplicado',
        description: `Se desconto ${formatCLP(result.calculated_discount)} del total.`,
      });
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No pudimos aplicar el cupon',
        description: getApiErrorMessage(error, 'Cupon invalido o no disponible para este pedido.'),
      });
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (validationMessage) {
      pushToast({
        tone: 'error',
        title: 'Revisa el checkout',
        description: validationMessage,
      });
      return;
    }

    const payload: CreateOrderInput = {
      delivery_type: deliveryType,
      address_id: deliveryType === 'delivery' ? (selectedAddressId ?? undefined) : undefined,
      guest_email: !isAuthenticated ? values.guestEmail?.trim() : undefined,
      guest_phone: !isAuthenticated ? values.guestPhone?.trim() || undefined : undefined,
      items: items.map((item) => ({
        product_id: item.product?.id,
        promotion_id: item.promotion?.id,
        promotion_slot_id: item.promotion_slot_id,
        quantity: item.quantity,
        notes: item.notes,
        selected_modifiers: item.selected_modifiers.map((modifier) => ({
          modifier_option_id: modifier.modifier_option_id,
        })),
      })),
      notes: values.notes.trim() || undefined,
      coupon_code: couponCode ?? undefined,
      points_to_use: pointsToUse,
    };

    try {
      const order = await createOrder(payload);
      clearCart();
      pushToast({
        tone: 'success',
        title: 'Pedido creado',
        description: 'Te estamos redirigiendo al siguiente paso.',
      });

      if (order.mp_preference_id) {
        window.location.assign(`${env.mercadoPagoCheckoutUrl}?pref_id=${order.mp_preference_id}`);
        return;
      }

      navigate(`/orders/${order.id}`);
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No pudimos crear el pedido',
        description: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader
        leading={<BackButton onClick={() => navigate(-1)} />}
        title="Checkout"
        subtitle="Revisa despacho, descuentos y total antes de pagar."
      />

      <form
        className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SectionCard title="Como quieres recibirlo">
          <div className="grid grid-cols-2 gap-3">
            {(['retiro', 'delivery'] as DeliveryType[]).map((type) => (
              <button
                key={type}
                className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                  deliveryType === type
                    ? 'border-brand bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600'
                }`}
                onClick={() => setDeliveryType(type)}
                type="button"
              >
                {type === 'retiro' ? 'Retiro' : 'Delivery'}
              </button>
            ))}
          </div>
        </SectionCard>

        {deliveryType === 'delivery' && isAuthenticated ? (
          <SectionCard
            description="Usa una direccion guardada para calcular cobertura y costo."
            title="Direccion de entrega"
          >
            {!addresses.length ? (
              <Button fullWidth onClick={() => navigate(APP_ROUTES.account)} variant="secondary">
                Agregar direccion en mi perfil
              </Button>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    className={`w-full rounded-2xl border-2 p-3 text-left transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-brand bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-gray-900">{address.label}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {address.street} {address.number}, {address.commune}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {deliveryInfo && selectedAddressId ? (
              <div
                className={`mt-3 rounded-2xl px-3 py-3 text-sm ${
                  deliveryInfo.is_available
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {deliveryInfo.is_available
                  ? `Delivery disponible. Distancia ${deliveryInfo.distance_km} km. Costo ${formatCLP(deliveryInfo.fee)}.`
                  : `Fuera de cobertura. Distancia ${deliveryInfo.distance_km} km.`}
              </div>
            ) : null}
          </SectionCard>
        ) : null}

        {!isAuthenticated ? (
          <SectionCard
            description="Necesitamos un contacto para confirmar el pedido."
            title="Tus datos"
          >
            <div className="space-y-3">
              <FormInput
                error={errors.guestEmail?.message}
                label="Email para confirmacion"
                type="email"
                {...register('guestEmail')}
              />
              <FormInput
                error={errors.guestPhone?.message}
                label="Telefono"
                type="tel"
                {...register('guestPhone')}
              />
              <p className="text-sm text-gray-500">
                Ya tienes cuenta:{' '}
                <button
                  className="font-semibold text-brand"
                  onClick={() => navigate(APP_ROUTES.login)}
                  type="button"
                >
                  Inicia sesion
                </button>
              </p>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard title="Descuentos">
          {couponCode ? (
            <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-green-700">{couponCode}</p>
                <p className="text-xs text-green-600">-{formatCLP(couponDiscount)}</p>
              </div>
              <Button onClick={clearCoupon} type="button" variant="ghost">
                Quitar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <FormInput
                className="uppercase"
                error={errors.couponInput?.message}
                label="Cupon"
                placeholder="Ingresa tu cupon"
                {...register('couponInput')}
              />
              <div className="sm:pt-6">
                <Button
                  disabled={!watchedCouponInput?.trim() || validatingCoupon}
                  onClick={() => void handleCoupon()}
                  type="button"
                >
                  {validatingCoupon ? 'Validando...' : 'Aplicar'}
                </Button>
              </div>
            </div>
          )}
        </SectionCard>

        {isAuthenticated && user?.points_balance ? (
          <SectionCard
            description={`Disponible: ${user.points_balance} pts (${formatCLP(user.points_balance)}).`}
            title="Usar puntos"
          >
            <input
              className="w-full accent-red-600"
              max={Math.min(user.points_balance, subtotalAmount)}
              min={0}
              onChange={(event) => setPoints(Number(event.target.value))}
              type="range"
              value={pointsToUse}
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="font-semibold text-brand">
                {pointsToUse ? `-${formatCLP(pointsToUse)}` : 'Sin usar'}
              </span>
              <span>{Math.min(user.points_balance, subtotalAmount)}</span>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard title="Notas del pedido">
          <FormTextarea
            className="resize-none"
            error={errors.notes?.message}
            label="Instrucciones"
            rows={3}
            {...register('notes')}
          />
        </SectionCard>

        <SectionCard title="Resumen">
          <div className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatCLP(subtotalAmount)} />
            <SummaryRow
              label="Envio"
              value={deliveryFee ? formatCLP(deliveryFee) : 'Se calcula segun despacho'}
            />
            {couponDiscount > 0 ? (
              <SummaryRow
                emphasis
                label={`Cupon ${couponCode}`}
                value={`-${formatCLP(couponDiscount)}`}
              />
            ) : null}
            {pointsToUse > 0 ? (
              <SummaryRow emphasis label="Puntos usados" value={`-${formatCLP(pointsToUse)}`} />
            ) : null}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-brand">{formatCLP(total)}</span>
            </div>
          </div>
        </SectionCard>

        <Button disabled={isPending || Boolean(validationMessage)} fullWidth type="submit">
          {isPending ? 'Procesando...' : `Pagar ${formatCLP(total)}`}
        </Button>
      </form>
    </div>
  );
}

function SummaryRow({
  emphasis = false,
  label,
  value,
}: {
  emphasis?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`flex items-center justify-between ${emphasis ? 'text-green-600' : 'text-gray-600'}`}
    >
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
