import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { ShieldCheck, Truck, Award, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { setProducts as globalSetProducts } from "@/lib/store";
import { type Product, type Category } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mallu’s Mart — Home to Horizon" },
      { name: "description", content: "Kerala's first platform dedicated exclusively to products created by homepreneurs. Authentic Kerala traditional foods, handmade crafts, and more." },
      { property: "og:title", content: "Mallu’s Mart — Home to Horizon" },
      { property: "og:description", content: "Empowering Kerala homepreneurs to take their authentic creations to the world." },
    ],
  }),
  component: HomePage,
});

const heroSlides = [
  {
    title: "Empowering Kerala Homepreneurs",
    subtitle: "Taking authentic Kerala creations from home to horizon. Shop unique products made with passion.",
    image: "/images/registry_archive.png",
    label: "Home to Horizon",
  },
  {
    title: "Authentic Kerala Traditions",
    subtitle: "From traditional foods to handmade crafts, discover the soul of Kerala in every product.",
    image: "/images/artisan_legacy.png",
    label: "Handmade with Love",
  },
  {
    title: "Global Reach for Local Stars",
    subtitle: "Join the mission to take Kerala's home-grown excellence to customers around the world.",
    image: "/images/backwater_majesty.png",
    label: "Global Vision",
  },
];

const guaranteeItems = [
  { icon: Award, title: "100% Local Products", desc: "Sourced directly from God's Own Country." },
  { icon: Truck, title: "Direct from Sellers", desc: "We eliminate middle-men, ensuring fair pay for every creator." },
  { icon: Package, title: "No Middlemen", desc: "Direct connection between artisans and customers." },
  { icon: ShieldCheck, title: "Trusted Quality", desc: "Rigorous quality checks for every handmade artifact." },
];

function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const [pData, cData] = await Promise.all([
              fetchProducts(),
              fetchCategories()
            ]);
            setFeatured(pData.slice(0, 10));
            globalSetProducts(pData);
            setCategories(cData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Modern Cinematic Hero Carousel */}
      <section className="relative w-full overflow-hidden rounded-b-[4rem] shadow-2xl sm:rounded-b-[8rem]">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 6000 })]}
          className="w-full"
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[55vh] w-full sm:h-[85vh]">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[20s] hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                     <div className="mb-6 flex animate-in fade-in slide-in-from-bottom-4 duration-700 items-center gap-3">
                       <span className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">
                          Kerala Crafted Finds —— {slide.label}
                       </span>
                    </div>

                    <h2 className="max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 text-4xl font-black italic tracking-tighter uppercase min-[400px]:text-5xl sm:text-7xl lg:text-8xl leading-[0.9]">
                      {slide.title.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <br className="min-[500px]:hidden" />} {word}
                        </React.Fragment>
                      ))}
                    </h2>
                    
                    <p className="mt-6 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 text-lg font-medium text-white/90 sm:text-2xl">
                      {slide.subtitle}
                    </p>

                    <div className="mt-8 flex animate-in fade-in slide-in-from-bottom-10 duration-1000 flex-col gap-3 min-[400px]:flex-row sm:gap-6">
                      <Link to="/shop">
                        <Button size="lg" className="h-12 sm:h-14 rounded-full bg-white px-8 sm:px-10 text-base sm:text-lg font-bold text-black ring-offset-black transition-all hover:scale-105 hover:bg-white/90 active:scale-95">
                          Explore Products
                        </Button>
                      </Link>
                      <Link to="/sell">
                        <Button size="lg" className="h-12 sm:h-14 rounded-full bg-white px-8 sm:px-10 text-base sm:text-lg font-bold text-black ring-offset-black transition-all hover:scale-105 hover:bg-white/90 active:scale-95">
                          Start Selling
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Scroll Indicator - Hidden on mobile for cleaner view at 55vh */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 pointer-events-none hidden sm:block">
           <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
              <div className="h-2 w-full rounded-full bg-white/50" />
           </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="pt-16 pb-4">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-10 flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Handmade, natural and trusted products from Kerala ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>

          <h2 className="mb-8 text-4xl font-black italic uppercase tracking-tighter text-foreground">
            Explore Local Creations
          </h2>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-10 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-5 sm:overflow-visible"
          >
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-2 w-16" />
                    </div>
                ))
            ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to="/shop"
                    className="group flex flex-col items-center gap-4 transition-all"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-md shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-primary/10 group-hover:shadow-xl group-hover:shadow-primary/5 group-hover:border-primary/20">
                      <span className="text-4xl transition-transform duration-500 group-hover:scale-110">{cat.icon || "📦"}</span>
                    </div>
                    <span className="max-w-[120px] text-[9px] font-black italic tracking-[0.15em] text-foreground/80 uppercase text-center leading-tight transition-colors group-hover:text-primary">
                      {cat.name}
                    </span>
                  </Link>
                ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Handpicked Collections */}
      <section className="bg-brand-light/20 pt-4 pb-12">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Handpicked Collections</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative h-[250px] overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
              <img
                src="/images/handmade-collection.png"
                alt="Handmade Products"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">Artisanal Crafts</h3>
                <p className="mt-1 text-sm text-white/80">Support local families & preserve heritage</p>
                <Link to="/shop">
                  <Button variant="link" className="mt-2 p-0 text-white hover:text-white/80">
                    Shop Now →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="group relative h-[250px] overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&fit=crop"
                alt="Organic & Natural"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">Organic & Natural</h3>
                <p className="mt-1 text-sm text-white/80">Pure spices and oils for a healthy lifestyle</p>
                <Link to="/shop">
                  <Button variant="link" className="mt-2 p-0 text-white hover:text-white/80">
                    Explore More →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-brand-light/5 py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Featured Products</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Trending items from local sellers</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-[2.5rem] border border-border/50 p-3 bg-card shadow-sm">
                        <Skeleton className="aspect-square w-full rounded-[2rem]" />
                        <div className="space-y-3 px-3 pb-3">
                            <Skeleton className="h-3 w-1/2 rounded-full" />
                            <Skeleton className="h-5 w-full rounded-lg" />
                            <Skeleton className="h-6 w-1/3 rounded-md mt-2" />
                        </div>
                    </div>
                ))
            ) : (
                featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))
            )}
          </div>
        </div>
      </section>

      {/* Artisan Spotlight */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="/images/artisan-at-work.png"
                alt="Artisan at work"
                className="h-full w-full object-cover"
              />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-light/30 blur-3xl" />
            </div>
            <div className="space-y-6">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                Our Spirit
              </span>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Kerala's First Platform for Homepreneurs</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Mallu’s Mart is dedicated exclusively to products created by talented entrepreneurs from their homes. Every product carries a story, a passion, and the authentic spirit of Kerala.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div>
                  <h4 className="text-2xl font-bold text-primary">Home-Made</h4>
                  <p className="text-sm text-muted-foreground">Exclusively Homepreneurs</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-primary">Global</h4>
                  <p className="text-sm text-muted-foreground">Home to Horizon</p>
                </div>
              </div>
              <Link to="/about">
                <Button className="mt-6 rounded-full px-8 py-4 text-lg">Our Full Story</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seller Section (CTA) */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">Start Selling Today</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium opacity-90">
                Turn your skills into income. Join Mallu’s Mart and start selling your products.
            </p>
            <Link to="/sell">
              <Button size="lg" className="mt-8 rounded-full bg-white px-10 py-6 text-lg font-bold text-black hover:bg-white/90">
                  Become a Seller
              </Button>
            </Link>
        </div>
      </section>

      {/* Why Mallu’s Mart (The Heritage Guarantee) */}
      <section className="py-12 bg-card/30">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-10 text-center">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
              Our Principles
            </span>
            <h2 className="mt-4 text-4xl font-black italic tracking-tighter text-foreground uppercase sm:text-5xl">
              Why Choose Us
            </h2>
          </div>

          <Carousel
            plugins={[Autoplay({ delay: 3000 })]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {guaranteeItems.map((item) => (
                <CarouselItem key={item.title} className="basis-full sm:basis-1/2 lg:basis-1/4">
                  <div className="p-1 h-full">
                    <div className="group relative flex flex-col items-center rounded-[2.5rem] border border-border/50 bg-background p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:bg-card hover:shadow-2xl h-full">
                      <div className="mb-6 rounded-2xl bg-primary/5 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/5" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
    </div>
  );
}
