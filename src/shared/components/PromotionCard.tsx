type Promotion = {
  id: number | string;
  title?: string;
  name?: string;
  description?: string;
  image_url?: string;
  image?: string;
  discount_percentage?: number;
  price?: number;
};

type PromotionCardProps = {
  promotion: Promotion;
  onSelect?: () => void;
};

export function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  const title = promotion.title || promotion.name || "Promoción";
  const image = promotion.image_url || promotion.image || "";
  const description = promotion.description || "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition"
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-neutral-100 flex items-center justify-center text-neutral-400">
          Sin imagen
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>

        {description ? (
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {description}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          {promotion.discount_percentage ? (
            <span className="text-sm font-medium text-red-600">
              -{promotion.discount_percentage}%
            </span>
          ) : (
            <span className="text-sm text-neutral-400">Promoción activa</span>
          )}

          {promotion.price ? (
            <span className="text-sm font-semibold text-neutral-900">
              ${promotion.price}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}