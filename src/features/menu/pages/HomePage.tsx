import { useState, useRef } from 'react';
import { useMenu, usePromotions } from '../../../shared/hooks';
import { ProductCard } from '../components/ProductCard';
import { PromotionCard } from "../../../shared/components/PromotionCard";
import { CartFab } from '../../cart/components/CartFab';
import { ProductModal } from '../components/ProductModal';
import type { Product, Promotion } from '../../../types';

export default function HomePage() {
  const { data: categories, isLoading } = useMenu();
  const { data: promotions } = usePromotions();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

  const scrollToCategory = (id: number) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero */}
      <header className="bg-gray-900 text-white px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Yak<span className="text-red-500">ero</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Sushi · Comida casera · Sandwiches</p>
      </header>

      {/* Category nav (sticky) */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {promotions && promotions.length > 0 && (
            <button
              className="px-3 py-1.5 text-sm rounded-full whitespace-nowrap bg-red-600 text-white font-medium"
              onClick={() => document.getElementById('promos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🔥 Promos
            </button>
          )}
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-8">
        {/* Promotions section */}
        {promotions && promotions.length > 0 && (
          <section id="promos">
            <h2 className="text-lg font-bold text-gray-900 mb-3">🔥 Promociones</h2>
            <div className="grid grid-cols-1 gap-3">
              {promotions.map((promo) => (
                <PromotionCard
                  key={promo.id}
                  promotion={promo}
                  onSelect={() => setSelectedPromotion(promo)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Product categories */}
        {categories?.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => { categoryRefs.current[cat.id] = el; }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3">{cat.name}</h2>
            <div className="grid grid-cols-1 gap-3">
              {cat.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FAB carrito */}
      <CartFab />

      {/* Modales */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
