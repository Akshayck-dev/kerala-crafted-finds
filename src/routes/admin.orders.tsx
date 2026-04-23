import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchOrders } from "@/lib/api";
import { type Order } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ShoppingBag, Calendar, ArrowUpRight, Eye } from "lucide-react";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      seller: (search.seller as string) || undefined,
    }
  },
});

function AdminOrders() {
  const search = Route.useSearch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(search.seller || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err: any) {
        console.error("Orders load error:", err);
        setError(err.message || "Failed to load orders. Please check your token or connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(o => 
    (o.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.id.toString()).includes(searchTerm) ||
    // Search in seller names if provided by the product lookup (though orders don't have them directly, 
    // it helps if the admin types the business name manually)
    (o as any).businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o as any).sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => { localStorage.removeItem('adminToken'); window.location.reload(); }} className="p-2 border border-red-500 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Refresh & Re‑login</button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Orders</h2>
            <p className="text-sm text-slate-500">Track and fulfill customer orders.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-sm">
               <Filter className="h-4 w-4 text-slate-500" />
            </button>
            <div className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/20 flex items-center gap-1.5">
               <ShoppingBag className="h-3 w-3" />
               {orders.length} Total
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-600 border border-red-500/20 shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Customer Name or Order ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
             </div>
             <span className="text-sm font-medium text-slate-500 hidden sm:block whitespace-nowrap">Showing {filteredOrders.length} records</span>
          </div>

          <div className="overflow-x-auto flex-1 h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-slate-900 border-b">ID</th>
                  <th className="px-6 py-4 text-slate-900 border-b">Customer</th>
                  <th className="px-6 py-4 text-slate-900 border-b">Date</th>
                  <th className="px-6 py-4 text-slate-900 border-b">Value</th>
                  <th className="px-6 py-4 text-slate-900 border-b">Status</th>
                  <th className="px-6 py-4 text-right text-slate-900 border-b">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   Array.from({length: 6}).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={6} className="p-4"><Skeleton className="h-16 w-full rounded" /></td>
                    </tr>
                   ))
                ) : filteredOrders.length === 0 ? (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                         No orders found. Fulfillments will appear here.
                      </td>
                   </tr>
                ) : (
                  filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-500">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{order.customerName ?? "N/A"}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{order.phone || "No contact"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                         <Calendar className="h-3.5 w-3.5" />
                         <span className="text-xs">{new Date(order.createdOn || order.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                         <span>₹{order.totalPrice}</span>
                         <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-tighter`}>
                         {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleViewDetails(order)}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95" 
                         title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />
    </AdminLayout>
  );
}
