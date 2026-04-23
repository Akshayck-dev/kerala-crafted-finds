import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { addToCart, useProducts } from "@/lib/store";
import { ShoppingCart, MessageCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { QuantitySelector } from "@/components/QuantitySelector";
import { fetchProducts } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { products, setProducts } = useProducts();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(products.length === 0);

  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    async function syncRegistry() {
        if (products.length === 0) {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                console.error("Registry sync failed", err);
            } finally {
                setIsSyncing(false);
            }
        } else {
            setIsSyncing(false);
        }
    }
    syncRegistry();
  }, [productId, products.length, setProducts]);

  if (isSyncing) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="mb-6 h-4 w-32 animate-pulse bg-muted rounded-full" />
        <div className="grid gap-12 lg:grid-cols-2">
           <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
           <div className="space-y-6 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full rounded-full" />
           </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-24 text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground mb-4">
                Record Not Found
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                The requested item could not be found. It may have been removed or the link is broken.
            </p>
            <Link to="/shop">
                <Button className="rounded-full px-8">Return to Shop</Button>
            </Link>
        </div>
    );
  }

  const whatsappMsg = encodeURIComponent(`Hi, I'd like to order: ${product.name} (₹${product.price}) x ${qty}`);
  const galleryImages = [product.image, ...(product.images || [])];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-12 pb-32">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground transition-colors hover:text-foreground uppercase">
        <ArrowLeft className="h-4 w-4" /> Back to Collection
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Left Column: Image Stack/Carousel */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-muted shadow-2xl">
            {product.badge && (
              <Badge className="absolute left-6 top-6 z-10 bg-black/80 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white backdrop-blur-md">
                {product.badge}
              </Badge>
            )}
            <img 
              src={galleryImages[selectedImage]} 
              alt={product.name} 
              className="aspect-square w-full object-cover transition-all duration-700 hover:scale-110" 
            />
          </div>
          
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Info */}
        <div className="flex flex-col space-y-8 lg:pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B68D40] uppercase">
                Product Detail
              </span>
              <div className="h-[1px] flex-1 bg-[#B68D40]/30" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {product.categoryName || product.category?.replace("-", " ")}
              </span>
              <h1 className="fluid-heading-2 font-black italic uppercase text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-[#B68D40]">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through decoration-destructive/30">
                  ₹{Math.round(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg font-medium leading-relaxed text-foreground/80">
                {product.description}
              </p>
              {product.ingredients && (
                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase leading-relaxed">
                  {product.ingredients}
                </p>
              )}
            </div>

            {/* Artisan Card */}
            <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/10">
                  <AvatarImage src={product.sellerAvatar} />
                  <AvatarFallback className="bg-primary/5 text-primary">MS</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Seller
                  </span>
                  <p className="text-lg font-bold text-foreground">
                    {product.sellerName || product.artisan || "Independent Artisan"}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-primary/5 p-2 text-primary/60">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Action Row */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pt-4">
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
                Select Quantity
              </span>
              <QuantitySelector 
                quantity={qty} 
                onUpdate={setQty} 
                size="lg" 
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Button 
                size="lg" 
                className="h-16 flex-1 rounded-2xl bg-primary px-8 text-lg font-black italic tracking-tight text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:flex-none uppercase"
                onClick={() => addToCart(product, qty)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-16 w-16 shrink-0 rounded-full border-2 border-[#25D366]/30 text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
                 asChild
              >
                <a href={`https://wa.me/919999999999?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-6 w-6" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 p-4 backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-full sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button 
             variant="outline" 
             size="icon" 
             className="h-12 w-12 shrink-0 rounded-full border-2 border-[#25D366]/30 text-[#25D366]"
             asChild
          >
            <a href={`https://wa.me/919999999999?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-6 w-6" />
            </a>
          </Button>
          <Button 
            className="h-12 flex-1 rounded-full bg-primary text-xs font-black italic tracking-widest text-white shadow-lg uppercase"
            onClick={() => addToCart(product, qty)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart — ₹{product.price * qty}
          </Button>
        </div>
        <div className="h-2 w-full mobile-safe-bottom" />
      </div>
    </div>
  );
}