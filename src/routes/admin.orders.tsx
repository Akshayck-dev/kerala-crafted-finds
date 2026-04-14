import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchOrders, type AdminOrder } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Eye, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrders(token);
        setOrders(data);
      } catch (err) {
        console.error("Orders load error:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Orders</h2>
            <p className="text-sm text-slate-500">Track and manage customer orders.</p>
          </div>
          <button 
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all shadow-slate-200/20 active:scale-[0.98]"
          >
            <FileText className="h-4 w-4 disabled" />
            Export CSV
          </button>
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
                  placeholder="Search by Order ID, Customer, or Status..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
             </div>
             <span className="text-sm font-medium text-slate-500 hidden sm:block">Total: {filteredOrders.length} orders</span>
          </div>

          <div className="overflow-x-auto flex-1 h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   Array.from({length: 6}).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={5} className="p-4"><Skeleton className="h-20 w-full rounded" /></td>
                    </tr>
                   ))
                ) : filteredOrders.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                         No orders found matching your search.
                      </td>
                   </tr>
                ) : (
                  filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{order.id}</span>
                         <span className="text-sm font-bold text-slate-700 mt-1">₹{order.total.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-medium text-slate-800">{order.customerName}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm text-slate-600">{new Date(order.date).toLocaleDateString()}</span>
                       <span className="block text-xs text-slate-400 mt-0.5">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border
                          ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {order.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors" title="View Details">
                           <Eye className="h-3.5 w-3.5" />
                           View
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
