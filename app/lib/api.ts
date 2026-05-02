import type {
  DashboardStats, ProcurementStats, Product, Order, Customer,
  Coupon, ChatThread, Post, Setting, PaginatedResponse, Category,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("genaan_token") ?? "{}").token; } catch { return ""; } })()
    : "";

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `API error ${res.status}`);
  }
  return res.json();
}

/** Upload helper — uses FormData, no Content-Type header so browser sets multipart */
async function apiUpload<T>(path: string, formData: FormData, method = "POST"): Promise<T> {
  const token = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("genaan_token") ?? "{}").token; } catch { return ""; } })()
    : "";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `Upload error ${res.status}`);
  }
  return res.json();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await apiFetch<{ data: DashboardStats }>("/admin/dashboard");
    return data;
  },
};

// ─── Products & Categories ───────────────────────────────────────────────────

export const products = {
  list: async (params?: { search?: string; type?: string; page?: number }): Promise<PaginatedResponse<Product>> => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<PaginatedResponse<Product>>(`/products?${qs}`);
  },

  get: async (id: number): Promise<Product> => {
    return apiFetch<Product>(`/products/${id}`);
  },

  create: async (formData: FormData): Promise<Product> => {
    const res = await apiUpload<{ data: Product }>("/products", formData);
    return res.data;
  },

  update: async (id: number, formData: FormData): Promise<Product> => {
    // Laravel needs _method=PUT for FormData
    formData.append("_method", "PUT");
    const res = await apiUpload<Product>(`/products/${id}`, formData);
    return res;
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
  },
};

export const categories = {
  list: async (): Promise<Category[]> => {
    const res = await apiFetch<{ data: Category[] }>("/categories");
    return res.data;
  },
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cart = {
  get: async (): Promise<{ data: any[] }> => {
    return apiFetch("/cart");
  },
  add: async (product_id: number, variant_id?: number, quantity: number = 1): Promise<{ data: any[] }> => {
    return apiFetch("/cart/add", { method: "POST", body: JSON.stringify({ product_id, variant_id, quantity }) });
  },
  update: async (item_id: number, quantity: number): Promise<{ data: any[] }> => {
    return apiFetch("/cart/update", { method: "PUT", body: JSON.stringify({ item_id, quantity }) });
  },
  remove: async (item_id: number): Promise<{ data: any[] }> => {
    return apiFetch("/cart/remove", { method: "DELETE", body: JSON.stringify({ item_id }) });
  },
};

// ─── Addresses ────────────────────────────────────────────────────────────────

export const addresses = {
  list: async (): Promise<any[]> => {
    return apiFetch<any[]>("/addresses");
  },

  create: async (payload: {
    full_name: string;
    phone: string;
    city: string;
    postcode?: string;
    country?: string;
    street: string;
    is_default?: boolean;
  }): Promise<any> => {
    return apiFetch<any>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, payload: any): Promise<any> => {
    return apiFetch<any>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/addresses/${id}`, { method: "DELETE" });
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = {
  list: async (): Promise<PaginatedResponse<Order>> => {
    return apiFetch("/orders");
  },

  get: async (id: number): Promise<Order> => {
    const { data } = await apiFetch<{ data: Order }>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: number, status: Order["status"]): Promise<Order> => {
    const { data } = await apiFetch<{ data: Order }>(`/orders/${id}/status`, {
      method: "PUT", body: JSON.stringify({ status }),
    });
    return data;
  },

  create: async (payload: {
    items: { product_id: number; variant_id?: number | null; quantity: number; unit_price: number }[];
    shipping_address: { line1: string; city: string; postcode: string; country: string };
    payment_method?: string;
    coupon_code?: string;
    note?: string;
  }): Promise<Order> => {
    return apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  cancel: async (id: number): Promise<void> => {
    await apiFetch(`/orders/${id}/cancel`, { method: "POST" });
  },

  /** Initiate Paymob payment for an order via Intention API v1. */
  pay: async (
    orderId: number,
    payload: {
      payment_method: "card" | "wallet" | "both";
      phone?: string;
      billing?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        city?: string;
        street?: string;
      };
    }
  ): Promise<{
    client_secret: string;
    paymob_order_id: string;
    public_key: string;
  }> => {
    return apiFetch(`/paymob/intention`, {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, payment_method: payload.payment_method }),
    });
  },
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = {
  list: async (): Promise<PaginatedResponse<Customer>> => {
    return apiFetch("/customers");
  },
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const coupons = {
  list: async (): Promise<Coupon[]> => {
    const { data } = await apiFetch<{ data: Coupon[] }>("/coupons");
    return data;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    const res = await apiFetch<{ data: Coupon }>("/coupons", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/coupons/${id}`, { method: "DELETE" });
  },

  /** Apply a coupon code — returns { discount, type, value, code } */
  apply: async (code: string, subtotal?: number): Promise<any> => {
    return apiFetch<any>("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
  },
};

// ─── Chats ────────────────────────────────────────────────────────────────────

export const chats = {
  list: async (): Promise<ChatThread[]> => {
    const { data } = await apiFetch<{ data: ChatThread[] }>("/chat/conversations");
    return data;
  },

  send: async (threadId: number, body: string): Promise<void> => {
    await apiFetch("/chat/messages", {
      method: "POST", body: JSON.stringify({ thread_id: threadId, body }),
    });
  },
};

// ─── Posts (Journal) ──────────────────────────────────────────────────────────

export const posts = {
  list: async (): Promise<Post[]> => {
    const { data } = await apiFetch<{ data: Post[] }>("/posts");
    return data;
  },

  get: async (slug: string): Promise<Post> => {
    const { data } = await apiFetch<{ data: Post }>(`/posts/${slug}`);
    return data;
  },

  create: async (data: Partial<Post>): Promise<Post> => {
    const res = await apiFetch<{ data: Post }>("/posts", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: Partial<Post>): Promise<Post> => {
    const res = await apiFetch<{ data: Post }>(`/posts/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/posts/${id}`, { method: "DELETE" });
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = {
  get: async (): Promise<Setting[]> => {
    return apiFetch<Setting[]>("/settings");
  },

  update: async (items: { key: string; value: any; type?: string }[]): Promise<void> => {
    await apiFetch("/settings", { method: "POST", body: JSON.stringify({ items }) });
  },

  updatePassword: async (data: { current_password: string; password: string; password_confirmation: string }): Promise<void> => {
    await apiFetch("/settings/change-password", { method: "POST", body: JSON.stringify(data) });
  },
};

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const faqs = {
  list: async (): Promise<any[]> => {
    const { data } = await apiFetch<{ data: any[] }>("/faqs");
    return data;
  },
  create: async (data: any): Promise<any> => {
    const res = await apiFetch<{ data: any }>("/faqs", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },
  update: async (id: number, data: any): Promise<any> => {
    const res = await apiFetch<{ data: any }>(`/faqs/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiFetch(`/faqs/${id}`, { method: "DELETE" });
  },
};

// ─── Consultations ─────────────────────────────────────────────────────────────

export const consultations = {
  list: async (): Promise<any[]> => {
    const { data } = await apiFetch<{ data: any[] }>("/consultations");
    return data;
  },
  create: async (data: any): Promise<any> => {
    const res = await apiFetch<{ data: any }>("/consultations", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<any> => {
    const res = await apiFetch<{ data: any }>(`/consultations/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    return res.data;
  },
};

// ─── Procurement ─────────────────────────────────────────────────────────────

export const procurement = {
  stats: async (): Promise<ProcurementStats> => {
    const { data } = await apiFetch<{ data: ProcurementStats }>("/admin/procurement");
    return data;
  },
};

// ─── Sections (indoor, outdoor, pots, etc.) ───────────────────────────────────

export const sections = {
  list: async (): Promise<any[]> => {
    const res = await apiFetch<{ data: any[] }>("/sections");
    return res.data;
  },

  get: async (slug: string): Promise<any> => {
    return apiFetch<{ data: any; products: any }>(`/sections/${slug}`);
  },

  create: async (formData: FormData): Promise<any> => {
    const res = await apiUpload<{ data: any }>("/sections", formData);
    return res.data;
  },

  update: async (id: number, formData: FormData): Promise<any> => {
    formData.append("_method", "PUT");
    const res = await apiUpload<{ data: any }>(`/sections/${id}`, formData);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/sections/${id}`, { method: "DELETE" });
  },

  assignProducts: async (id: number, productIds: number[]): Promise<any> => {
    return apiFetch(`/sections/${id}/products`, {
      method: "POST",
      body: JSON.stringify({ product_ids: productIds }),
    });
  },
};

// ─── Contact Messages ─────────────────────────────────────────────────────────

export const contactMessages = {
  /** Public: submit a message */
  submit: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<any> => {
    return apiFetch("/contact-messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Admin: list messages */
  list: async (params?: { is_read?: boolean; page?: number }): Promise<any> => {
    const qs = params ? new URLSearchParams(params as any).toString() : "";
    return apiFetch(`/contact-messages?${qs}`);
  },

  /** Admin: reply to a message */
  reply: async (id: number, admin_reply: string): Promise<any> => {
    return apiFetch(`/contact-messages/${id}/reply`, {
      method: "PATCH",
      body: JSON.stringify({ admin_reply }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch(`/contact-messages/${id}`, { method: "DELETE" });
  },
};

// ─── Plant Care Requests ──────────────────────────────────────────────────────

export const plantCareRequests = {
  /** Public: submit plant image + message */
  submit: async (message: string, image?: File): Promise<any> => {
    const formData = new FormData();
    formData.append("message", message);
    if (image) formData.append("image", image);
    return apiUpload("/plant-care-requests", formData);
  },

  /** Admin: list requests */
  list: async (status?: string): Promise<any> => {
    const qs = status ? `?status=${status}` : "";
    return apiFetch(`/plant-care-requests${qs}`);
  },

  /** Admin: respond */
  respond: async (id: number, admin_response: string, status: string): Promise<any> => {
    return apiFetch(`/plant-care-requests/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ admin_response, status }),
    });
  },
};

// ─── Page Contents (CMS) ─────────────────────────────────────────────────────

export const pageContents = {
  get: async (key: string): Promise<any> => {
    const res = await apiFetch<{ data: any }>(`/page-contents/${key}`).catch(() => null);
    return (res as any)?.data ?? null;
  },

  upsert: async (key: string, data: { title?: string; body?: string; meta?: any }): Promise<any> => {
    return apiFetch(`/page-contents/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  uploadImage: async (key: string, image: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", image);
    const res = await apiUpload<{ url: string }>(`/page-contents/${key}/image`, formData);
    return res.url;
  },
};
