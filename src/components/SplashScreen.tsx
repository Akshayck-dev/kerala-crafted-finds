import React, { useEffect, useState } from "react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete?: () => void;
  isLoading?: boolean;
}

export function SplashScreen({ onComplete, isLoading }: SplashScreenProps) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay after loading finishes to ensure smooth exit
      const timer = setTimeout(() => {
        setExit(true);
        setTimeout(() => {
          onComplete?.();
        }, 800); // Duration of fade-out animation
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] transition-all duration-1000 ease-in-out",
        exit ? "pointer-events-none opacity-0 scale-105" : "opacity-100"
      )}
    >
      {/* Background Texture/Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Logo Container */}
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative">
          {/* Animated Glow Ring */}
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
          
          <div className="relative h-32 w-32 overflow-hidden rounded-full border border-primary/20 shadow-2xl animate-in zoom-in-50 duration-1000">
            <img 
              src={logo} 
              alt="Mallu Smart" 
              className="h-full w-full object-cover animate-in fade-in duration-1000" 
            />
          </div>

          {/* Minimalist Progress Indicator */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>

        {/* Text Reveal */}
        <div className="flex flex-col items-center gap-2 overflow-hidden">
          <h1 className="text-2xl font-black italic tracking-[0.3em] text-foreground uppercase animate-in slide-in-from-bottom-full duration-1000 fill-mode-both">
            MALLU SMART
          </h1>
          <div className="h-[2px] w-12 bg-primary/40 animate-in slide-in-from-left-full duration-1000 delay-300 fill-mode-both" />
          <p className="text-[10px] font-bold tracking-[0.5em] text-muted-foreground uppercase opacity-60 animate-in fade-in duration-1000 delay-700 fill-mode-both">
            Authentic Registry
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
        <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Kerala Crafted Finds
        </span>
        <div className="h-4 w-[1px] bg-border" />
      </div>
    </div>
  );
}
