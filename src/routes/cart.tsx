import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, updateQuantity, removeFromCart, toggleCheckout } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Selection — Mallu Smart Registry" },
      { name: "description", content: "Review your curated selection of Kerala heritage products." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-24 text-center">
        <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/5 p-8 animate-float">
                <ShoppingBag className="h-16 w-16 text-primary/40" />
            </div>
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">Your Selection is Empty</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            The registry has no active records of items for your current session.
        </p>
        <Link to="/shop" className="mt-10 inline-block">
          <Button size="lg" className="rounded-full px-10 h-14 bg-primary text-lg font-black italic tracking-tight uppercase">
            Browse Archive
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-24">
      <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Collection Registry ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>
          <h1 className="fluid-heading-2 font-black italic tracking-tighter uppercase text-foreground">
            Current Selection
          </h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="group relative flex flex-col gap-6 rounded-[2.5rem] border border-border/50 bg-card/40 p-4 transition-all duration-500 hover:bg-card/80 hover:shadow-2xl sm:flex-row sm:items-center">
               {/* Product Image */}
               <div className="relative aspect-square w-full sm:w-24 lg:w-32 flex-shrink-0 overflow-hidden rounded-[1.8rem] bg-muted shadow-sm">
                 <img
                   src={product.image}
                   alt={product.name}
                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
               </div>

               {/* Product Details */}
               <div className="flex flex-1 flex-col justify-between py-2">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold tracking-widest text-[#B68D40] uppercase">
                        {product.category?.replace("-", " ")}
                    </span>
                    <h3 className="text-lg font-black italic tracking-tight text-foreground uppercase line-clamp-1">
                        {product.name}
                    </h3>
                 </div>
                 
                 <div className="mt-4 flex items-center justify-between sm:mt-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center rounded-full border border-border bg-background p-1 shadow-inner">
                            <button 
                                onClick={() => updateQuantity(product.id, quantity - 1)} 
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[30px] text-center font-bold text-sm">{quantity}</span>
                            <button 
                                onClick={() => updateQuantity(product.id, quantity + 1)} 
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                        <span className="text-xl font-black text-foreground">₹{product.price * quantity}</span>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFromCart(product.id)}
                        className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Order Summary Section */}
        <div className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-[3rem] border-2 border-primary/20 bg-card p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                    <ShieldCheck className="h-24 w-24" />
                </div>
                
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-foreground mb-8">
                    Registry Summary
                </h2>
                
                <div className="space-y-5">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Original Value</span>
                        <span className="text-foreground">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Registry Credit</span>
                        <span className="text-success">FREE</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Verification Fee</span>
                        <span className="text-success">WAIVED</span>
                    </div>
                    
                    <Separator className="bg-border/60" />
                    
                    <div className="flex justify-between items-end pt-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-[#B68D40] uppercase">Total Grant</span>
                            <span className="text-3xl font-black italic tracking-tighter text-primary uppercase">₹{totalPrice}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-6">
                        <Button 
                            className="w-full h-16 rounded-[1.5rem] bg-primary text-base font-black italic tracking-tight text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase"
                            onClick={() => toggleCheckout(true)}
                        >
                            Confirm Selection <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Link to="/shop" className="block text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase hover:text-foreground transition-colors">
                            Continue Browsing Archive
                        </Link>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl bg-muted/30 p-4 border border-border/50">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <strong>Official Provision:</strong> All selections in the Mallu Smart Registry are verified for heritage authenticity and institutional quality standards.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
