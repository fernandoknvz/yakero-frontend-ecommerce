import type { Promotion } from '@/types';

import { formatCLP } from '@/shared/utils/format';

type PromotionCardProps = {
  promotion: Promotion;
  onSelect?: () => void;
};

export function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  const totalPieces = promotion.slots.reduce((total, slot) => total + slot.pieces, 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex min-h-32 gap-4 p-4">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
          {promotion.image_url ? (
            <img
              alt={promotion.name}
              className="h-full w-full object-cover"
              src={promotion.image_url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
              %
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
              Promo
            </span>
            {totalPieces > 0 ? (
              <span className="text-xs text-gray-500">{totalPieces} piezas</span>
            ) : null}
          </div>

          <h3 className="mt-3 text-base font-bold text-gray-900">{promotion.name}</h3>

          {promotion.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{promotion.description}</p>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-base font-bold text-brand">{formatCLP(promotion.value)}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg text-white">
              +
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
