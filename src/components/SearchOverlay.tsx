import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import { useProducts } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/data";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Search logic with fuzzy matching
  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      setSelectedIndex(-1);
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      const q = searchQuery.toLowerCase().trim();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.artisan?.toLowerCase().includes(q) ||
          p.sellerName?.toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 8));
    },
    [products]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      onClose();
    }
  };

  const trendingSearches = ["Coconut Oil", "Banana Chips", "Spices", "Handloom"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Search Panel */}
          <motion.div
            className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-[10vh] sm:pt-[15vh]"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, categories, artisans..."
                className="h-16 w-full rounded-2xl border border-border/50 bg-background pl-14 pr-14 text-lg font-medium text-foreground shadow-2xl outline-none ring-2 ring-primary/20 transition-all placeholder:text-muted-foreground/60 focus:ring-primary/40"
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-muted/80 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results or Trending */}
            <motion.div
              className="mt-3 max-h-[55vh] overflow-y-auto rounded-2xl border border-border/50 bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
              layout
            >
              {query.trim() === "" ? (
                /* Trending Searches */
                <div className="p-4">
                  <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="rounded-full border border-border/50 bg-muted/30 px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                /* No Results */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-lg font-semibold text-foreground">No results found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try searching for a different term
                  </p>
                </div>
              ) : (
                /* Search Results */
                <div className="space-y-1">
                  {results.map((product, index) => (
                    <Link
                      key={product.id}
                      to="/product/$productId"
                      params={{ productId: product.id }}
                      onClick={onClose}
                    >
                      <motion.div
                        className={`group flex items-center gap-4 rounded-xl p-3 transition-all ${
                          index === selectedIndex
                            ? "bg-primary/10 ring-1 ring-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {/* Product Image */}
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.categoryName || product.category}
                            {product.artisan && ` · by ${product.artisan}`}
                            {product.sellerName && ` · by ${product.sellerName}`}
                          </p>
                        </div>
                        {/* Price */}
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-primary">₹{product.price}</p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{product.originalPrice}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </motion.div>
                    </Link>
                  ))}
                  {/* View All Link */}
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-muted/30 p-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                  >
                    View all results in Shop
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Keyboard hint */}
            <p className="mt-3 text-center text-[10px] font-medium tracking-widest text-white/40 uppercase hidden sm:block">
              ESC to close · ↑↓ to navigate · Enter to select
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
