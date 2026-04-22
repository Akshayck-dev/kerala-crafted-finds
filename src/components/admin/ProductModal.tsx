import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addOrUpdateProduct, fetchCategories, fetchMembers } from "@/lib/api";
import { type Product, type Category, type Member } from "@/lib/data";
import { Loader2, Upload } from "lucide-react";

interface ProductModalProps {
  product: Partial<Product> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ product, isOpen, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "0",
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    unit: "pcs",
    categoryID: 0,
    memberID: 1,
    isActive: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (product) {
      console.log("Edit Product:", product);
      setFormData({
        ...product,
        id: product.id || "0",
        name: product.name || "",
        description: product.description || "",
        price: Number(product.price || 0),
        quantity: Number(product.quantity || 0),
        unit: product.unit || "pcs",
        categoryID: product.categoryID ? Number(product.categoryID) : 0,
        memberID: product.memberID ? Number(product.memberID) : 0,
        isActive: product.isActive !== false,
      });
      
      // Auto-lookup category ID by name if ID is missing (common in this backend)
      if (categories.length > 0 && !product.categoryID && product.categoryName) {
        console.log(`[EditModal] Attempting to match category: "${product.categoryName}"`);
        const searchName = product.categoryName.toLowerCase().trim();
        
        // Try exact match first
        let match = categories.find(c => c.name.toLowerCase().trim() === searchName);
        
        // Fallback to partial matches if exact match fails
        if (!match) {
          match = categories.find(c => {
            const catName = c.name.toLowerCase().trim();
            return catName.includes(searchName) || searchName.includes(catName);
          });
        }
        
        if (match) {
          console.log(`[EditModal] Found matching category: ${match.name} (ID: ${match.id})`);
          setFormData(prev => ({ ...prev, categoryID: Number(match.id) }));
        } else {
          console.warn(`[EditModal] No matching category found for: "${product.categoryName}"`);
        }
      }

      setPreviewUrl(product.image || "");
      setImageFile(null); // Reset file on edit
    } else {
      setFormData({
        id: "0",
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        unit: "pcs",
        categoryID: 0,
        memberID: 1,
        isActive: true,
      });
      setPreviewUrl("");
      setImageFile(null);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  async function loadDependencies() {
    try {
      const [cats, mems] = await Promise.all([
        fetchCategories(),
        fetchMembers()
      ]);
      setCategories(cats);
      setMembers(mems);

      // Auto-select first category/member if NOT editing an existing product
      if (!product) {
          setFormData(prev => ({
              ...prev,
              categoryID: prev.categoryID || (cats.length > 0 ? Number(cats[0].id) : 0),
              memberID: prev.memberID || (mems.length > 0 ? Number(mems[0].id) : 0)
          }));
      }
    } catch (err) {
      console.error("Failed to load modal dependencies:", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Modal] Submitting Product Data:", {
      id: product?.id,
      name: formData.name,
      categoryID: formData.categoryID,
      memberID: formData.memberID,
      hasFile: !!imageFile,
      hasUrl: !!formData.image
    });
    
    // Prevent 500 error by validating category selection with descriptive feedback
    // Improved validation with automatic fallback for missing IDs
    const finalCategoryID = Number(formData.categoryID || 0);
    const finalMemberID = Number(formData.memberID || 0);

    if (finalCategoryID === 0) {
      toast.error("Please select a Product Category.");
      return;
    }

    if (finalMemberID === 0) {
      // If only one member exists (common), auto-select it instead of blocking
      if (members.length === 1) {
        formData.memberID = Number(members[0].id);
      } else {
        toast.error("Please select a Seller/Member.");
        return;
      }
    }

    // 🔥 IMAGE VALIDATION (Final Fix)
    if (product && Number(product.id) > 0) {
      if (!formData.image && !imageFile) {
        toast.error("Product image is required for update ❌");
        return;
      }
      console.log("Existing Image URL for Update:", formData.image);
    }

    const toastId = toast.loading("Saving product to Mallu Smart API...");
    setLoading(true);
    try {
      // Enrich payload with names for the JSON API
      const enrichedData = {
        ...formData,
        categoryName: categories.find(c => Number(c.id) === formData.categoryID)?.name || "",
        memberName: members.find(m => Number(m.id) === formData.memberID)?.name || ""
      };

      await addOrUpdateProduct(enrichedData, imageFile);
      toast.success(product && Number(product.id) > 0 ? "Product updated successfully" : "Product added successfully", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Save product error:", error);
      toast.error(error.message || "Failed to save product", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 border-b pb-4">
            {product && Number(product.id) > 0 ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product title"
                  required
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product..."
                  className="min-h-[100px] border-slate-200 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="quantity">Quantity</Label>
                    {Number(formData.quantity || 0) < 5 && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded uppercase font-bold">Low Stock Alert</span>
                    )}
                </div>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || 0}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || ""}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pcs, kg, box"
                required
                className="border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-4">
                {/* File Upload */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-blue-500 transition-colors bg-slate-50/50">
                      <input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          console.log("Selected file:", file);
                          if (file) {
                            setImageFile(file);
                            setFormData(prev => ({ ...prev, image: "" })); // Clear existing URL reference
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-slate-600">
                          {imageFile ? imageFile.name : "Choose or drop product image"}
                        </span>
                        <p className="text-[10px] text-slate-400">PNG, JPG or WEBP (Max 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {(previewUrl || formData.image) && (
                  <div className="h-24 w-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shadow-inner relative group">
                    <img 
                      src={previewUrl || formData.image} 
                      className="h-full w-full object-cover" 
                      alt="Preview"
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[10px] text-white font-bold uppercase">Preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Relationships */}
            <div className="space-y-2">
              <Label className="flex gap-1">Category <span className="text-red-500">*</span></Label>
              <Select 
                key={`${categories.length}-${formData.categoryID}`}
                value={formData.categoryID?.toString() || "0"} 
                onValueChange={(val) => setFormData({ ...formData, categoryID: Number(val) })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    <SelectItem value="0">Uncategorized</SelectItem>
                    {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id?.toString() || "0"}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Member / Seller</Label>
              <Select 
                value={formData.memberID?.toString() || "0"} 
                onValueChange={(val) => setFormData({ ...formData, memberID: Number(val) })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    <SelectItem value="0">Generic Member</SelectItem>
                    {members.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
