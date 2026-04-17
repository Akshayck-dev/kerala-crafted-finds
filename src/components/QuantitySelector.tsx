import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onUpdate: (newQty: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function QuantitySelector({ 
  quantity, 
  onUpdate, 
  className,
  size = "md" 
}: QuantitySelectorProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const btnClass = cn(
    "flex items-center justify-center rounded-full transition-all hover:bg-muted active:scale-90",
    isSm ? "h-7 w-7" : isLg ? "h-12 w-12" : "h-9 w-9"
  );

  const iconSize = isSm ? 12 : isLg ? 18 : 14;

  return (
    <div className={cn(
      "flex w-fit items-center rounded-full border border-border bg-background shadow-inner",
      isSm ? "p-0.5" : "p-1",
      className
    )}>
      <button 
        type="button"
        onClick={() => onUpdate(Math.max(1, quantity - 1))} 
        className={btnClass}
      >
        <Minus size={iconSize} />
      </button>
      <span className={cn(
        "text-center font-bold text-foreground",
        isSm ? "min-w-[24px] text-xs" : isLg ? "min-w-[50px] text-lg" : "min-w-[32px] text-sm"
      )}>
        {quantity}
      </span>
      <button 
        type="button"
        onClick={() => onUpdate(quantity + 1)} 
        className={btnClass}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
