import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';
import type { Product } from '@/types';

import { ProductConfigurator } from './ProductConfigurator';

const configurableProduct: Product = {
  category_id: 1,
  description: 'Base configurable',
  id: 20,
  image_url: '',
  is_available: true,
  modifier_groups: [
    {
      id: 1,
      is_required: true,
      max_selections: 1,
      min_selections: 1,
      modifier_type: 'single',
      name: 'Proteina',
      options: [
        {
          extra_price: 500,
          id: 100,
          is_available: true,
          name: 'Salmon',
        },
      ],
    },
  ],
  name: 'Poke',
  price: 7990,
  slug: 'poke',
  ticket_tag: 'cocina_sushi',
};

describe('ProductConfigurator', () => {
  it('prevents adding an invalid required configuration', async () => {
    const onAdd = vi.fn();
    renderWithProviders(<ProductConfigurator onAdd={onAdd} product={configurableProduct} />);

    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(screen.getByText('Elige al menos 1 opcion.')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('adds a valid configuration with modifier pricing', async () => {
    const onAdd = vi.fn();
    renderWithProviders(<ProductConfigurator onAdd={onAdd} product={configurableProduct} />);

    await userEvent.click(screen.getByRole('button', { name: /salmon/i }));
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 1,
        unitPrice: 8490,
      })
    );
  });
});
