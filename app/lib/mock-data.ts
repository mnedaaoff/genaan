import { Product, Post, User, Order, DashboardStats, ProcurementStats, Customer, Coupon, ChatThread, Setting } from "./types";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    slug: "monstera-deliciosa",
    type: "plant",
    price: 350.00,
    description: "Known for its natural leaf-holes, this beautiful tropical plant is a stunning addition to any indoor space.",
    scientific_name: "Monstera deliciosa",
    inventory: { id: 1, product_id: 1, quantity: 45, reserved: 0, available: 45 },
    images: [{ id: 1, product_id: 1, url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80", alt: "Monstera", sort_order: 1 }],
    plant_care: { id: 1, product_id: 1, watering_days: 7, light_level: "bright", humidity_level: "high" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Snake Plant",
    slug: "snake-plant",
    type: "plant",
    price: 250.00,
    description: "One of the most robust houseplants, requiring very little maintenance. Excellent air purifier.",
    scientific_name: "Sansevieria trifasciata",
    inventory: { id: 2, product_id: 2, quantity: 120, reserved: 5, available: 115 },
    images: [{ id: 2, product_id: 2, url: "https://images.unsplash.com/photo-1599598425947-33004bb152bf?w=800&q=80", alt: "Snake Plant", sort_order: 1 }],
    plant_care: { id: 2, product_id: 2, watering_days: 14, light_level: "low", humidity_level: "low" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Terracotta Pot Mix",
    slug: "terracotta-pot-mix",
    type: "pot",
    price: 150.00,
    description: "Classic breathable terracotta pot, perfect for plants that prefer dry soil.",
    inventory: { id: 3, product_id: 3, quantity: 200, reserved: 10, available: 190 },
    images: [{ id: 3, product_id: 3, url: "https://images.unsplash.com/photo-1510101869800-2495bbca82ce?w=800&q=80", alt: "Terracotta Pot", sort_order: 1 }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Premium Soil Blend",
    slug: "premium-soil",
    type: "soil",
    price: 120.00,
    description: "Nutrient-rich organic soil blend suitable for most indoor plants.",
    inventory: { id: 4, product_id: 4, quantity: 85, reserved: 2, available: 83 },
    images: [{ id: 4, product_id: 4, url: "https://images.unsplash.com/photo-1598514982205-f36b96d1aa8d?w=800&q=80", alt: "Soil", sort_order: 1 }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockPosts: Post[] = [
  {
    id: 1,
    title: "10 Best Indoor Plants for Beginners",
    slug: "10-best-indoor-plants-beginners",
    excerpt: "Starting your plant journey? Here are the most forgiving plants that will thrive in almost any environment.",
    body: "Full content here...",
    published: true,
    cover_image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1200&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: { id: 1, name: "Sarah Green" }
  },
  {
    id: 2,
    title: "The Ultimate Guide to Watering Your Plants",
    slug: "ultimate-guide-watering-plants",
    excerpt: "Master the art of watering. Learn when, how, and exactly how much to water your green friends.",
    body: "Full content here...",
    published: true,
    cover_image: "https://images.unsplash.com/photo-1545241047-6083a36ee15f?w=1200&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const mockOrders: Order[] = [
  {
    id: 1001,
    user_id: 1,
    status: "pending",
    payment_status: "paid",
    subtotal: 350.00,
    total: 350.00,
    discount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: { id: 1, name: "Ahmed", email: "ahmed@example.com" },
    items: [
      { id: 1, order_id: 1001, product_id: 1, quantity: 1, unit_price: 350.00, total: 350.00, product: mockProducts[0] }
    ],
    address: { id: 1, user_id: 1, line1: "123 Nile Street", city: "Cairo", state: "Cairo", postcode: "12345", country: "Egypt", is_default: true },
    events: [
      { id: 1, order_id: 1001, event: "Order placed", created_at: new Date().toISOString() }
    ]
  }
];

export const mockDashboardStats: DashboardStats = {
  total_revenue: 125000,
  total_users: 1250,
  active_orders: 48,
  low_stock_count: 5,
  sales_by_day: [
    { date: "2023-10-01", revenue: 1500 },
    { date: "2023-10-02", revenue: 2100 },
  ],
  top_products: [
    { id: 1, name: "Monstera Deliciosa", revenue: 15000, units: 42 }
  ],
  recent_activity: [
    { id: 1, description: "New order placed by Ahmed", created_at: new Date().toISOString() }
  ]
};

export const mockProcurementStats: ProcurementStats = {
  by_category: [
    { category: "plant", stock: 450, reserved: 20 },
    { category: "pot", stock: 200, reserved: 10 },
  ],
  fulfillment_rate: 0.98,
  budget_allocated: 500000,
  budget_used: 250000,
  recent_logs: []
};

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Ahmed Mohamed",
    email: "ahmed@example.com",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_orders: 5,
    lifetime_spend: 2500,
    last_order_at: new Date().toISOString()
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: 1,
    code: "WELCOME10",
    type: "percent",
    value: 10,
    uses_count: 45,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const mockChatThreads: ChatThread[] = [
  {
    id: 1,
    user_id: 1,
    user: { id: 1, name: "Ahmed Mohamed", email: "ahmed@example.com" },
    unread_count: 1,
    created_at: new Date().toISOString()
  }
];

export const mockSettings: Setting[] = [
  { key: "site_name", value: "Genaan" },
  { key: "currency", value: "EGP" },
  { key: "shipping_flat_rate", value: "75" },
];
