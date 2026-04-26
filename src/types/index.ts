// ─── Enums ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pendiente'
  | 'pagado'
  | 'en_preparacion'
  | 'listo'
  | 'despachado'
  | 'entregado'
  | 'cancelado'
  | 'anulado';

export type PaymentStatus = 'pendiente' | 'pagado' | 'rechazado' | 'reembolso';
export type DeliveryType = 'delivery' | 'retiro';
export type TicketTag = 'cocina_sushi' | 'cocina_sandwich' | 'caja' | 'ninguna';
export type ModifierType = 'single' | 'multiple';
export type UserRole = 'customer' | 'admin' | 'pos_service';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: UserRole;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  points_balance: number;
  created_at: string;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: number;
  label: string;
  street: string;
  number: string;
  commune: string;
  city: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  is_default: boolean;
}

export interface AddressInput {
  label: string;
  street: string;
  number: string;
  commune: string;
  city: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  is_default?: boolean;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ModifierOption {
  id: number;
  name: string;
  extra_price: number;
  is_available: boolean;
}

export interface ModifierGroup {
  id: number;
  name: string;
  modifier_type: ModifierType;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: ModifierOption[];
}

export interface Product {
  id: number;
  category_id: number;
  sku?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  ticket_tag: TicketTag;
  is_available: boolean;
  modifier_groups: ModifierGroup[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  ticket_tag: TicketTag;
  image_url?: string;
  sort_order: number;
  products: Product[];
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export interface PromotionSlot {
  id: number;
  slot_name: string;
  pieces: number;
  ticket_tag: TicketTag;
  modifier_groups: ModifierGroup[];
}

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  promotion_type: string;
  value: number;
  image_url?: string;
  slots: PromotionSlot[];
}

// ─── Cart (client-side only) ─────────────────────────────────────────────────

export interface SelectedModifier {
  modifier_option_id: number;
  option_name: string;
  group_name: string;
  extra_price: number;
}

export interface CartItem {
  cartItemId: string; // uuid local para identificar en el carrito
  product?: Product;
  promotion?: Promotion;
  promotion_slot_id?: number;
  quantity: number;
  unit_price: number; // precio base + extras
  selected_modifiers: SelectedModifier[];
  notes?: string;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItemModifierOut {
  option_name: string;
  group_name: string;
  extra_price: number;
}

export interface OrderItemOut {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  ticket_tag: TicketTag;
  notes?: string;
  modifiers: OrderItemModifierOut[];
}

export interface OrderOut {
  id: number;
  delivery_type: DeliveryType;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  notes?: string;
  items: OrderItemOut[];
  created_at: string;
  paid_at?: string;
  ready_at?: string;
  delivered_at?: string;
  mp_preference_id?: string;
}

export interface CreateOrderInput {
  delivery_type: DeliveryType;
  address_id?: number;
  guest_email?: string;
  guest_phone?: string;
  items: OrderItemInput[];
  notes?: string;
  coupon_code?: string;
  points_to_use?: number;
}

export interface OrderPreviewItemOut {
  product_id?: number;
  promotion_id?: number;
  promotion_slot_id?: number;
  product_name: string;
  product_slug?: string;
  quantity: number;
  base_unit_price: number;
  modifiers_total: number;
  unit_price: number;
  total_price: number;
  ticket_tag: TicketTag;
  notes?: string;
  image_url?: string;
  selected_modifiers: OrderItemModifierOut[];
}

export interface OrderPreviewOut {
  delivery_type: DeliveryType;
  address_id?: number;
  coupon_code?: string;
  points_to_use: number;
  items: OrderPreviewItemOut[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  pricing?: {
    coupon_discount: number;
    points_discount: number;
  };
  total: number;
  notes?: string;
}

export type CreatePaymentPreferenceInput = CreateOrderInput;

export interface PaymentPreferenceOut {
  preference_id: string;
  init_point: string;
  sandbox_init_point?: string;
  external_reference: string;
}

export interface OrderItemInput {
  product_id?: number;
  promotion_id?: number;
  promotion_slot_id?: number;
  quantity: number;
  notes?: string;
  selected_modifiers: { modifier_option_id: number }[];
}

// ─── Delivery ────────────────────────────────────────────────────────────────

export interface DeliveryFeeOut {
  distance_km: number;
  fee: number;
  is_available: boolean;
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export interface CouponOut {
  code: string;
  discount_type: string;
  discount_value: number;
  calculated_discount: number;
}

// ─── API errors ──────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
}
