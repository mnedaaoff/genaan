import type {
  DashboardStats, ProcurementStats, Product, Order, Customer,
  Coupon, ChatThread, Post, Setting, PaginatedResponse, Category,
} from "./types";
import {
  mockDashboardStats, mockProcurementStats, mockProducts, mockOrders,
  mockCustomers, mockCoupons, mockChatThreads, mockPosts, mockSettings,
} from "./mock-data";

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
    throw new Error(err.message ?? `API error ${res.status}`);
  }
  return res.json();
}

// Helper to decide whether to use mock or live API
const useMock = !API_BASE;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  stats: async (): Promise<DashboardStats> => {
    if (useMock) return mockDashboardStats;
    const { data } = await apiFetch<{ data: DashboardStats }>("/admin/dashboard");
    return data;
  },
};

// ─── Products & Categories ───────────────────────────────────────────────────

export const products = {
  list: async (params?: { search?: string; type?: string; page?: number }): Promise<PaginatedResponse<Product>> => {
    if (useMock) {
      let data = [...mockProducts];
      if (params?.search) data = data.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
      if (params?.type)   data = data.filter(p => p.type === params.type);
      return { data, current_page: 1, last_page: 1, per_page: 20, total: data.length };
    }
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const result = await apiFetch<any>(`/products?${qs}`);
    // Laravel paginate returns object with data, current_page, etc.
    return result; 
  },

  get: async (id: number): Promise<Product> => {
    if (useMock) {
      const p = mockProducts.find(p => p.id === id);
      if (!p) throw new Error("Product not found");
      return p;
    }
    const res = await apiFetch<any>(`/products/${id}`);
    return res;
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    if (useMock) return { ...mockProducts[0], ...data, id: Date.now() } as Product;
    const res = await apiFetch<Product>("/products", {
      method: "POST", body: JSON.stringify(data),
    });
    return res;
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    if (useMock) return { ...mockProducts[0], ...data, id } as Product;
    const res = await apiFetch<Product>(`/products/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    });
    return res;
  },

  delete: async (id: number): Promise<void> => {
    if (useMock) return;
    await apiFetch(`/products/${id}`, { method: "DELETE" });
  },
};

export const categories = {
  list: async (): Promise<Category[]> => {
    if (useMock) return [];
    const res = await apiFetch<any>("/categories");
    return res.data;
  },
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cart = {
  get: async (): Promise<{ data: any[] }> => {
    if (useMock) return { data: [] };
    return apiFetch("/cart");
  },
  add: async (product_id: number, variant_id?: number, quantity: number = 1): Promise<{ data: any[] }> => {
    if (useMock) return { data: [] };
    return apiFetch("/cart/add", { method: "POST", body: JSON.stringify({ product_id, variant_id, quantity }) });
  },
  update: async (item_id: number, quantity: number): Promise<{ data: any[] }> => {
    if (useMock) return { data: [] };
    return apiFetch("/cart/update", { method: "PUT", body: JSON.stringify({ item_id, quantity }) });
  },
  remove: async (item_id: number): Promise<{ data: any[] }> => {
    if (useMock) return { data: [] };
    return apiFetch("/cart/remove", { method: "DELETE", body: JSON.stringify({ item_id }) });
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = {
  list: async (): Promise<PaginatedResponse<Order>> => {
    if (useMock) return { data: mockOrders, current_page: 1, last_page: 1, per_page: 20, total: mockOrders.length };
    return apiFetch("/orders");
  },

  get: async (id: number): Promise<Order> => {
    if (useMock) {
      const o = mockOrders.find(o => o.id === id);
      if (!o) throw new Error("Order not found");
      return o;
    }
    const { data } = await apiFetch<{ data: Order }>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: number, status: Order["status"]): Promise<Order> => {
    if (useMock) return { ...mockOrders[0], id, status };
    const { data } = await apiFetch<{ data: Order }>(`/orders/${id}/status`, {
      method: "PUT", body: JSON.stringify({ status }),
    });
    return data;
  },
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = {
  list: async (): Promise<PaginatedResponse<Customer>> => {
    if (useMock) return { data: mockCustomers, current_page: 1, last_page: 1, per_page: 20, total: mockCustomers.length };
    return apiFetch("/customers");
  },
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const coupons = {
  list: async (): Promise<Coupon[]> => {
    if (useMock) return mockCoupons;
    const { data } = await apiFetch<{ data: Coupon[] }>("/coupons");
    return data;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    if (useMock) return { ...mockCoupons[0], ...data, id: Date.now(), uses_count: 0 } as Coupon;
    const res = await apiFetch<{ data: Coupon }>("/coupons", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    if (useMock) return;
    await apiFetch(`/coupons/${id}`, { method: "DELETE" });
  },
};

// ─── Chats ────────────────────────────────────────────────────────────────────

export const chats = {
  list: async (): Promise<ChatThread[]> => {
    if (useMock) return mockChatThreads;
    const { data } = await apiFetch<{ data: ChatThread[] }>("/chat/conversations");
    return data;
  },

  send: async (threadId: number, body: string): Promise<void> => {
    if (useMock) return;
    await apiFetch("/chat/messages", {
      method: "POST", body: JSON.stringify({ thread_id: threadId, body }),
    });
  },
};

// ─── Posts (Journal) ──────────────────────────────────────────────────────────

export const posts = {
  list: async (): Promise<Post[]> => {
    if (useMock) return mockPosts;
    const { data } = await apiFetch<{ data: Post[] }>("/posts");
    return data;
  },

  get: async (slug: string): Promise<Post> => {
    if (useMock) {
      const p = mockPosts.find(p => p.slug === slug);
      if (!p) throw new Error("Post not found");
      return p;
    }
    const { data } = await apiFetch<{ data: Post }>(`/posts/${slug}`); // Ensure backend supports finding by slug or id
    return data;
  },

  create: async (data: Partial<Post>): Promise<Post> => {
    if (useMock) return { ...mockPosts[0], ...data, id: Date.now() } as Post;
    const res = await apiFetch<{ data: Post }>("/posts", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: Partial<Post>): Promise<Post> => {
    if (useMock) return { ...mockPosts[0], ...data, id } as Post;
    const res = await apiFetch<{ data: Post }>(`/posts/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    if (useMock) return;
    await apiFetch(`/posts/${id}`, { method: "DELETE" });
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = {
  get: async (): Promise<Setting[]> => {
    if (useMock) return mockSettings;
    const res = await apiFetch<Setting[]>("/settings");
    return res;
  },

  update: async (items: { key: string; value: any; type?: string }[]): Promise<void> => {
    if (useMock) return;
    await apiFetch("/settings", { method: "POST", body: JSON.stringify({ items }) });
  },

  updatePassword: async (data: { current_password: string; password: string; password_confirmation: string }): Promise<void> => {
    if (useMock) return;
    await apiFetch("/settings/change-password", { method: "POST", body: JSON.stringify(data) });
  },
};

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const faqs = {
  list: async (): Promise<any[]> => {
    if (useMock) return [];
    const { data } = await apiFetch<{ data: any[] }>("/faqs");
    return data;
  },
  create: async (data: any): Promise<any> => {
    if (useMock) return data;
    const res = await apiFetch<{ data: any }>("/faqs", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },
  update: async (id: number, data: any): Promise<any> => {
    if (useMock) return data;
    const res = await apiFetch<{ data: any }>(`/faqs/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    if (useMock) return;
    await apiFetch(`/faqs/${id}`, { method: "DELETE" });
  },
};

// ─── Consultations ─────────────────────────────────────────────────────────────

export const consultations = {
  list: async (): Promise<any[]> => {
    if (useMock) return [];
    const { data } = await apiFetch<{ data: any[] }>("/consultations");
    return data;
  },
  create: async (data: any): Promise<any> => {
    if (useMock) return data;
    const res = await apiFetch<{ data: any }>("/consultations", {
      method: "POST", body: JSON.stringify(data),
    });
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<any> => {
    if (useMock) return { id, status };
    const res = await apiFetch<{ data: any }>(`/consultations/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    });
    return res.data;
  },
};

// ─── Procurement ─────────────────────────────────────────────────────────────

export const procurement = {
  stats: async (): Promise<ProcurementStats> => {
    if (useMock) return mockProcurementStats;
    const { data } = await apiFetch<{ data: ProcurementStats }>("/admin/procurement");
    return data;
  },
};
