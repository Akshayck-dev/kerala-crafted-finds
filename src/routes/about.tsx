import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Mallu’s Mart" },
      { name: "description", content: "Discover the heritage and passion behind Mallu’s Mart." },
      { property: "og:title", content: "Our Story — Mallu’s Mart" },
      { property: "og:description", content: "Learn about our mission to support Kerala homepreneurs." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-24">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] w-full overflow-hidden rounded-b-[3rem] sm:h-[75vh] sm:rounded-b-[5rem]">
        <img
          src="/kerala_homepreneur_crafts_1777281858277.png"
          alt="Kerala Homepreneur Workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
           <motion.span 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-4 text-[10px] font-bold tracking-[0.5em] text-white uppercase"
           >
             The Mallu’s Mart Story ——
           </motion.span>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="fluid-heading-1 max-w-4xl font-black italic uppercase text-white leading-[0.85]"
           >
             Home to <br /> Horizon.
           </motion.h1>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section-padding overflow-hidden">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B68D40] uppercase">Who We Are</span>
              <h2 className="fluid-heading-2 font-black italic tracking-tighter text-foreground uppercase">
                Empowering <br /> Kerala's Homepreneurs.
              </h2>
            </div>
            
            <div className="space-y-6 text-xl font-medium leading-relaxed text-muted-foreground/90">
              <p>
                Mallu’s Mart is the first website from Kerala dedicated exclusively to products created by **homepreneurs**. 
              </p>
              <p>
                Our platform brings together the finest Kerala traditional foods, homemade specialties, handmade crafts, and unique clothing, all lovingly made by talented entrepreneurs from their homes.
              </p>
              <p>
                At Mallu’s Mart, every product carries a story, a passion, and the spirit of Kerala.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
               <div className="flex items-center gap-4 rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-black/5 transition-transform hover:scale-[1.02]">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black italic text-foreground">Kerala First</span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase leading-none">Home-Made Excellence</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-black/5 transition-transform hover:scale-[1.02]">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black italic text-foreground">Global Reach</span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase leading-none">International Shipping</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[4rem] border-8 border-card shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&fit=crop" 
                alt="Traditional Kerala Handloom" 
                className="h-full w-full object-cover transition-transform duration-[10s] hover:scale-110" 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Mission Section: Home to Horizon */}
      <section className="bg-muted/30 py-24 sm:rounded-[5rem]">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&fit=crop" className="rounded-3xl shadow-lg" alt="Craft" />
                  <img src="https://images.unsplash.com/photo-1599490659213-e2b9527e3cfd?w=400&fit=crop" className="rounded-3xl shadow-lg" alt="Food" />
                </div>
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&fit=crop" className="rounded-3xl shadow-lg" alt="Banana Chips" />
                  <img src="https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&fit=crop" className="rounded-3xl shadow-lg" alt="Spices" />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Our Mission</span>
                <h2 className="fluid-heading-2 font-black italic tracking-tighter text-foreground uppercase">
                  Home to Horizon.
                </h2>
              </div>
              <p className="text-xl font-medium leading-relaxed text-muted-foreground">
                Our mission is to take these authentic creations from Kerala homes to customers around the world, giving homepreneurs a true **“Home to Horizon”** opportunity.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Heart className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-base text-foreground/80">Empowering talented entrepreneurs to build businesses from their homes.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-base text-foreground/80">Connecting global customers with authentic, soul-filled Kerala products.</p>
                </div>
              </div>
              <Link to="/sell">
                <Button size="lg" className="h-14 rounded-full bg-primary px-10 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Join the Mission <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
