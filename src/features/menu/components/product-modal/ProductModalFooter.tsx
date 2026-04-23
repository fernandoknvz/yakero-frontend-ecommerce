import { Button } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';

export function ProductModalFooter({
  onAdd,
  onDecrease,
  onIncrease,
  quantity,
  totalPrice,
}: {
  onAdd: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  quantity: number;
  totalPrice: number;
}) {
  return (
    <div className="border-t border-gray-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700"
          onClick={onDecrease}
          type="button"
        >
          -
        </button>
        <span className="w-8 text-center text-xl font-bold">{quantity}</span>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700"
          onClick={onIncrease}
          type="button"
        >
          +
        </button>
      </div>

      <Button fullWidth onClick={onAdd}>
        Agregar al carrito - {formatCLP(totalPrice)}
      </Button>
    </div>
  );
}
