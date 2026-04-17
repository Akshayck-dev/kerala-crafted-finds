import React, { useState, useEffect } from "react";
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
import { Loader2, Upload, Link as LinkIcon } from "lucide-react";

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
  
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "0",
    name: "",
    description: "",
    image: "",
    price: 0,
    quantity: 0,
    unit: "pcs",
    categoryID: 0,
    memberID: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        name: product.name ?? "",
        description: product.description ?? "",
        image: product.image ?? "",
        price: Number(product.price || 0),
        quantity: Number(product.quantity || 0),
        unit: product.unit ?? "pcs",
        categoryID: Number(product.categoryID || 0),
        memberID: Number(product.memberID || 0),
      });
    } else {
      setFormData({
        id: "0",
        name: "",
        description: "",
        image: "",
        price: 0,
        quantity: 0,
        unit: "pcs",
        categoryID: 0,
        memberID: 0,
        isActive: true,
      });
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
    } catch (err) {
      console.error("Failed to load modal dependencies:", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      await addOrUpdateProduct(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save product error:", error);
      alert("Failed to save product. Check console for details.");
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-file" className="text-[10px] text-slate-500 uppercase">Option 1: Upload File</Label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-blue-500 transition-colors bg-slate-50/50">
                      <input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs font-medium text-slate-600">
                          {imageFile ? imageFile.name : "Choose or drop image"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-[10px] text-slate-500 uppercase">Option 2: Image URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="image"
                        value={formData.image || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          if (!imageFile) setPreviewUrl(e.target.value);
                        }}
                        placeholder="https://..."
                        className="pl-9 border-slate-200 focus:ring-blue-500"
                      />
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
              <Label>Category</Label>
              <Select 
                value={formData.categoryID?.toString() || "0"} 
                onValueChange={(val) => setFormData({ ...formData, categoryID: Number(val) })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    <SelectItem value="0">Uncategorized</SelectItem>
                    {categories.map((c, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString()}>{c.name}</SelectItem>
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
