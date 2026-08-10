import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { toggleWishlist, useWishlist, addToCart } from "@/lib/store";
import { cn, toTitleCase } from "@/lib/utils";
import { motion } from "framer-motion";

import { AuthImage } from "./AuthImage";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
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
              alt={toTitleCase(product.name)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
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
              {toTitleCase(product.name)}
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

          {/* Persistent Action Buttons */}
          <div className="mt-2 flex gap-1.5">
              <Button
                className="flex-1 rounded-full bg-primary text-primary-foreground h-8 min-[380px]:h-9 md:h-10 text-[9px] min-[380px]:text-[10px] md:text-xs lg:text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 min-[400px]:h-9 min-[400px]:w-9 md:h-10 md:w-10 rounded-full border-border/50 hover:bg-muted/50"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={cn("h-3 w-3 min-[400px]:h-3.5 min-[400px]:w-3.5 md:h-4 md:w-4", wishlisted && "fill-destructive text-destructive")} />
              </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
