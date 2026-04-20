import React, { useEffect, useState } from "react";
import { useLoadingStore } from "@/lib/loading-store";
import { cn } from "@/lib/utils";

export function TopLoadingBar() {
  const isLoading = useLoadingStore((state) => state.isLoading);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setVisible(true);
      setProgress(10);
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 5;
          if (prev < 60) return prev + 2;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 200);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setProgress(0), 400);
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] h-[3px] w-full bg-transparent pointer-events-none">
      <div 
        className={cn(
          "h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(37,99,235,0.5)]",
          !visible && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
