import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCartStore } from '@/features/cart/store/cartStore';
import { APP_ROUTES } from '@/shared/constants/routes';
import { useMenu, useProduct } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { BackButton, PageHeader, ErrorState, LoadingState } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';

import { CartFab } from '../../cart/components/CartFab';
import { ProductConfigurator } from '../components/ProductConfigurator';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const parsedProductId = Number(productId);
  const { data: categories } = useMenu();
  const { data: product, error, isError, isLoading, refetch } = useProduct(parsedProductId);
  const { addProduct } = useCartStore();
  const { pushToast } = useToast();

  const category = useMemo(
    () => categories?.find((currentCategory) => currentCategory.id === product?.category_id),
    [categories, product?.category_id]
  );

  if (!Number.isFinite(parsedProductId) || parsedProductId <= 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState
          actionLabel="Volver al catalogo"
          description="La ruta del producto no es valida."
          onAction={() => navigate(APP_ROUTES.home)}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState fullScreen label="Cargando producto..." />;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState
          description={error instanceof Error ? error.message : 'No pudimos cargar este producto.'}
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader
        leading={<BackButton onClick={() => navigate(-1)} />}
        title="Detalle del producto"
        subtitle="Configura opciones, cantidad y notas antes de agregar."
      />

      <main className="mx-auto max-w-2xl px-4 py-5">
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {product.image_url ? (
            <img alt={product.name} className="h-64 w-full object-cover" src={product.image_url} />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
              □
            </div>
          )}

          <div className="space-y-5 p-5">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {category ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {category.name}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {product.is_available ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.description ? (
                <p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p>
              ) : null}
              <p className="mt-3 text-xl font-bold text-brand">{formatCLP(product.price)}</p>
            </div>

            {!product.is_available ? (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                Este producto no esta disponible para agregar al carrito en este momento.
              </div>
            ) : (
              <ProductConfigurator
                onAdd={({ notes, quantity, selectedModifiers }) => {
                  addProduct(product, quantity, selectedModifiers, notes);
                  pushToast({
                    tone: 'success',
                    title: 'Producto agregado',
                    description: `${product.name} ya esta en tu carrito.`,
                  });
                }}
                product={product}
              />
            )}
          </div>
        </article>
      </main>

      <CartFab />
    </div>
  );
}
