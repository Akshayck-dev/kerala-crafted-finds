import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { clearCart, useCart, useCheckoutModal } from "@/lib/store";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveOrder } from "@/lib/api";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export function CheckoutModal() {
  const { items, totalPrice } = useCart();
  const { isOpen, toggleCheckout } = useCheckoutModal();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const formData = new FormData(e.currentTarget);
        const details = {
          customerName: formData.get("name") as string,
          mobile: formData.get("phone") as string,
          email: formData.get("email") as string,
          address: `${formData.get("address")}, ${formData.get("city")}, ${formData.get("pincode")}`,
          createdOn: new Date().toISOString(),
          products: items.map(item => ({
            productId: parseInt(item.product.id),
            quantity: item.quantity
          }))
        };

        await saveOrder(details);

        clearCart();
        setSubmitted(true);
        toast.success("Order registered successfully!");
        
        setTimeout(() => {
          setSubmitted(false);
          toggleCheckout(false);
        }, 4000);
    } catch (error) {
        toast.error("Failed to transmit order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center space-y-6 px-10 py-24 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-success/20" />
        <div className="relative rounded-full bg-success/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-success" />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
          Registry Logged
        </h3>
        <p className="max-w-md text-muted-foreground leading-relaxed">
          Your selection has been officially transmitted to our heritage verification team.
        </p>
      </div>
    </div>
  );

  const OrderSummaryPane = ({ isMobileView = false }: { isMobileView?: boolean }) => (
    <div className={cn(
      "flex flex-col",
      isMobileView ? "mb-8 space-y-4" : "flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide mb-8"
    )}>
      {!isMobileView && (
        <div className="mb-8">
          <h3 className="text-lg font-black italic tracking-tighter text-foreground uppercase">
            Order Summary
          </h3>
          <div className="mt-1 h-[2px] w-12 bg-primary/30" />
        </div>
      )}
      
      {items.map((item) => (
        <div key={item.product.id} className={cn(
          "flex gap-4",
          isMobileView ? "bg-muted/30 p-3 rounded-2xl border border-border/10" : ""
        )}>
          <div className={cn(
            "flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm border border-border/10",
            isMobileView ? "h-14 w-14" : "h-16 w-16"
          )}>
            <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <h4 className={cn(
              "font-bold text-foreground leading-tight line-clamp-1",
              isMobileView ? "text-sm" : "text-sm"
            )}>{item.product.name}</h4>
            <p className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">Qty {item.quantity}</p>
          </div>
          <div className={cn(
            "flex items-center font-bold text-foreground",
            isMobileView ? "text-sm" : "text-sm"
          )}>
            ₹{item.product.price * item.quantity}
          </div>
        </div>
      ))}

      {!isMobileView && (
        <div className="space-y-3 border-t border-border/50 pt-6 mt-auto">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold text-foreground">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-bold text-success/80">Free</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-dashed border-border/50">
            <span className="text-sm font-black italic tracking-tighter uppercase">Total</span>
            <span className="text-xl font-black italic tracking-tighter text-primary">₹{totalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );

  const CheckoutForm = () => (
    <div className="w-full lg:w-full p-0 flex flex-col h-full">
      {!isMobile && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black italic tracking-tighter text-foreground uppercase">
              {items.length > 0 ? "Order Registry" : "Registry Empty"}
            </h3>
            <p className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase mt-1">
              Direct heritage provision
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Mobile Product List */}
      <div className="lg:hidden">
        <OrderSummaryPane isMobileView />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. John Doe"
              className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
            />
          </div>
          <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  type="tel"
                  placeholder="+91 — — — — — — — — —"
                  className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
                />
              </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
              Delivery Address
            </Label>
            <Input
              id="address"
              name="address"
              required
              placeholder="Street name..."
              className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
            />
          </div>
          <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pincode" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
                Pincode
              </Label>
              <Input
                id="pincode"
                name="pincode"
                required
                placeholder="600001"
                className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase ml-1">
                City
              </Label>
              <Input
                id="city"
                name="city"
                required
                placeholder="Kochi"
                className="h-11 rounded-xl border-border/50 bg-background px-4 transition-all focus:border-primary/50 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Mobile Total Display */}
        <div className="lg:hidden flex items-center justify-between border-t border-dashed border-border/50 pt-4 mt-2">
          <span className="text-xs font-black italic tracking-tighter uppercase">Total Grant</span>
          <span className="text-lg font-black italic tracking-tighter text-primary">₹{totalPrice}</span>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="h-12 lg:h-14 w-full rounded-xl lg:rounded-2xl bg-primary text-sm lg:text-base font-black italic tracking-tight text-white shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
               {isSubmitting ? (
                   <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    TRANSMITTING...
                   </>
               ) : (
                   <>
                    <Send className="h-5 w-5" />
                    CONFIRM REGISTRY
                   </>
               )}
            </div>
          </Button>
          <button
            type="button"
            onClick={() => toggleCheckout(false)}
            className="w-full text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Return to Cart
          </button>
        </div>
      </form>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={toggleCheckout}>
        <DrawerContent className="max-h-[96vh] px-4 pb-12">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted/40 my-3" />
            <DrawerHeader className="px-0 mb-4 flex flex-row items-center justify-between">
                <div className="text-left">
                    <DrawerTitle className="text-left text-lg font-black italic tracking-tighter text-foreground uppercase">
                       Order Registry
                    </DrawerTitle>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase mt-1">
                       Direct heritage provision
                    </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleCheckout(false)}
                  className="rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
            </DrawerHeader>
            <div className="overflow-y-auto pr-1 scrollbar-hide">
                {submitted ? <SuccessView /> : <CheckoutForm />}
                <div className="h-8" />
            </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleCheckout}>
      <DialogContent className="max-h-[95vh] overflow-y-auto lg:overflow-hidden border-border/50 bg-background p-0 sm:max-w-md lg:max-w-[850px] rounded-3xl lg:rounded-[3rem] scrollbar-hide">
        {submitted ? (
          <SuccessView />
        ) : (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Column: Desktop Order Summary */}
            <div className="hidden lg:flex w-[40%] bg-muted/20 p-10 flex-col border-r border-border/50">
              <OrderSummaryPane />
            </div>

            {/* Right Column: Checkout Details */}
            <div className="w-full lg:w-[60%] p-6 lg:p-10 lg:pt-8 flex flex-col relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => toggleCheckout(false)}
                className="absolute top-4 right-4 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors hidden lg:flex"
              >
                <X className="h-5 w-5" />
              </Button>
              <CheckoutForm />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
