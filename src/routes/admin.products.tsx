import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchProducts } from "@/lib/api";
import { type Product } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Products load error:", err);
        setError("Failed to load products. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Products</h2>
            <p className="text-sm text-slate-500">Manage your store inventory and catalog.</p>
          </div>
          <button 
            onClick={() => alert("The actual Add Product API is still under development by your backend team!")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Product
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
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
             </div>
             <span className="text-sm font-medium text-slate-500 hidden sm:block">Total: {filteredProducts.length} items</span>
          </div>

          <div className="overflow-x-auto flex-1 h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   Array.from({length: 6}).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={5} className="p-4"><Skeleton className="h-16 w-full rounded" /></td>
                    </tr>
                   ))
                ) : filteredProducts.length === 0 ? (
                   <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                         No products found matching your search.
                      </td>
                   </tr>
                ) : (
                  filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                            <span className="text-xs text-slate-500 mt-0.5">ID: {product.id}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize border border-slate-200">
                         {product.categoryName || product.category.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="font-medium text-slate-900">₹{product.price}</span>
                         {product.originalPrice && <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-600">{product.sellerName || "Mallu Smart"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" title="Edit">
                           <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors" title="Delete">
                           <Trash2 className="h-4 w-4" />
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
