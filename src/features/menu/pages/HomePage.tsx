import { useMemo, useRef, useState } from 'react';

import { PromotionCard } from '@/shared/components/PromotionCard';
import { FormInput } from '@/shared/forms';
import { useMenu, usePromotions } from '@/shared/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui';

import { CartFab } from '../../cart/components/CartFab';
import { ProductCard } from '../components/ProductCard';

type SortMode = 'featured' | 'price-asc' | 'price-desc';

export default function HomePage() {
  const { data: categories, error, isError, isLoading, refetch } = useMenu();
  const { data: promotions } = usePromotions();
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('featured');
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

  const scrollToCategory = (id: number) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visibleCategories = useMemo(() => {
    if (!categories) return [];

    const normalizedSearch = search.trim().toLowerCase();

    return categories
      .filter((category) => activeCategory === 'all' || category.id === activeCategory)
      .map((category) => {
        const products = category.products
          .filter((product) => {
            if (!normalizedSearch) return true;
            return product.name.toLowerCase().includes(normalizedSearch);
          })
          .sort((a, b) => {
            if (sort === 'price-asc') return a.price - b.price;
            if (sort === 'price-desc') return b.price - a.price;
            return 0;
          });

        return { ...category, products };
      })
      .filter((category) => category.products.length > 0);
  }, [activeCategory, categories, search, sort]);

  const productCount = useMemo(
    () => categories?.reduce((total, category) => total + category.products.length, 0) ?? 0,
    [categories]
  );

  if (isLoading) {
    return <LoadingState fullScreen label="Cargando catalogo..." />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState
          description={error instanceof Error ? error.message : 'No pudimos cargar el catalogo.'}
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
            Explora el catalogo, personaliza tus productos y arma tu pedido.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-10 overflow-x-auto border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-w-max max-w-2xl gap-2 px-4 py-3">
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setActiveCategory('all')}
            type="button"
          >
            Todo
          </button>
          {promotions?.length ? (
            <button
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
              onClick={() =>
                document.getElementById('promotions')?.scrollIntoView({ behavior: 'smooth' })
              }
              type="button"
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
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-5">
        <section className="space-y-3">
          <FormInput
            label="Buscar productos"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre del producto"
            type="search"
            value={search}
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Ordenar</span>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              onChange={(event) => setSort(event.target.value as SortMode)}
              value={sort}
            >
              <option value="featured">Orden del menu</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </label>
          <p className="text-xs text-gray-500">
            {productCount} productos publicados en {categories.length} categorias.
          </p>
        </section>

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

        {!visibleCategories.length ? (
          <EmptyState
            title="No encontramos productos"
            description="Prueba con otra busqueda o categoria."
            icon="□"
          />
        ) : null}

        {visibleCategories.map((category) => (
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <CartFab />
    </div>
  );
}
