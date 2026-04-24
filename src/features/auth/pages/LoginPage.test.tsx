import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/testUtils';

import LoginPage from './LoginPage';

const mockLogin = vi.fn();

vi.mock('@/shared/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/shared/hooks')>('@/shared/hooks');

  return {
    ...actual,
    useLogin: () => ({
      isPending: false,
      mutateAsync: mockLogin,
    }),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockLogin.mockResolvedValue(undefined);
  });

  it('submits valid credentials with normalized email', async () => {
    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'FERADMIN@example.com');
    await userEvent.type(screen.getByLabelText('Contrasena'), 'Admin123456');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'feradmin@example.com',
        password: 'Admin123456',
      });
    });
  });
});
