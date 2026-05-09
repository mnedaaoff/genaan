"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";
import { dashboard, procurement, customers, orders } from "@/app/lib/api";
import type {
  DashboardStats,
  ProcurementStats,
  Customer,
  Order,
  PaginatedResponse,
} from "@/app/lib/types";

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "orders" | "customers">("overview");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [procurementStats, setProcurementStats] = useState<ProcurementStats | null>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/");
    }
  }, [isLoading, isAdmin, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === "overview") {
          const stats = await dashboard.stats();
          setDashboardStats(stats);
        } else if (activeTab === "inventory") {
          const stats = await procurement.stats();
          setProcurementStats(stats);
        } else if (activeTab === "orders") {
          const data = await orders.list();
          setOrdersList(data.data);
        } else if (activeTab === "customers") {
          const data = await customers.list();
          setCustomersList(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: "overview", label: "Overview" },
              { id: "inventory", label: "Inventory" },
              { id: "orders", label: "Orders" },
              { id: "customers", label: "Customers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && dashboardStats && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${dashboardStats.total_revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardStats.total_users}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardStats.active_orders}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      {dashboardStats.low_stock_count}
                    </p>
                  </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sales by Day
                  </h3>
                  <div className="space-y-2">
                    {dashboardStats.sales_by_day.map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{day.date}</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (day.revenue / Math.max(...dashboardStats.sales_by_day.map((d) => d.revenue))) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                          ${day.revenue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Products by Revenue
                    </h3>
                    <div className="space-y-3">
                      {dashboardStats.top_products.map((product, idx) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {idx + 1}. {product.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {product.units} units sold
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">
                            ${product.revenue.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {dashboardStats.recent_activity.map((activity) => (
                        <div key={activity.id} className="p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && procurementStats && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Fulfillment Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(procurementStats.fulfillment_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Budget Allocated</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${procurementStats.budget_allocated.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Budget Used</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${procurementStats.budget_used.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      $
                      {(procurementStats.budget_allocated - procurementStats.budget_used).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Stock by Category */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Stock by Category
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Category
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Stock
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Reserved
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            Available
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {procurementStats.by_category.map((item) => (
                          <tr key={item.category} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-900">{item.category}</td>
                            <td className="py-3 px-4 text-right text-gray-600">
                              {item.stock}
                            </td>
                            <td className="py-3 px-4 text-right text-orange-600 font-medium">
                              {item.reserved}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">
                              {item.stock - item.reserved}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Inventory Logs
                  </h3>
                  <div className="space-y-2">
                    {procurementStats.recent_logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.product?.name} ({log.type})
                          </p>
                          <p className="text-xs text-gray-600">{log.note || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              log.type === "in" || log.type === "release"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {log.type === "in" || log.type === "release" ? "+" : "-"}
                            {log.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.user?.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                          ${order.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Total Orders
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Lifetime Spend
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{customer.email}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                          {customer.total_orders}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">
                          ${customer.lifetime_spend.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {customer.last_order_at
                            ? new Date(customer.last_order_at).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
