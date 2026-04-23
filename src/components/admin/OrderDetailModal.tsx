import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Order, type Product, type Member } from "@/lib/data";
import { fetchProducts, fetchMembers } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, User, MapPin, Calendar, Clock, CreditCard } from "lucide-react";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      loadProducts();
    }
  }, [isOpen, order]);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const [productData, memberData] = await Promise.all([
        fetchProducts(false),
        fetchMembers()
      ]);
      setProducts(productData);
      setMembers(memberData);
    } catch (err) {
      console.error("Failed to load products for order details:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!order) return null;

  // Resolve product from ID
  const resolveProduct = (id: string | number) => {
    return products.find(p => p.id === id.toString() || p.id === id);
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white p-0">
        {console.log("[DEBUG] OrderDetailModal order:", order)}
        <div className="p-6 border-b bg-slate-50">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-bold text-slate-900">Order Details V2</DialogTitle>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                         Placed on {new Date(order.createdOn || order.date).toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400 block">Order ID</span>
                    <span className="font-mono text-sm font-bold text-slate-900">#{order.id}</span>
                </div>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
            {/* Customer Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Customer Info
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-sm text-slate-500 mt-1">{order.phone || "No contact info"}</p>
                        <p className="text-xs text-blue-600 mt-1 font-medium">{order.email}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> Shipping Address
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <p className="text-sm text-slate-700">{order.address || "No address provided"}</p>
                    </div>
                </div>
            </section>

            {/* Product Items */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" /> Order Items
                </h3>
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-left">Seller</th>
                                <th className="px-4 py-3 text-left">Business</th>
                                <th className="px-4 py-3 text-right">Price</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                <tr colSpan={4} className="p-4"><Skeleton className="h-12 w-full" /></tr>
                            ) : !order.products || order.products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No item details available</td>
                                </tr>
                            ) : (
                                order.products.map((item, idx) => {
                                    const p = resolveProduct(item.productId);
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded bg-slate-100 shrink-0 border overflow-hidden flex items-center justify-center">
                                                        {p && p.image ? (
                                                            <img 
                                                                src={p.image} 
                                                                alt={p.name} 
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                            />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-900 text-xs">{p ? p.name : `Product #${item.productId}`}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-medium">{item.quantity}</td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                                                    {p?.sellerName || members.find(m => Number(m.id) === p?.memberID)?.name || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] text-slate-500 uppercase font-medium">
                                                    {p?.businessName || members.find(m => Number(m.id) === p?.memberID)?.businessName || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-xs">₹{p?.price || '--'}</td>
                                            <td className="px-4 py-4 text-right font-bold text-slate-900 text-xs">
                                                {p ? `₹${p.price * item.quantity}` : '--'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50/50">
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-right text-slate-500 font-medium">Subtotal</td>
                                <td className="px-4 py-3 text-right font-semibold">₹{order.totalPrice}</td>
                            </tr>
                            <tr className="border-t">
                                <td colSpan={5} className="px-4 py-4 text-right text-slate-900 font-bold">Total</td>
                                <td className="px-4 py-4 text-right text-lg font-black text-blue-600">₹{order.totalPrice}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>

            {/* Payment Info */}
             <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" /> Payment Method
                </h3>
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-emerald-50/30 border-emerald-100/50">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Verified Provider</p>
                    </div>
                </div>
            </section>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
                >
                Close
             </button>
             <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20">
                Download Invoice
             </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
