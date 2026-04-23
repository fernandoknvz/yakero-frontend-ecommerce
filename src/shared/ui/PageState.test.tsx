import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';

import { EmptyState, ErrorState, LoadingState } from './PageState';

describe('PageState components', () => {
  it('renders loading state', () => {
    renderWithProviders(<LoadingState label="Cargando datos..." />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('renders empty state with action', () => {
    renderWithProviders(
      <EmptyState
        actionLabel="Ir al menu"
        description="No hay contenido."
        onAction={() => undefined}
        title="Sin resultados"
      />
    );

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al menu' })).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderWithProviders(<ErrorState description="Fallo la solicitud." />);

    expect(screen.getByText('Algo salio mal')).toBeInTheDocument();
    expect(screen.getByText('Fallo la solicitud.')).toBeInTheDocument();
  });
});
