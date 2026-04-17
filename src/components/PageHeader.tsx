import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-12 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
          {subtitle} ——
        </span>
        <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
      </div>
      <h1 className="fluid-heading-2 font-black italic tracking-tighter uppercase text-foreground">
        {title}
      </h1>
    </div>
  );
}
