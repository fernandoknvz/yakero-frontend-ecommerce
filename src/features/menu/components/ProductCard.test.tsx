import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@/types';
import { renderWithProviders } from '@/test/testUtils';

import { ProductCard } from './ProductCard';

const product: Product = {
  id: 1,
  category_id: 1,
  description: 'Roll con palta y salmon.',
  image_url: 'https://example.com/roll.jpg',
  is_available: true,
  modifier_groups: [],
  name: 'California Roll',
  price: 5990,
  slug: 'california-roll',
  ticket_tag: 'cocina_sushi',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    renderWithProviders(<ProductCard onSelect={vi.fn()} product={product} />);

    expect(screen.getByText('California Roll')).toBeInTheDocument();
    expect(screen.getByText('$5.990')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('navigates to product detail by default', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProductCard product={product} />} path="/" />
        <Route element={<div>Detalle California</div>} path="/productos/:productId" />
      </Routes>
    );

    await userEvent.click(screen.getByRole('button', { name: /california roll/i }));

    expect(screen.getByText('Detalle California')).toBeInTheDocument();
  });
});
