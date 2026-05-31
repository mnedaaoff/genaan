// ─── Core Auth ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  provider?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export type ProductType = "plant" | "pot" | "soil" | "vitamin" | "accessory";

export interface Category {
  id: number;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  slug: string;
  parent_id?: number;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  color?: string | null;
  size?: string | null;
}

export interface PotAddon {
  pot_product_id: number;
  pot_variant_id: number;
  pot_name: string;
  color: string;
  size: string;
  price: number;
}

export interface ProductAttribute {
  id: number;
  product_id: number;
  attribute_key: string;
  attribute_value: string;
}

export interface PlantCare {
  id: number;
  product_id: number;
  watering_days: number;
  light_level: "low" | "medium" | "bright" | "direct";
  humidity_level: "low" | "medium" | "high";
  notes?: string;
  care_notes_en?: string | null;
  care_notes_ar?: string | null;
}

export interface InventoryRecord {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  reserved: number;
  available: number;
}

export type InventoryLogType = "in" | "out" | "reserve" | "release" | "adjustment";

export interface InventoryLog {
  id: number;
  product_id: number;
  variant_id?: number;
  type: InventoryLogType;
  quantity: number;
  note?: string;
  created_at: string;
  product?: Pick<Product, "id" | "name">;
}

export interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  slug: string;
  scientific_name?: string;
  description?: string;
  description_en?: string | null;
  description_ar?: string | null;
  type: ProductType;
  price: number;
  compare_at_price?: number | null;
  category_id?: number;
  pot_size?: string | null;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  plant_care?: PlantCare;
  inventory?: InventoryRecord;
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

// ─── Cart & Orders ────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product: Pick<Product, "id" | "name" | "price" | "images" | "slug"> & { type?: ProductType };
  variant?: Pick<ProductVariant, "id" | "name" | "price" | "color" | "size">;
  pot_addon?: PotAddon;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  unit_price: number;
  total: number;
  product?: Pick<Product, "id" | "name" | "images">;
}

export interface OrderEvent {
  id: number;
  order_id: number;
  event: string;
  description?: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  address_id?: number;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  coupon_code?: string;
  items?: OrderItem[];
  events?: OrderEvent[];
  address?: Address;
  user?: Pick<User, "id" | "name" | "email">;
  created_at: string;
  updated_at: string;
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  body: string;
  user?: Pick<User, "id" | "name">;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  cover_image?: string;
  published: boolean;
  author?: Pick<User, "id" | "name">;
  created_at: string;
  updated_at: string;
}

// ─── Support Chat ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  thread_id: number;
  sender_id: number;
  body: string;
  is_admin: boolean;
  read_at?: string;
  created_at: string;
}

export interface ChatThread {
  id: number;
  user_id: number;
  user?: Pick<User, "id" | "name" | "email">;
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  messages?: ChatMessage[];
}

// ─── Settings & Analytics ─────────────────────────────────────────────────────

export interface Setting {
  key: string;
  value: string;
}

export interface AnalyticsEvent {
  id: number;
  event: string;
  user_id?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── Dashboard Aggregates ─────────────────────────────────────────────────────

export interface DashboardStats {
  total_revenue: number;
  total_users: number;
  active_orders: number;
  low_stock_count: number;
  sales_by_day: { date: string; revenue: number }[];
  top_products: { id: number; name: string; revenue: number; units: number }[];
  recent_activity: { id: number; description: string; created_at: string }[];
}

export interface ProcurementStats {
  by_category: { category: string; stock: number; reserved: number }[];
  fulfillment_rate: number;
  budget_allocated: number;
  budget_used: number;
  recent_logs: InventoryLog[];
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer extends User {
  total_orders: number;
  lifetime_spend: number;
  last_order_at?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
