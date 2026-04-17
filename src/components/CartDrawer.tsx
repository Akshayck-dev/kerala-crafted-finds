import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart, useCartDrawer, removeFromCart, updateQuantity, toggleCheckout } from "@/lib/store";
import { QuantitySelector } from "@/components/QuantitySelector";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const { items, totalItems, totalPrice } = useCart();
  const { isOpen, toggleCart } = useCartDrawer();

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 px-6 text-center">
            <div className="rounded-full bg-brand-light/20 p-6">
              <ShoppingCart className="h-12 w-12 text-primary/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Looks like you haven't added anything to your cart yet.
              </p>
            </div>
            <Button onClick={() => toggleCart(false)} className="rounded-full bg-primary px-8">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 sm:px-6">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 py-4 sm:py-5">
                    <div className="h-14 w-14 min-[380px]:h-16 min-[380px]:w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div className="flex justify-between gap-2">
                        <h4 className="line-clamp-2 text-[10px] min-[380px]:text-[12px] sm:text-sm font-bold leading-tight uppercase tracking-tight">
                          {item.product.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantitySelector 
                            quantity={item.quantity} 
                            onUpdate={(newQty) => updateQuantity(item.product.id, newQty)} 
                            size="sm"
                        />
                        <span className="text-xs min-[380px]:text-sm font-bold text-foreground">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t bg-card/50 px-4 py-4 sm:px-6 sm:py-6 sm:flex-col">
              <div className="w-full space-y-3 sm:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-medium text-success">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg sm:text-xl">₹{totalPrice}</span>
                </div>
                <div className="grid gap-2 sm:gap-3 pt-1">
                  <Link to="/cart" onClick={() => toggleCart(false)} className="w-full">
                    <Button variant="outline" className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-border/50 font-black italic tracking-tighter uppercase text-[10px] sm:text-xs">
                      View full cart
                    </Button>
                  </Link>
                  <Button 
                    className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black italic tracking-tighter uppercase text-sm sm:text-base" 
                    onClick={() => {
                      toggleCart(false);
                      toggleCheckout(true);
                    }}
                  >
                    Checkout Now <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
                <p className="text-center text-[9px] sm:text-[10px] text-muted-foreground">
                  By proceeding to checkout you agree to our Terms of Service & Privacy Policy.
                </p>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
