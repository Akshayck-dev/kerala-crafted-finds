import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/store";
import { ShoppingCart, MessageCircle, Minus, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { notFound } from "@tanstack/react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    const product = products.find((p) => p.id === params.productId);
    return {
      meta: [
        { title: product ? `${product.name} — Mallu Smart` : "Product — Mallu Smart" },
        { name: "description", content: product?.description || "" },
        { property: "og:title", content: product ? `${product.name} — Mallu Smart` : "Product" },
        { property: "og:description", content: product?.description || "" },
      ],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
      <p className="text-muted-foreground">Product not found.</p>
      <Link to="/shop" className="mt-2 inline-block text-primary text-sm hover:underline">Back to Shop</Link>
    </div>
  ),
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const product = products.find((p) => p.id === productId);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    throw notFound();
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const whatsappMsg = encodeURIComponent(`Hi, I'd like to order: ${product.name} (₹${product.price}) x ${qty}`);

  // Build gallery: main image + extra images if available
  const galleryImages = [product.image, ...(product.images || [])];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 pb-24 md:pb-6">
      <Link to="/shop" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to Shop
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Gallery */}
        <div>
          {/* Swipeable carousel for mobile, clickable thumbnails for desktop */}
          <Carousel opts={{ loop: true, startIndex: selectedImage }} className="w-full">
            <CarouselContent>
              {galleryImages.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={img} alt={`${product.name} - ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {galleryImages.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-1 flex items-center">
                  <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-8 w-8" />
                </div>
                <div className="absolute inset-y-0 right-1 flex items-center">
                  <CarouselNext className="relative right-0 top-0 translate-y-0 h-8 w-8" />
                </div>
              </>
            )}
          </Carousel>

          {/* Thumbnail strip */}
          {galleryImages.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Dot indicators for mobile */}
          {galleryImages.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5 md:hidden">
              {galleryImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    selectedImage === i ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">-{discount}%</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">Quantity:</span>
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-3 py-1 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden flex-col gap-2 pt-2 sm:flex sm:flex-row sm:gap-3">
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => addToCart(product, qty)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground"
              asChild
            >
              <a href={`https://wa.me/919999999999?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-1" /> Order via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-3 sm:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2">
          <div className="min-w-0 flex-shrink-0">
            <p className="text-xs text-muted-foreground truncate">{product.name}</p>
            <p className="text-base font-bold text-foreground">₹{product.price * qty}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 px-3"
              onClick={() => addToCart(product, qty)}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-success text-success hover:bg-success hover:text-success-foreground text-xs h-9 px-3"
              asChild
            >
              <a href={`https://wa.me/919999999999?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}