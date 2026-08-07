import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchReviews, adminAddOrUpdateReview, fetchProducts } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MessageSquare, Star, Edit, MapPin, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

interface ReviewItem {
  id: string;
  reviewerName: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
  isActive: boolean;
  productId?: string;
  productName?: string;
}

function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [productsList, setProductsList] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Partial<ReviewItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadAllReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const products = await fetchProducts(false);
      setProductsList(products);
      let localReviews: ReviewItem[] = [];

      products.forEach((p) => {
        const storageKey = `product_reviews_${p.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((r: any) => {
                localReviews.push({
                  id: r.id || `${p.id}-${Date.now()}-${Math.random()}`,
                  reviewerName: r.reviewerName || r.name || "Anonymous",
                  location: r.location || "Kerala",
                  rating: Number(r.rating || r.star || 5),
                  date: r.date || new Date().toISOString().split('T')[0],
                  comment: r.comment || r.comments || "",
                  isVerified: r.isVerified ?? true,
                  isActive: r.isActive ?? true,
                  productId: p.id,
                  productName: p.name,
                });
              });
            }
          } catch (e) {
            console.error("Failed to parse reviews for product:", p.id, e);
          }
        }
      });

      // 2. Fetch backend global reviews
      const backendReviews = await fetchReviews();

      // 3. Merge backend and local reviews, prioritizing backend IDs
      const mergedMap = new Map<string, ReviewItem>();
      
      // Seed initial reviews if none in local storage or backend
      const seedReviewsList: ReviewItem[] = [];
      if (localReviews.length === 0 && backendReviews.length === 0) {
        products.slice(0, 3).forEach((p) => {
          seedReviewsList.push({
            id: `seed-${p.id}-1`,
            reviewerName: "Rahul Krishnan",
            location: "Kochi",
            rating: 5,
            date: "2026-07-25",
            comment: "Wonderful quality, packaging was neat and fresh!",
            isVerified: true,
            isActive: true,
            productId: p.id,
            productName: p.name,
          });
          seedReviewsList.push({
            id: `seed-${p.id}-2`,
            reviewerName: "Meera Nair",
            location: "Trivandrum",
            rating: 4,
            date: "2026-07-28",
            comment: "Authentic tastes, very nostalgic product.",
            isVerified: true,
            isActive: true,
            productId: p.id,
            productName: p.name,
          });
        });
      }

      // Merge seed data
      seedReviewsList.forEach(r => mergedMap.set(r.id, r));
      // Merge local storage reviews
      localReviews.forEach(r => mergedMap.set(r.id, r));
      // Merge backend reviews
      backendReviews.forEach((r: any) => {
        const prod = products.find((p: any) => p.id.toString() === r.productId?.toString());
        mergedMap.set(r.id, {
          id: r.id,
          reviewerName: r.reviewerName || "Anonymous",
          location: r.location || "Kerala",
          rating: Number(r.rating),
          date: r.date,
          comment: r.comment,
          isVerified: true,
          isActive: r.isActive ?? true,
          productId: r.productId,
          productName: prod ? prod.name : undefined,
        });
      });

      setReviews(Array.from(mergedMap.values()).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err: any) {
      console.error("Reviews load error:", err);
      setError(err.message || "Failed to load reviews list.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllReviews();
  }, []);

  const handleAdd = () => {
    setSelectedReview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (review: ReviewItem) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement).value;
    const comments = (form.elements.namedItem("comments") as HTMLTextAreaElement).value;
    const star = Number((form.elements.namedItem("star") as HTMLSelectElement).value);
    const isActive = (form.elements.namedItem("isActive") as HTMLInputElement).checked;
    
    const productIdSelect = (form.elements.namedItem("productId") as HTMLSelectElement).value;
    const cleanProductId = productIdSelect === "general" ? 0 : Number(productIdSelect);
    const reviewType: "Product" | "Platform" = productIdSelect === "general" ? "Platform" : "Product";

    setIsSaving(true);
    try {
      const reviewId = selectedReview?.id ? Number(selectedReview.id.replace(/\D/g, '')) || 0 : 0;
      
      await adminAddOrUpdateReview({
        id: reviewId,
        name,
        location,
        star,
        comments,
        isActive,
        productId: cleanProductId,
        reviewType: reviewType
      });

      toast.success(selectedReview ? "Review updated successfully." : "Review created successfully.");
      
      // Update local storage too if it's associated with a product
      if (selectedReview?.productId) {
        const key = `product_reviews_${selectedReview.productId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            let parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              if (selectedReview.id) {
                parsed = parsed.map(r => r.id === selectedReview.id ? { ...r, reviewerName: name, location, rating: star, comment: comments, isActive } : r);
              } else {
                parsed.unshift({ id: `review-${Date.now()}`, reviewerName: name, location, rating: star, comment: comments, isVerified: true, isActive });
              }
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      await loadAllReviews();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save review error:", err);
      toast.error(err.message || "Failed to save review details.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.reviewerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.productName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === "all" || r.rating === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Reviews</h2>
            <p className="text-sm text-slate-500">Manage, edit, and approve customer ratings and testimonials.</p>
          </div>
          <Button onClick={handleAdd} className="rounded-xl flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-wider text-xs shadow-md">
            <Plus className="h-4 w-4" /> Add Review
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-600 border border-red-500/20 shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, reviewers, products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Filter rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((s) => (
                  <option key={s} value={s}>{s} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Reviewer</th>
                  <th className="px-6 py-3.5 text-left">Product / Target</th>
                  <th className="px-6 py-3.5 text-center">Rating</th>
                  <th className="px-6 py-3.5 text-left">Comments</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-36 rounded" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-64 rounded" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-7 w-14 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      No customer reviews found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {review.reviewerName}
                            {review.isVerified && <span className="h-3 w-3 rounded-full bg-green-500/10 text-green-700 flex items-center justify-center" title="Verified Buyer"><CheckCircle2 className="h-2 w-2" /></span>}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {review.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.productName ? (
                          <div>
                            <span className="font-bold text-slate-800 text-xs line-clamp-1">{review.productName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ID: {review.productId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Global / General Feedback</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded-lg text-xs font-extrabold shadow-sm">
                          <span>{review.rating}</span>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 max-w-[280px] line-clamp-2 leading-relaxed font-medium">
                          {review.comment}
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {review.date}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          review.isActive 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {review.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Review"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[450px] bg-white p-0">
          <div className="p-6 border-b bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {selectedReview ? "Edit Review Details" : "Create Customer Review"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
             <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Product (ReviewType = Product)</label>
              <select
                name="productId"
                defaultValue={(!selectedReview?.productId || selectedReview?.productId === "0" || selectedReview?.productId === "") ? "general" : selectedReview.productId}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="general">Global / General Feedback</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                ))}
              </select>
             </div>

             <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reviewer Name</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={selectedReview?.reviewerName || ""}
                placeholder="Enter reviewer name"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500/50"
              />
             </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={selectedReview?.location || "Kerala"}
                  placeholder="e.g. Kochi"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Star Rating</label>
                <select
                  name="star"
                  defaultValue={selectedReview?.rating || 5}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>{s} Stars</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Review Comments</label>
              <textarea
                name="comments"
                required
                rows={4}
                defaultValue={selectedReview?.comment || ""}
                placeholder="What feedback did this reviewer leave?"
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={selectedReview ? selectedReview.isActive : true}
                className="h-4.5 w-4.5 rounded border-slate-200 focus:ring-blue-500/20 text-blue-600"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-700 select-none cursor-pointer uppercase tracking-wider">
                Visible to customers (Active)
              </label>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-600/10"
              >
                {isSaving ? "Saving..." : "Save Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
