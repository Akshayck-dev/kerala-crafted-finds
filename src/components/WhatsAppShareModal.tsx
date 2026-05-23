import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle2, MessageCircle, User, Phone, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/data";
import { addToCart } from "@/lib/store";
import { toTitleCase } from "@/lib/utils";

interface WhatsAppShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "919495532563";

export function WhatsAppShareModal({ product, isOpen, onClose }: WhatsAppShareModalProps) {
  const [step, setStep] = useState<"details" | "sending" | "success">("details");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate() {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim() || !/^\+?[0-9\s\-]{8,15}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid phone number";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSend() {
    if (!product || !validate()) return;

    setStep("sending");
    await new Promise((r) => setTimeout(r, 900));

    // Build rich WhatsApp message
    const productUrl = `${window.location.origin}/product/${product.id}`;
    let msg = `🛍️ *New Order Enquiry — Mallu's Mart*\n\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `*📦 Product Details*\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `🏷️ *Name:* ${toTitleCase(product.name)}\n`;
    msg += `💰 *Price:* ₹${product.price}${product.originalPrice ? ` ~~₹${product.originalPrice}~~` : ""}\n`;
    msg += `📂 *Category:* ${product.category.replace("-", " ").toUpperCase()}\n`;
    if (product.sellerName) msg += `👤 *Seller:* ${product.sellerName}${product.businessName ? ` (${product.businessName})` : ""}\n`;
    if (product.description) msg += `📝 *About:* ${product.description.slice(0, 120)}...\n`;
    msg += `🔗 *View Product:* ${productUrl}\n`;
    if (product.image) msg += `🖼️ *Image:* ${product.image}\n`;
    msg += `\n━━━━━━━━━━━━━━━━\n`;
    msg += `*👤 Customer Details*\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `🙋 *Name:* ${form.name.trim()}\n`;
    msg += `📱 *Phone:* ${form.phone.trim()}\n`;
    msg += `📍 *Address:* ${form.address.trim()}\n`;
    msg += `\n_I'd like to order this item. Please confirm availability and proceed!_ 🙏`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");

    // Also add to cart
    addToCart(product);
    setStep("success");

    setTimeout(() => {
      handleClose();
    }, 3500);
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep("details");
      setForm({ name: "", phone: "", address: "" });
      setErrors({});
    }, 300);
  }

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-[480px] -translate-y-1/2 overflow-hidden rounded-[2.5rem] border border-white/10 bg-background shadow-2xl shadow-black/30"
          >
            {/* Green accent top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#25D366]" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Details Form ── */}
              {step === "details" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 pt-5"
                >
                  {/* Product Preview Card */}
                  <div className="mb-6 flex gap-4 rounded-2xl border border-border/40 bg-muted/30 p-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
                      <img
                        src={product.image}
                        alt={toTitleCase(product.name)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
                      <span className="text-[9px] font-bold tracking-widest text-[#B68D40] uppercase">
                        {product.category.replace("-", " ")}
                      </span>
                      <h3 className="truncate text-sm font-black text-foreground">
                        {toTitleCase(product.name)}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-foreground">₹{product.price}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                            <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold text-green-600">
                              -{discount}%
                            </span>
                          </>
                        )}
                      </div>
                      {product.sellerName && (
                        <p className="truncate text-[9px] text-muted-foreground">
                          By {product.sellerName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#25D366]/15">
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tight text-foreground">
                        Send via WhatsApp
                      </h2>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                        Share your details to place enquiry
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-3.5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <User className="h-3 w-3" /> Full Name
                      </Label>
                      <Input
                        placeholder="e.g. Arjun Nair"
                        value={form.name}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, name: e.target.value }));
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={`h-11 rounded-xl border-border/50 bg-muted/20 px-4 text-sm transition-all focus:border-[#25D366]/50 focus:ring-0 ${errors.name ? "border-destructive/60" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-[10px] text-destructive">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Phone className="h-3 w-3" /> WhatsApp Number
                      </Label>
                      <Input
                        placeholder="+91 98765 43210"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, phone: e.target.value }));
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        className={`h-11 rounded-xl border-border/50 bg-muted/20 px-4 text-sm transition-all focus:border-[#25D366]/50 focus:ring-0 ${errors.phone ? "border-destructive/60" : ""}`}
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <MapPin className="h-3 w-3" /> Delivery Address
                      </Label>
                      <Input
                        placeholder="Street, City, Pincode..."
                        value={form.address}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, address: e.target.value }));
                          if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        className={`h-11 rounded-xl border-border/50 bg-muted/20 px-4 text-sm transition-all focus:border-[#25D366]/50 focus:ring-0 ${errors.address ? "border-destructive/60" : ""}`}
                      />
                      {errors.address && (
                        <p className="text-[10px] text-destructive">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handleSend}
                      className="h-13 w-full rounded-2xl bg-[#25D366] text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-[#25D366]/25 transition-all hover:scale-[1.02] hover:bg-[#20ba5a] active:scale-[0.98]"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to WhatsApp &amp; Add to Cart
                    </Button>
                    <button
                      onClick={() => { addToCart(product); handleClose(); }}
                      className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ShoppingBag className="mr-1 inline h-3 w-3" />
                      Just add to cart (no WhatsApp)
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Sending ── */}
              {step === "sending" && (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-5 px-10 py-20 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/20" />
                    <div className="relative rounded-full bg-[#25D366]/10 p-5">
                      <Loader2 className="h-10 w-10 animate-spin text-[#25D366]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-black uppercase tracking-tight text-foreground">
                      Opening WhatsApp...
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Preparing your product details
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="flex flex-col items-center justify-center gap-5 px-10 py-20 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/20" />
                    <div className="relative rounded-full bg-[#25D366]/10 p-5">
                      <CheckCircle2 className="h-12 w-12 text-[#25D366]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                      WhatsApp Opened! 🎉
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                      Product details and your info have been shared. Item also added to your cart!
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
