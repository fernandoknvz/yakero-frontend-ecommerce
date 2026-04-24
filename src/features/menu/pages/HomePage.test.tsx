import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';
import type { Category } from '@/types';

import HomePage from './HomePage';

const mockUseMenu = vi.fn();
const mockUsePromotions = vi.fn();

vi.mock('@/shared/hooks', () => ({
  useMenu: () => mockUseMenu(),
  usePromotions: () => mockUsePromotions(),
}));

const categories: Category[] = [
  {
    id: 1,
    image_url: '',
    name: 'Sushi',
    products: [
      {
        category_id: 1,
        description: 'Roll con salmon',
        id: 10,
        image_url: '',
        is_available: true,
        modifier_groups: [],
        name: 'California Roll',
        price: 5990,
        slug: 'california-roll',
        ticket_tag: 'cocina_sushi',
      },
    ],
    slug: 'sushi',
    sort_order: 1,
    ticket_tag: 'cocina_sushi',
  },
  {
    id: 2,
    image_url: '',
    name: 'Sandwiches',
    products: [
      {
        category_id: 2,
        description: 'Completo italiano',
        id: 11,
        image_url: '',
        is_available: false,
        modifier_groups: [],
        name: 'Italiano',
        price: 3990,
        slug: 'italiano',
        ticket_tag: 'cocina_sandwich',
      },
    ],
    slug: 'sandwiches',
    sort_order: 2,
    ticket_tag: 'cocina_sandwich',
  },
];

describe('HomePage catalog', () => {
  beforeEach(() => {
    mockUsePromotions.mockReturnValue({ data: [] });
  });

  it('renders empty state when menu has no categories', () => {
    mockUseMenu.mockReturnValue({
      data: [],
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Aun no hay productos disponibles')).toBeInTheDocument();
  });

  it('filters products by search text', async () => {
    mockUseMenu.mockReturnValue({
      data: categories,
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('California Roll')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Buscar productos'), 'california');

    expect(screen.getByText('California Roll')).toBeInTheDocument();
    expect(screen.queryByText('Italiano')).not.toBeInTheDocument();
  });
});
