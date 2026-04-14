import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Kerala Crafted Finds" },
      { name: "description", content: "Discover the heritage and passion behind Kerala Crafted Finds." },
      { property: "og:title", content: "Our Story — Kerala Crafted Finds" },
      { property: "og:description", content: "Learn about our mission to support local Kerala artisans." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-24">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] w-full overflow-hidden rounded-b-[3rem] sm:h-[70vh] sm:rounded-b-[5rem]">
        <img
          src="/images/institutional-heritage.png"
          alt="Mallu Smart Registry"
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
           <span className="mb-4 text-[10px] font-bold tracking-[0.5em] text-primary uppercase animate-in fade-in slide-in-from-bottom-2">
             Official Institutional Mandate ——
           </span>
           <h1 className="fluid-heading-1 max-w-4xl font-black italic uppercase text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
             The Registry
           </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding overflow-hidden">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B68D40] uppercase">Our Story</span>
              <h2 className="fluid-heading-2 font-black italic tracking-tighter text-foreground uppercase">
                About Mallu Smart.
              </h2>
            </div>
            
            <div className="space-y-6 text-lg font-medium leading-relaxed text-muted-foreground/80">
              <p>
                Mallu Smart is a platform where local people sell their products directly to customers. We support small businesses, home makers, and artisans by helping them reach more customers. Every product here is real, local, and made with care.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
               <div className="flex items-center gap-4 rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-black/5 transition-transform hover:scale-[1.02]">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black italic text-foreground">50+</span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase leading-none">Local Partners</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 rounded-3xl bg-card border border-border/50 p-6 shadow-xl shadow-black/5 transition-transform hover:scale-[1.02]">
                  <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black italic text-foreground">100%</span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase leading-none">Authenticity</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[4rem] border-8 border-card shadow-2xl">
              <img 
                src="/images/registry-proof.png" 
                alt="Registry Certification" 
                className="h-full w-full object-cover transition-transform duration-[10s] hover:scale-110" 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          </div>
        </div>
      </section>

    </div>
  );
}
