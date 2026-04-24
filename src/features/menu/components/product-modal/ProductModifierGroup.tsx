import type { ModifierGroup } from '@/types';

import { formatCLP } from '@/shared/utils/format';

export function ProductModifierGroup({
  error,
  group,
  onToggle,
  selectedOptions,
}: {
  error?: string;
  group: ModifierGroup;
  onToggle: (optionId: number) => void;
  selectedOptions: number[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{group.name}</h3>
          <p className="text-xs text-gray-500">
            {group.modifier_type === 'single'
              ? 'Elige una opcion'
              : `Elige entre ${group.min_selections} y ${group.max_selections}`}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            group.is_required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {group.is_required ? 'Obligatorio' : 'Opcional'}
        </span>
      </div>

      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}

      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              className={`flex w-full items-center justify-between rounded-2xl border-2 p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-brand bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 disabled:hover:border-gray-200'
              }`}
              disabled={!option.is_available}
              onClick={() => onToggle(option.id)}
              type="button"
            >
              <span className="text-sm font-medium text-gray-800">
                {option.name}
                {!option.is_available ? (
                  <span className="ml-2 text-xs font-normal text-gray-400">No disponible</span>
                ) : null}
              </span>

              <div className="flex items-center gap-2">
                {option.extra_price > 0 ? (
                  <span className="text-sm text-gray-500">+{formatCLP(option.extra_price)}</span>
                ) : null}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs ${
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
