import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { renderWithProviders } from '@/test/testUtils';

import { ProtectedRoute, PublicOnlyRoute } from './guards';

describe('route guards', () => {
  afterEach(() => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: false, user: null });
  });

  it('redirects guests away from protected routes', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<div>Privado</div>} path="/account" />
        </Route>
        <Route element={<div>Login</div>} path="/login" />
      </Routes>,
      { route: '/account' }
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('redirects authenticated users away from public-only routes', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'token',
      user: {
        created_at: '',
        email: 'user@example.com',
        first_name: 'Yak',
        id: 1,
        last_name: 'User',
        points_balance: 10,
        role: 'customer',
      },
    });

    renderWithProviders(
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<div>Login</div>} path="/login" />
        </Route>
        <Route element={<div>Home</div>} path="/" />
      </Routes>,
      { route: '/login' }
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
