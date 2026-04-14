import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchProducts, fetchMembers, fetchOrders, type Member, type AdminOrder } from "@/lib/api";
import { type Product } from "@/lib/data";
import { Package, ShoppingCart, Users, BadgeDollarSign, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

// Extracted reusable StatCard component (memoized for performance)
const StatCard = React.memo(({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="flex flex-col bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      <div className={`p-2 rounded-lg ${color} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <span className="text-2xl font-bold text-slate-800">{value}</span>
  </div>
));
StatCard.displayName = "StatCard";

function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const [pData, mData, oData] = await Promise.all([
          fetchProducts(),
          fetchMembers(token),
          fetchOrders(token)
        ]);
        
        setProducts(pData);
        setMembers(mData);
        setOrders(oData);
      } catch (err) {
        console.error("Dashboard data load error:", err);
        setError("Failed to load dashboard metrics. Please check your connection or try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  // Compute statistics safely
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  // Mock low stock logic (e.g. 5% of products are low stock roughly)
  const lowStockCount = Math.floor(products.length * 0.05) || 2; 

  const statCards = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: BadgeDollarSign, color: "bg-emerald-500" },
    { title: "Total Orders", value: orders.length, icon: ShoppingCart, color: "bg-blue-500" },
    { title: "Total Products", value: products.length, icon: Package, color: "bg-purple-500" },
    { title: "Total Members", value: members.length, icon: Users, color: "bg-indigo-500" },
    { title: "Pending Orders", value: pendingOrders, icon: Clock, color: "bg-amber-500" },
    { title: "Low Stock Items", value: lowStockCount, icon: AlertTriangle, color: "bg-rose-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Overview</h2>
          <p className="text-sm text-slate-500">Real-time store metrics and recent activity.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-600 border border-red-500/20 shadow-sm">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          {isLoading 
            ? Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            : statCards.map((stat, index) => (
               <StatCard key={index} {...stat} />
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                     <tr><td colSpan={5} className="p-4 text-center"><Skeleton className="h-48 w-full" /></td></tr>
                  ) : error ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500">Error loading orders.</td></tr>
                  ) : orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                          ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-amber-100 text-amber-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">₹{order.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {!isLoading && !error && orders.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No recent orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Registered Members</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                     <tr><td colSpan={3} className="p-4 text-center"><Skeleton className="h-48 w-full" /></td></tr>
                  ) : error ? (
                     <tr><td colSpan={3} className="px-6 py-8 text-center text-red-500">Error loading members.</td></tr>
                  ) : members.slice(0, 5).map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-medium text-slate-900">{member.name}</span>
                           <span className="text-xs text-slate-500">ID: {member.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-slate-600">{member.email}</span>
                           <span className="text-slate-500 text-xs">{member.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded bg-blue-50 transition-colors mr-2">Edit</button>
                        <button className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded bg-red-50 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && !error && members.length === 0 && (
                     <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
