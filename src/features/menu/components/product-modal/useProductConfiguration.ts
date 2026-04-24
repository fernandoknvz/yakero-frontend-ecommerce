import { useMemo, useState } from 'react';

import type { ModifierGroup, Product, SelectedModifier } from '@/types';

export function useProductConfiguration(product: Product) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<Record<number, number[]>>(() =>
    product.modifier_groups.reduce<Record<number, number[]>>((current, group) => {
      current[group.id] = [];
      return current;
    }, {})
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const toggleOption = (group: ModifierGroup, optionId: number) => {
    const option = group.options.find((currentOption) => currentOption.id === optionId);
    if (!option?.is_available) return;

    setSelections((current) => {
      const selectedOptions = current[group.id] ?? [];

      if (group.modifier_type === 'single') {
        return { ...current, [group.id]: [optionId] };
      }

      if (selectedOptions.includes(optionId)) {
        return {
          ...current,
          [group.id]: selectedOptions.filter((selectedId) => selectedId !== optionId),
        };
      }

      if (selectedOptions.length >= group.max_selections) {
        return current;
      }

      return {
        ...current,
        [group.id]: [...selectedOptions, optionId],
      };
    });

    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[group.id];
      return nextErrors;
    });
  };

  const validate = () => {
    const nextErrors: Record<number, string> = {};

    product.modifier_groups.forEach((group) => {
      const selectedCount = selections[group.id]?.length ?? 0;

      if (group.is_required && selectedCount < group.min_selections) {
        nextErrors[group.id] =
          `Elige al menos ${group.min_selections} opcion${group.min_selections > 1 ? 'es' : ''}.`;
      }

      if (selectedCount > group.max_selections) {
        nextErrors[group.id] =
          `Elige maximo ${group.max_selections} opcion${group.max_selections > 1 ? 'es' : ''}.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const selectedModifiers = useMemo<SelectedModifier[]>(() => {
    const modifiers: SelectedModifier[] = [];

    product.modifier_groups.forEach((group) => {
      (selections[group.id] ?? []).forEach((optionId) => {
        const option = group.options.find((currentOption) => currentOption.id === optionId);

        if (!option) return;

        modifiers.push({
          modifier_option_id: option.id,
          option_name: option.name,
          group_name: group.name,
          extra_price: option.extra_price,
        });
      });
    });

    return modifiers;
  }, [product.modifier_groups, selections]);

  const extraTotal = useMemo(
    () => selectedModifiers.reduce((total, modifier) => total + modifier.extra_price, 0),
    [selectedModifiers]
  );

  const unitPrice = product.price + extraTotal;

  return {
    errors,
    notes,
    quantity,
    selectedModifiers,
    selections,
    setNotes,
    setQuantity,
    toggleOption,
    unitPrice,
    validate,
  };
}
