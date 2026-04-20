import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import type { Product, Category } from "@/lib/data";
import { setProducts as globalSetProducts } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mallu Smart" },
      { name: "description", content: "Browse authentic Kerala products." },
      { property: "og:title", content: "Shop — Mallu Smart" },
      { property: "og:description", content: "Browse authentic Kerala products." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("default");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, cData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setProducts(pData);
        globalSetProducts(pData);
        setCategories(cData);
      } catch (err) {
        setError("Unable to connect to the heritage registry. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sort]);

  const filtered = useMemo(() => {
    let result = selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

    if (sort === "low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "high") result = [...result].sort((a, b) => b.price - a.price);
    
    return result;
  }, [products, selectedCategory, sort]);

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Connectivity Issue</h2>
        <p className="text-muted-foreground">{error}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-primary px-6 py-2 text-xs font-bold text-white uppercase tracking-widest"
        >
            Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="section-padding !pb-24">
      <PageHeader 
        title="Browse All Products" 
        subtitle="Our Collection" 
      />

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="hidden w-48 shrink-0 space-y-6 md:block">
          <div>
            <h3 className="mb-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Categories</h3>
            <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "text-left text-xs font-bold uppercase tracking-wide py-2.5 px-3 rounded-xl transition-all",
                    selectedCategory === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                        "text-left text-xs font-bold uppercase tracking-wide py-2.5 px-3 rounded-xl transition-all",
                        selectedCategory === cat.slug ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            {isLoading ? <Skeleton className="h-4 w-24" /> : <p className="text-[10px] font-bold tracking-widest text-[#B68D40] uppercase">{filtered.length} Products Found</p>}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-10 w-44 rounded-full border-border/50 bg-card text-[10px] font-bold uppercase tracking-widest">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card">
                <SelectItem value="default" className="text-xs uppercase tracking-wide">Standard Entry</SelectItem>
                <SelectItem value="low" className="text-xs uppercase tracking-wide">Value: Ascending</SelectItem>
                <SelectItem value="high" className="text-xs uppercase tracking-wide">Value: Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Category Scroll */}
          <div className="mb-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide md:hidden">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
                ))
            ) : (
                <>
                    <button
                      onClick={() => setSelectedCategory("all")}
                        className={cn(
                          "shrink-0 rounded-full px-6 py-3 text-[10px] font-black italic tracking-widest uppercase transition-all duration-300 border shadow-md",
                          selectedCategory === "all" 
                            ? "bg-primary text-white border-primary shadow-primary/30" 
                            : "bg-card border-border/50 text-muted-foreground hover:border-primary/30"
                        )}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={cn(
                            "shrink-0 rounded-full px-6 py-3 text-[10px] font-black italic tracking-widest uppercase transition-all duration-300 border shadow-md",
                            selectedCategory === cat.slug 
                              ? "bg-primary text-white border-primary shadow-primary/30" 
                              : "bg-card border-border/50 text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                </>
            )}
          </div>

          <div className="grid mobile-grid-dense gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4 lg:gap-10 [&>*]:min-w-0">
            {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-[2.5rem] border border-border/50 p-3">
                        <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
                        <div className="space-y-2 px-2 pb-2">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    </div>
                ))
            ) : (
                paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border/50 disabled:hover:text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "h-10 min-w-10 rounded-full px-4 text-xs font-bold transition-all shadow-sm",
                          currentPage === page 
                            ? "bg-primary text-white shadow-primary/20 scale-110" 
                            : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-1 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border/50 disabled:hover:text-muted-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="py-24 text-center text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase italic pb-48">Registry contains no records for this classification.</p>
          )}
        </div>
      </div>
    </div>
  );
}

