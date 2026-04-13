import { createFileRoute, Link } from "@tanstack/react-router";
import { products, categories } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Mallu Smart" },
      { name: "description", content: "Browse authentic Kerala products." },
      { property: "og:title", content: "Shop — Mallu Smart" },
      { property: "og:description", content: "Browse authentic Kerala products." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || "",
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [sort, setSort] = useState("default");

  let filtered = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  if (sort === "low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "high") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="mb-4 text-lg font-bold text-foreground">Shop</h1>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 md:block">
          <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wide">Categories</h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-left text-xs py-1.5 px-2 rounded transition-colors ${
                selectedCategory === "all" ? "bg-brand-light text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-left text-xs py-1.5 px-2 rounded transition-colors ${
                  selectedCategory === cat.id ? "bg-brand-light text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filtered.length} products</p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="low">Price: Low to High</SelectItem>
                <SelectItem value="high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile category filter */}
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs border ${selectedCategory === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs border ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
