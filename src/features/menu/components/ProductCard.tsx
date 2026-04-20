import type { Product, Promotion } from '../../../types';
import { formatCLP } from '../../../shared/utils/format';

// ─── ProductCard ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onSelect: () => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const hasModifiers = product.modifier_groups.length > 0;

  return (
    <button
      onClick={onSelect}
      disabled={!product.is_available}
      className={`w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 p-3 transition-all active:scale-[0.98] ${
        !product.is_available ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        {product.description && (
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-red-600">{formatCLP(product.price)}</span>
          {hasModifiers && (
            <span className="text-xs text-gray-400">Personalizable</span>
          )}
        </div>
      </div>

      {/* Add indicator */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-light">
        +
      </div>
    </button>
  );
}

// ─── PromotionCard ────────────────────────────────────────────────────────────

interface PromotionCardProps {
  promotion: Promotion;
  onSelect: () => void;
}

export function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  const totalPieces = promotion.slots.reduce((acc, s) => acc + s.pieces, 0);

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 text-white flex items-center gap-4 active:scale-[0.98] transition-all"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
        {promotion.image_url ? (
          <img src={promotion.image_url} alt={promotion.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎉</div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-xs px-2 py-0.5 rounded-full font-medium">PROMO</span>
          {totalPieces > 0 && (
            <span className="text-gray-300 text-xs">{totalPieces} pzs</span>
          )}
        </div>
        <h3 className="font-bold mt-1">{promotion.name}</h3>
        {promotion.description && (
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{promotion.description}</p>
        )}
        <p className="text-red-400 font-bold mt-1">{formatCLP(promotion.value)}</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-lg">
        +
      </div>
    </button>
  );
}
