import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { LoadingState } from '@/shared/ui';

import {
  PaymentFailurePage,
  PaymentPendingPage,
  PaymentSuccessPage,
} from '../features/checkout/pages/PaymentResultPages';
import AppLayout from './AppLayout';

const HomePage = lazy(() => import('../features/menu/pages/HomePage'));
const CheckoutPage = lazy(() => import('../features/checkout/pages/CheckoutPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const OrderTrackingPage = lazy(() => import('../features/account/pages/OrderTrackingPage'));
const OrderHistoryPage = lazy(() => import('../features/account/pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('../features/account/pages/ProfilePage'));

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingState fullScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: wrap(HomePage) },
      { path: 'checkout', element: wrap(CheckoutPage) },
      { path: 'login', element: wrap(LoginPage) },
      { path: 'register', element: wrap(RegisterPage) },
      { path: 'orders/:id', element: wrap(OrderTrackingPage) },
      { path: 'account/orders', element: wrap(OrderHistoryPage) },
      { path: 'account', element: wrap(ProfilePage) },
      { path: 'checkout/success', element: <PaymentSuccessPage /> },
      { path: 'checkout/failure', element: <PaymentFailurePage /> },
      { path: 'checkout/pending', element: <PaymentPendingPage /> },
    ],
  },
]);
