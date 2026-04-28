import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { addToCart, toggleWishlist, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { AuthImage } from "./AuthImage";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className="group relative flex flex-col gap-2 rounded-[1.2rem] sm:rounded-[2.5rem] border border-border/50 bg-background/40 p-1.5 sm:p-3 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-md"
    >
      {/* Image Section */}
      <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-[1rem] sm:rounded-[2rem] bg-muted">
        <Link to="/product/$productId" params={{ productId: product.id }} className="h-full w-full">
          <AuthImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        


        {/* Hover Action Bar (Desktop) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hidden md:block">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-xl">
            <Button
              className="flex-1 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform h-10"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-white/20 text-white hover:bg-white/40 ring-1 ring-white/30"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
            >
              <Heart className={cn("h-4 w-4", wishlisted && "fill-destructive text-destructive")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-0.5 px-1 pb-1">
        <div className="flex items-center justify-between">
            <span className="text-[7px] min-[400px]:text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground uppercase truncate">
                {product.category.replace("-", " ")}
            </span>
        </div>
        
        <Link to="/product/$productId" params={{ productId: product.id }} className="group/title">
          <h3 className="text-[11px] min-[400px]:text-xs sm:text-base font-bold leading-tight text-foreground transition-colors group-hover/title:text-primary line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[8px] min-[400px]:text-[9px] sm:text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-0.5 flex flex-wrap gap-x-1">
            <span>By {product.sellerName || "Local Seller"}</span>
            {product.businessName && <span className="opacity-70">({product.businessName})</span>}
          </p>
        </Link>

        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm min-[400px]:text-base sm:text-xl font-black text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-[8px] min-[400px]:text-[10px] sm:text-xs text-muted-foreground line-through opacity-60">
                ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Mobile Persistent Action (Mobile Only) */}
        <div className="mt-2 flex gap-1.5 md:hidden">
            <Button
              className="flex-1 rounded-full bg-primary text-primary-foreground h-8 min-[380px]:h-9 text-[9px] min-[380px]:text-[10px] font-bold"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 min-[400px]:h-9 min-[400px]:w-9 rounded-full border-border/50"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={cn("h-3 w-3 min-[400px]:h-3.5 min-[400px]:w-3.5", wishlisted && "fill-destructive text-destructive")} />
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
