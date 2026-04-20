import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchProducts, deleteProduct } from "@/lib/api";
import { type Product } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import { ProductModal } from "@/components/admin/ProductModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  
  // Delete dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("[Admin] Fetching all products including inactive ones...");
      const data = await fetchProducts(false); // Fetch ALL including inactive
      console.log(`[Admin] Received ${data.length} products total.`);
      setProducts(data);
    } catch (err: any) {
      console.error("[Admin] Sync error:", err);
      setError(err.message || "Failed to sync with Mallu Smart backend. Please check your connection.");
      toast.error("Sync failed. Redirecting to login if session expired...");
    } finally {
      setIsLoading(true); // Keep skeleton for a tiny bit longer for smoother transition
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(Number(productToDelete));
      await loadProducts();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.categoryName ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = showInactive ? true : p.isActive !== false;
    return matchesSearch && matchesActivity;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Products</h2>
            <p className="text-sm text-slate-500">Manage your store inventory and catalog.</p>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-600 border border-red-500/20 shadow-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-4">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products by name or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="show-inactive" 
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="show-inactive" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                        Show Inactive
                    </label>
                </div>
                <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
                <span className="text-sm font-medium text-slate-500 hidden sm:block">Total: {filteredProducts.length} items</span>
             </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-slate-900">Product</th>
                  <th className="px-6 py-4 text-slate-900">Category</th>
                  <th className="px-6 py-4 text-slate-900">Status</th>
                  <th className="px-6 py-4 text-slate-900">Price / Stock</th>
                  <th className="px-6 py-4 text-slate-900">Provider</th>
                  <th className="px-6 py-4 text-right text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   Array.from({length: 6}).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={6} className="p-4"><Skeleton className="h-16 w-full rounded" /></td>
                    </tr>
                   ))
                ) : filteredProducts.length === 0 ? (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                         No products found matching your search.
                      </td>
                   </tr>
                ) : (
                  filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover" 
                                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                            />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{product.name ?? "N/A"}</span>
                            <span className="text-xs text-slate-500 mt-0.5">ID: {product.id}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                         {product.categoryName ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isActive !== false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-900">₹{product.price}</span>
                             {product.originalPrice && <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>}
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{product.quantity} {product.unit}</span>
                            {Number(product.quantity || 0) < 5 && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded uppercase font-bold animate-pulse">Low Stock</span>
                            )}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-600 text-xs font-medium">{product.sellerName ?? "Mallu Smart"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors" 
                            title="Edit"
                        >
                           <Edit className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => confirmDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors" 
                            title="Delete"
                        >
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

      {/* Product Edit/Add Modal */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={loadProducts}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
