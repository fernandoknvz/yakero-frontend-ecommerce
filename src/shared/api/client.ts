import axios, { AxiosError } from 'axios';
import type {
  TokenResponse, RegisterInput, LoginInput, User,
  Address, AddressInput,
  Category, Product, Promotion,
  CreateOrderInput, OrderOut,
  DeliveryFeeOut, CouponOut, ApiError,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: agregar JWT si existe ─────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('yakero_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: 401 → limpiar sesión ────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yakero_token');
      localStorage.removeItem('yakero_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<TokenResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginInput) =>
    apiClient.post<TokenResponse>('/auth/login', data).then((r) => r.data),
  me: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),
};

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const menuApi = {
  getFullMenu: () =>
    apiClient.get<Category[]>('/categories/menu').then((r) => r.data),
  getProduct: (id: number) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),
  getPromotions: () =>
    apiClient.get<Promotion[]>('/promotions/').then((r) => r.data),
  searchProducts: (q: string) =>
    apiClient.get<Product[]>('/products/', { params: { q } }).then((r) => r.data),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: CreateOrderInput) =>
    apiClient.post<OrderOut>('/orders/', data).then((r) => r.data),
  getMyOrders: (skip = 0, limit = 20) =>
    apiClient.get<OrderOut[]>('/orders/my', { params: { skip, limit } }).then((r) => r.data),
  getOrder: (id: number) =>
    apiClient.get<OrderOut>(`/orders/${id}`).then((r) => r.data),
};

// ─── Users / Addresses ────────────────────────────────────────────────────────
export const usersApi = {
  updateProfile: (data: Partial<{ first_name: string; last_name: string; phone: string }>) =>
    apiClient.patch<User>('/users/me', data).then((r) => r.data),
  getAddresses: () =>
    apiClient.get<Address[]>('/users/me/addresses').then((r) => r.data),
  addAddress: (data: AddressInput) =>
    apiClient.post<Address>('/users/me/addresses', data).then((r) => r.data),
  deleteAddress: (id: number) =>
    apiClient.delete(`/users/me/addresses/${id}`),
};

// ─── Delivery ─────────────────────────────────────────────────────────────────
export const deliveryApi = {
  getFee: (latitude: number, longitude: number) =>
    apiClient
      .post<DeliveryFeeOut>('/delivery/fee', { latitude, longitude })
      .then((r) => r.data),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponsApi = {
  validate: (code: string, order_subtotal: number) =>
    apiClient
      .post<CouponOut>('/coupons/validate', { code, order_subtotal })
      .then((r) => r.data),
};
