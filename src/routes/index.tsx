import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { products, categories } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { ShieldCheck, Truck, Award, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mallu Smart — Authentic Kerala Products" },
      { name: "description", content: "Discover handmade, natural & trusted Kerala products from local artisans." },
      { property: "og:title", content: "Mallu Smart — Authentic Kerala Products" },
      { property: "og:description", content: "Discover handmade, natural & trusted Kerala products from local artisans." },
    ],
  }),
  component: HomePage,
});

const heroSlides = [
  {
    title: "Discover Authentic Kerala Products",
    subtitle: "Handmade, Natural & Trusted by Local Artisans",
    bg: "bg-brand-light",
  },
  {
    title: "Fresh Spices Direct from Kerala",
    subtitle: "Cardamom, Pepper, Cinnamon & More — Farm Fresh",
    bg: "bg-gradient-to-r from-primary/10 to-accent/30",
  },
  {
    title: "Handcrafted with Love",
    subtitle: "Support Local Artisans & Traditional Craftsmanship",
    bg: "bg-gradient-to-r from-accent/20 to-brand-light",
  },
];

function HomePage() {
  const featured = products.slice(0, 10);

  return (
    <div>
      {/* Hero Carousel */}
      <section>
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {heroSlides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className={`${slide.bg} py-10`}>
                  <div className="mx-auto max-w-[1200px] px-4 text-center">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                      {slide.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {slide.subtitle}
                    </p>
                    <Link to="/shop">
                      <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-y-0 left-2 flex items-center">
            <CarouselPrevious className="relative left-0 top-0 translate-y-0" />
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center">
            <CarouselNext className="relative right-0 top-0 translate-y-0" />
          </div>
        </Carousel>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="mb-4 text-base font-semibold text-foreground">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/shop"
                className="flex min-w-[120px] flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-card-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-6">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Featured Products</h2>
            <Link to="/shop" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Mallu Smart */}
      <section className="py-6">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="mb-4 text-center text-base font-semibold text-foreground">Why Mallu Smart?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Award, title: "Authentic Kerala Products", desc: "100% genuine local items" },
              { icon: Truck, title: "Direct from Sellers", desc: "No middlemen involved" },
              { icon: ShieldCheck, title: "Trusted Quality", desc: "Quality checked products" },
              { icon: Package, title: "Easy Ordering", desc: "Simple checkout process" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
                <item.icon className="h-6 w-6 text-primary mb-2" />
                <h3 className="text-xs font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
