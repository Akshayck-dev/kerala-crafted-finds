import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { addToCart, toggleWishlist, useWishlist } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative rounded-lg border border-border bg-card p-2 transition-shadow hover:shadow-md">
      <Link to="/product/$productId" params={{ productId: product.id }} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <Badge className="absolute left-1.5 top-1.5 bg-brand text-brand-foreground text-[10px] px-1.5 py-0.5">
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute right-1.5 top-1.5 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>

      <div className="mt-2 space-y-1">
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="text-xs font-medium leading-tight text-card-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
        <div className="flex items-center gap-1 pt-1">
          <Button
            size="sm"
            className="h-7 flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
          >
            <Heart className={`h-3 w-3 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
