import React from "react";
import { useLoadingStore } from "@/lib/loading-store";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <div 
      className={cn(
        "fixed bottom-8 right-8 z-[9999] transition-all duration-700 ease-in-out pointer-events-none",
        isLoading ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-75"
      )}
    >
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl text-white pl-4 pr-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
          <div className="relative">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <div className="absolute inset-0 h-5 w-5 blur-sm animate-pulse bg-blue-400/20 rounded-full" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 leading-none mb-1">
              Live Sync
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Mallu’s Mart Backend
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
