import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/store";
import { ShoppingCart, MessageCircle, Minus, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { notFound } from "@tanstack/react-router";

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

  if (!product) {
    throw notFound();
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const whatsappMsg = encodeURIComponent(`Hi, I'd like to order: ${product.name} (₹${product.price}) x ${qty}`);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Link to="/shop" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to Shop
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
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

          <div className="flex gap-3 pt-2">
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
    </div>
  );
}
