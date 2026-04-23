import { useRef, useState } from 'react';

import type { Product } from '@/types';

import { PromotionCard } from '@/shared/components/PromotionCard';
import { useMenu, usePromotions } from '@/shared/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui';

import { CartFab } from '../../cart/components/CartFab';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';

export default function HomePage() {
  const {
    data: categories,
    error,
    isError,
    isLoading,
    refetch,
  } = useMenu();
  const { data: promotions } = usePromotions();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

  const scrollToCategory = (id: number) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return <LoadingState fullScreen label="Cargando menu..." />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState
          description={error instanceof Error ? error.message : 'No pudimos cargar el menu.'}
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          title="Aun no hay productos disponibles"
          description="Cuando el catalogo este publicado, aparecera aqui con sus categorias y promociones."
          icon="□"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gray-950 px-4 pb-8 pt-12 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            Yak<span className="text-brand">ero</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-gray-400">
            Sushi, sandwiches y comida preparada con una base mobile-first lista para escalar.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-10 overflow-x-auto border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-w-max max-w-2xl gap-2 px-4 py-3">
          {promotions?.length ? (
            <button
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
              onClick={() => document.getElementById('promotions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Promos
            </button>
          ) : null}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-gray-900 font-medium text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-5">
        {promotions?.length ? (
          <section id="promotions">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Promociones destacadas</h2>
              <p className="text-sm text-gray-500">{promotions.length} activas</p>
            </div>
            <div className="grid gap-3">
              {promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </section>
        ) : null}

        {categories.map((category) => (
          <section
            key={category.id}
            ref={(element) => {
              categoryRefs.current[category.id] = element;
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
              <p className="text-sm text-gray-500">{category.products.length} items</p>
            </div>

            <div className="grid gap-3">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  onSelect={() => setSelectedProduct(product)}
                  product={product}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <CartFab />

      {selectedProduct ? (
        <ProductModal onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      ) : null}
    </div>
  );
}
