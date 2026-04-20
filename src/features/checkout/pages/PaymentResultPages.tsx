import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const externalRef = params.get('external_reference'); // order id from MP

  useEffect(() => {
    // Redirigir al tracking del pedido después de 2s
    const timer = setTimeout(() => {
      if (externalRef) {
        navigate(`/orders/${externalRef}`, { replace: true });
      } else {
        navigate('/account/orders', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [externalRef, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
      <div className="text-7xl animate-bounce">🎉</div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900">¡Pago exitoso!</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Tu pedido fue confirmado. Redirigiendo al seguimiento...
        </p>
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );
}

export function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
      <div className="text-7xl">😞</div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900">Pago no completado</h1>
        <p className="text-gray-500 mt-2 text-sm">
          No pudimos procesar tu pago. Tu carrito sigue guardado.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl"
        >
          Reintentar pago
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm"
        >
          Volver al menú
        </button>
      </div>
    </div>
  );
}

export function PaymentPendingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const externalRef = params.get('external_reference');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
      <div className="text-7xl">⏳</div>
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900">Pago pendiente</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Tu pago está siendo procesado. Te avisaremos cuando esté confirmado.
        </p>
      </div>
      {externalRef && (
        <button
          onClick={() => navigate(`/orders/${externalRef}`)}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm"
        >
          Ver estado del pedido
        </button>
      )}
    </div>
  );
}
