import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchMembers, fetchProducts, fetchOrders, type AdminOrder } from "@/lib/api";
import { type Member, type Product } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Search, 
  ArrowUpDown,
  ExternalLink,
  Store,
  Award,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

interface SellerStat {
  memberId: string;
  name: string;
  businessName: string;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  joinedDate: string;
}

function AdminAnalytics() {
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof SellerStat; direction: 'asc' | 'desc' }>({
    key: 'totalRevenue',
    direction: 'desc'
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [mList, pList, oList] = await Promise.all([
          fetchMembers(),
          fetchProducts(false),
          fetchOrders()
        ]);
        setMembers(mList);
        setProducts(pList);
        setOrders(oList);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const sellerStats = useMemo(() => {
    const statsMap: Record<string, SellerStat> = {};

    // Initialize map with all members
    members.forEach(m => {
      statsMap[m.id] = {
        memberId: m.id,
        name: m.name || "N/A",
        businessName: m.businessName || "N/A",
        totalOrders: 0,
        totalRevenue: 0,
        totalProductsSold: 0,
        joinedDate: m.joinedDate || ""
      };
    });

    // Create Product ID -> Member ID mapping
    const productToMember: Record<string, string> = {};
    products.forEach(p => {
      if (p.memberID) {
        productToMember[p.id.toString()] = p.memberID.toString();
      }
    });

    // Process orders
    orders.forEach(order => {
      const orderProducts = order.products || [];
      const orderSellers = new Set<string>();

      orderProducts.forEach(item => {
        const pid = (item.productId || (item as any).ProductId || (item as any).ProductID || "").toString();
        const sellerId = productToMember[pid];
        
        if (sellerId && statsMap[sellerId]) {
          const product = products.find(p => p.id.toString() === pid);
          if (product) {
            const quantity = Number(item.quantity || (item as any).Quantity || 1);
            statsMap[sellerId].totalRevenue += product.price * quantity;
            statsMap[sellerId].totalProductsSold += quantity;
            orderSellers.add(sellerId);
          }
        }
      });

      // Count unique orders per seller
      orderSellers.forEach(sid => {
        if (statsMap[sid]) {
          statsMap[sid].totalOrders += 1;
        }
      });
    });

    return Object.values(statsMap);
  }, [members, products, orders]);

  const filteredStats = useMemo(() => {
    return sellerStats
      .filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        
        return sortConfig.direction === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      });
  }, [sellerStats, searchTerm, sortConfig]);

  const handleSort = (key: keyof SellerStat) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const totals = useMemo(() => {
    return sellerStats.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.totalRevenue,
      orders: acc.orders + curr.totalOrders,
      products: acc.products + curr.totalProductsSold
    }), { revenue: 0, orders: 0, products: 0 });
  }, [sellerStats]);

  const topSeller = useMemo(() => {
    if (sellerStats.length === 0) return null;
    return [...sellerStats].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  }, [sellerStats]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent uppercase tracking-tight">Seller Analytics</h2>
            <p className="text-sm text-slate-500">Track and analyze individual seller performance across the platform.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
             <TrendingUp className="h-3 w-3" /> Live Data
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            title="Total Marketplace Revenue" 
            value={`₹${totals.revenue.toLocaleString()}`} 
            icon={DollarSign} 
            color="blue"
            isLoading={isLoading}
          />
          <SummaryCard 
            title="Total Orders Fulfilled" 
            value={totals.orders.toLocaleString()} 
            icon={ShoppingBag} 
            color="amber"
            isLoading={isLoading}
          />
          <SummaryCard 
            title="Active Sellers" 
            value={members.length.toString()} 
            icon={Users} 
            color="purple"
            isLoading={isLoading}
          />
          <SummaryCard 
            title="Top Performing Business" 
            value={topSeller?.businessName || "N/A"} 
            icon={Award} 
            color="emerald"
            isLoading={isLoading}
          />
        </div>

        {/* Detailed Sellers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search seller or business name..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                   <button 
                    onClick={() => handleSort('totalRevenue')}
                    className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", sortConfig.key === 'totalRevenue' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                   >
                     REVENUE
                   </button>
                   <button 
                    onClick={() => handleSort('totalOrders')}
                    className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", sortConfig.key === 'totalOrders' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                   >
                     ORDERS
                   </button>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Seller Details</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('totalRevenue')}>
                    <div className="flex items-center gap-1">Total Revenue <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('totalOrders')}>
                    <div className="flex items-center gap-1">Orders <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('totalProductsSold')}>
                    <div className="flex items-center gap-1">Items Sold <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4"><Skeleton className="h-12 w-full rounded-xl" /></td>
                    </tr>
                  ))
                ) : filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                      No matching sellers found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat.memberId} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xs shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
                             {stat.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{stat.businessName}</p>
                            <p className="text-xs text-slate-400 mt-1">{stat.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900">
                        ₹{stat.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {stat.totalOrders} Orders
                         </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 font-medium">
                        {stat.totalProductsSold} Units
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                               <span>{Math.min(100, Math.round((stat.totalRevenue / (topSeller?.totalRevenue || 1)) * 100))}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, Math.round((stat.totalRevenue / (topSeller?.totalRevenue || 1)) * 100))}%` }}
                               />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Link 
                              to="/admin/orders" 
                              search={{ seller: stat.businessName }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Seller Orders"
                            >
                               <ShoppingBag className="h-4 w-4" />
                            </Link>
                            <Link 
                              to="/admin/products" 
                              search={{ seller: stat.businessName }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="View Seller Products"
                            >
                               <Package className="h-4 w-4" />
                            </Link>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ title, value, icon: Icon, color, isLoading }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: 'blue' | 'amber' | 'purple' | 'emerald';
  isLoading: boolean;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl border transition-transform group-hover:scale-110", colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {!isLoading && (
           <TrendingUp className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", colors[color].split(' ')[1])} />
        )}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-24 rounded-lg" />
      ) : (
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      )}
    </div>
  );
}
