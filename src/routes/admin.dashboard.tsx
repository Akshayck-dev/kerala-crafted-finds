import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Link } from "@tanstack/react-router";
import { fetchProducts, fetchMembers, fetchOrders } from "@/lib/api";
import { type Product, type Member, type Order } from "@/lib/data";
import { Package, ShoppingCart, Users, BadgeDollarSign, AlertTriangle, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

// Extracted reusable StatCard component
const StatCard = React.memo(({ title, value, icon: Icon, color, trend, error }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  error?: boolean;
}) => (
  <div className={cn(
    "flex flex-col bg-white p-6 rounded-xl border shadow-sm transition-all hover:shadow-md hover:border-slate-300 group relative",
    error ? "border-red-200" : "border-slate-200"
  )}>
    {error && (
      <div className="absolute top-2 right-2 text-red-500" title="Data failed to load">
        <AlertTriangle className="h-4 w-4" />
      </div>
    )}
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    <div className="flex flex-col">
        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{title}</span>
    </div>
  </div>
));
StatCard.displayName = "StatCard";

function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      let failedModules: string[] = [];

      try {
        // Sequentially fetch data without staggered delay for maximum speed
        try {
          const p = await fetchProducts();
          setProducts(p);
        } catch (err: any) {
          console.error("Products Load Error:", err);
          failedModules.push(`Products (${err.message})`);
        }

        try {
          const m = await fetchMembers();
          setMembers(m);
        } catch (err: any) {
          console.error("Members Load Error:", err);
          failedModules.push(`Members (${err.message})`);
        }

        try {
          const o = await fetchOrders();
          console.log("[DASHBOARD AUDIT] Orders fetched successfully:", o.length);
          setOrders(o);
        } catch (err: any) {
          console.error("Orders Load Error:", err);
          failedModules.push(`Orders (${err.message})`);
        }
        
        if (failedModules.length > 0) {
          setError(`Partial Data Load: ${failedModules.join(" | ")}`);
        }
      } catch (err) {
        console.error("System-level Dashboard error:", err);
        setError("Dashboard services unavailable. Reconnecting...");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  // Compute statistics safely
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status.toLowerCase() === "pending").length;
  const lowStockCount = products.filter(p => Number(p.quantity || 0) < 5).length;

  const statCards = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: BadgeDollarSign, color: "bg-emerald-600", trend: "+12.5%", error: !orders.length && !!error },
    { title: "Total Orders", value: orders.length, icon: ShoppingCart, color: "bg-blue-600", trend: "+8%", error: !orders.length && !!error },
    { title: "Active Products", value: products.length, icon: Package, color: "bg-indigo-600", error: !products.length && !!error },
    { title: "Sellers", value: members.length, icon: Users, color: "bg-purple-600", error: !members.length && !!error },
    { title: "Pending", value: pendingOrdersCount, icon: Clock, color: "bg-amber-500", error: !orders.length && !!error },
    { title: "Low Stock", value: lowStockCount, icon: AlertTriangle, color: "bg-rose-600", error: !products.length && !!error },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };
  
  const resolveOrderSeller = (order: Order) => {
    if (!order.products || order.products.length === 0) return { name: "N/A", business: "N/A" };
    const firstProductId = order.products[0].productId.toString();
    const firstProduct = products.find(p => p.id === firstProductId);
    if (!firstProduct) return { name: "N/A", business: "N/A" };
    
    const member = members.find(m => Number(m.id) === firstProduct.memberID);
    return {
      name: firstProduct.sellerName || member?.name || "N/A",
      business: firstProduct.businessName || member?.businessName || "N/A"
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Snapshot of your business performance today.</p>
          </div>
          <div className="hidden sm:block">
             <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Sync Alpha</span>
             </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-600/5 p-4 text-xs font-bold text-red-600 border border-red-600/10 shadow-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading 
            ? Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            : statCards.map((stat, index) => (
               <StatCard key={index} {...stat} />
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Fulfillment Activity</h3>
              <Link to="/admin/orders" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All Orders</Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-400 text-[10px] uppercase font-black border-b">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Seller</th>
                    <th className="px-6 py-4">Business</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic font-medium">
                  {isLoading ? (
                     Array.from({length: 5}).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                     ))
                  ) : orders.slice(0, 8).map((order) => {
                    const sellerInfo = resolveOrderSeller(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                        <td className="px-6 py-4">
                            <span className="font-mono text-[11px] text-slate-400 group-hover:text-slate-900 font-bold">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                              <span className="text-slate-900 font-bold">{order.customerName ?? "Guest User"}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.createdOn || order.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">{sellerInfo.name}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-[10px] text-slate-500 uppercase">{sellerInfo.business}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 font-black text-slate-900">
                              <span>₹{order.totalPrice}</span>
                              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                   {!isLoading && orders.length === 0 && (
                     <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No transaction history detected.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Low Stock Alerts</h3>
              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px]">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : products.filter(p => Number(p.quantity || 0) < 5).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Levels Healthy</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {products.filter(p => Number(p.quantity || 0) < 5).map(product => (
                            <div key={product.id} className="p-4 hover:bg-rose-50/30 transition-colors flex items-center gap-4 group">
                                <div className="h-10 w-10 rounded-lg overflow-hidden border bg-slate-50 shrink-0">
                                    <img src={product.image} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" onError={(e) => e.currentTarget.src = "/placeholder.svg"}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{product.name}</p>
                                    <p className="text-[10px] font-bold text-rose-600 mt-1 uppercase">Only {product.quantity} {product.unit} left</p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-300" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-slate-50/50">
                <button className="w-full py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">Restock All</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
