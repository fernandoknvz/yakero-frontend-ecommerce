import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { menuApi } from '@/shared/api/services';
import { formatCLP } from '@/shared/utils/format';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui';
import type { Product } from '@/types';

type ImageStatus = 'all' | 'with-image' | 'without-image' | 'image-error';

type CatalogField = string | { name?: string; title?: string; label?: string } | null | undefined;

type CatalogReviewProduct = Product & {
  product_name?: string;
  category?: CatalogField;
  subcategory?: CatalogField;
};

const ALL_CATEGORIES = 'all';
const NO_CATEGORY = 'Sin categoria';
const NO_SUBCATEGORY = 'Sin subcategoria';

function fieldLabel(value: CatalogField, fallback: string) {
  if (typeof value === 'string' && value.trim()) return value.trim();

  if (value && typeof value === 'object') {
    return value.name ?? value.title ?? value.label ?? fallback;
  }

  return fallback;
}

function productName(product: CatalogReviewProduct) {
  return product.product_name?.trim() || product.name;
}

function productCategory(product: CatalogReviewProduct) {
  return fieldLabel(product.category, product.category_id ? `Categoria ${product.category_id}` : NO_CATEGORY);
}

function productSubcategory(product: CatalogReviewProduct) {
  return fieldLabel(product.subcategory, NO_SUBCATEGORY);
}

function statusFor(product: CatalogReviewProduct, imageErrors: Record<number, boolean>): ImageStatus {
  if (!product.image_url) return 'without-image';
  if (imageErrors[product.id]) return 'image-error';
  return 'with-image';
}

function statusLabel(status: ImageStatus) {
  if (status === 'with-image') return 'CON IMAGEN';
  if (status === 'without-image') return 'SIN IMAGEN';
  if (status === 'image-error') return 'ERROR IMAGEN';
  return 'TODOS';
}

function statusClass(status: ImageStatus) {
  if (status === 'with-image') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'without-image') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'image-error') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-gray-200 bg-gray-50 text-gray-600';
}

export default function CatalogReviewPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [subcategoryFilter, setSubcategoryFilter] = useState(ALL_CATEGORIES);
  const [imageStatusFilter, setImageStatusFilter] = useState<ImageStatus>('all');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const {
    data: products,
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products', 'catalog-review'],
    queryFn: menuApi.getProducts,
    staleTime: 60 * 1000,
  });

  const catalogProducts = useMemo(
    () => (products ?? []) as CatalogReviewProduct[],
    [products]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(catalogProducts.map(productCategory))).sort(),
    [catalogProducts]
  );

  const subcategoryOptions = useMemo(() => {
    const scopedProducts =
      categoryFilter === ALL_CATEGORIES
        ? catalogProducts
        : catalogProducts.filter((product) => productCategory(product) === categoryFilter);

    return Array.from(new Set(scopedProducts.map(productSubcategory))).sort();
  }, [catalogProducts, categoryFilter]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return catalogProducts.filter((product) => {
      const category = productCategory(product);
      const subcategory = productSubcategory(product);
      const imageStatus = statusFor(product, imageErrors);
      const name = productName(product).toLowerCase();
      const sku = product.sku?.toLowerCase() ?? '';

      if (categoryFilter !== ALL_CATEGORIES && category !== categoryFilter) return false;
      if (subcategoryFilter !== ALL_CATEGORIES && subcategory !== subcategoryFilter) return false;
      if (imageStatusFilter !== 'all' && imageStatus !== imageStatusFilter) return false;
      if (!normalizedSearch) return true;

      return name.includes(normalizedSearch) || sku.includes(normalizedSearch);
    });
  }, [catalogProducts, categoryFilter, imageErrors, imageStatusFilter, search, subcategoryFilter]);

  const summary = useMemo(() => {
    const withImage = catalogProducts.filter(
      (product) => statusFor(product, imageErrors) === 'with-image'
    ).length;
    const withoutImage = catalogProducts.filter(
      (product) => statusFor(product, imageErrors) === 'without-image'
    ).length;
    const imageError = catalogProducts.filter(
      (product) => statusFor(product, imageErrors) === 'image-error'
    ).length;
    const coverage =
      catalogProducts.length > 0 ? Math.round((withImage / catalogProducts.length) * 100) : 0;

    return { coverage, imageError, total: catalogProducts.length, withImage, withoutImage };
  }, [catalogProducts, imageErrors]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce<Record<string, Record<string, CatalogReviewProduct[]>>>(
      (groups, product) => {
        const category = productCategory(product);
        const subcategory = productSubcategory(product);

        groups[category] ??= {};
        groups[category][subcategory] ??= [];
        groups[category][subcategory].push(product);

        return groups;
      },
      {}
    );
  }, [filteredProducts]);

  if (isLoading) {
    return <LoadingState fullScreen label="Cargando revision de catalogo..." />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          description={
            error instanceof Error ? error.message : 'No pudimos cargar los productos publicados.'
          }
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-200 bg-white px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Auditoria interna
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Revision de catalogo</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Vista temporal para revisar imagenes, categorias, subcategorias y datos publicados.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Total productos" value={summary.total} />
          <SummaryCard label="Con imagen" value={summary.withImage} tone="green" />
          <SummaryCard label="Sin imagen" value={summary.withoutImage} tone="amber" />
          <SummaryCard label="Error imagen" value={summary.imageError} tone="red" />
          <SummaryCard label="Cobertura" value={`${summary.coverage}%`} tone="brand" />
        </section>

        <section className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Buscar</span>
            <input
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre o SKU"
              type="search"
              value={search}
            />
          </label>

          <SelectFilter
            label="Categoria"
            onChange={(value) => {
              setCategoryFilter(value);
              setSubcategoryFilter(ALL_CATEGORIES);
            }}
            options={categoryOptions}
            value={categoryFilter}
          />

          <SelectFilter
            label="Subcategoria"
            onChange={setSubcategoryFilter}
            options={subcategoryOptions}
            value={subcategoryFilter}
          />

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Estado imagen</span>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              onChange={(event) => setImageStatusFilter(event.target.value as ImageStatus)}
              value={imageStatusFilter}
            >
              <option value="all">Todos</option>
              <option value="with-image">Con imagen</option>
              <option value="without-image">Sin imagen</option>
              <option value="image-error">Error imagen</option>
            </select>
          </label>
        </section>

        <div className="text-sm text-gray-500">
          Mostrando {filteredProducts.length} de {catalogProducts.length} productos.
        </div>

        {!filteredProducts.length ? (
          <EmptyState
            title="No hay productos para estos filtros"
            description="Ajusta la busqueda, categoria, subcategoria o estado de imagen."
          />
        ) : null}

        {Object.entries(groupedProducts).map(([category, subcategoryGroups]) => (
          <section key={category} className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h2 className="text-xl font-bold text-gray-950">{category}</h2>
            </div>

            {Object.entries(subcategoryGroups).map(([subcategory, groupProducts]) => (
              <div key={subcategory} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-gray-800">{subcategory}</h3>
                  <span className="text-sm text-gray-500">{groupProducts.length} productos</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupProducts.map((product) => (
                    <CatalogReviewCard
                      key={product.id}
                      imageStatus={statusFor(product, imageErrors)}
                      onImageError={() =>
                        setImageErrors((currentErrors) => ({
                          ...currentErrors,
                          [product.id]: true,
                        }))
                      }
                      product={product}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number | string;
  tone?: 'default' | 'green' | 'amber' | 'red' | 'brand';
}

function SummaryCard({ label, tone = 'default', value }: SummaryCardProps) {
  const toneClasses = {
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    brand: 'border-brand/20 bg-brand/10 text-brand',
    default: 'border-gray-200 bg-white text-gray-950',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-red-200 bg-red-50 text-red-800',
  };

  return (
    <article className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide opacity-75">{label}</div>
    </article>
  );
}

interface SelectFilterProps {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}

function SelectFilter({ label, onChange, options, value }: SelectFilterProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <select
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value={ALL_CATEGORIES}>Todas</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CatalogReviewCardProps {
  imageStatus: ImageStatus;
  onImageError: () => void;
  product: CatalogReviewProduct;
}

function CatalogReviewCard({ imageStatus, onImageError, product }: CatalogReviewCardProps) {
  const showImage = product.image_url && imageStatus !== 'image-error';

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="h-44 w-full bg-gray-100">
        {showImage ? (
          <img
            alt={productName(product)}
            className="h-full w-full object-cover"
            onError={onImageError}
            src={product.image_url}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 text-center text-sm font-medium text-gray-400">
            {imageStatus === 'image-error' ? 'Imagen no carga' : 'Sin imagen'}
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="min-w-0 text-sm font-bold text-gray-950">{productName(product)}</h4>
          <span
            className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(
              imageStatus
            )}`}
          >
            {statusLabel(imageStatus)}
          </span>
        </div>

        <dl className="grid gap-2 text-xs text-gray-600">
          <ProductMeta label="SKU" value={product.sku || 'Sin SKU'} />
          <ProductMeta label="Categoria" value={productCategory(product)} />
          <ProductMeta label="Subcategoria" value={productSubcategory(product)} />
          <ProductMeta label="Precio" value={formatCLP(product.price)} strong />
        </dl>
      </div>
    </article>
  );
}

interface ProductMetaProps {
  label: string;
  strong?: boolean;
  value: string;
}

function ProductMeta({ label, strong = false, value }: ProductMetaProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 font-medium text-gray-400">{label}</dt>
      <dd className={`min-w-0 text-right ${strong ? 'font-bold text-brand' : 'text-gray-700'}`}>
        {value}
      </dd>
    </div>
  );
}
