import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, updateQuantity, removeFromCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Mallu Smart" },
      { name: "description", content: "Your shopping cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, totalPrice } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h1 className="text-lg font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start shopping to add items.</p>
        <Link to="/shop">
          <Button className="mt-4 bg-primary text-primary-foreground">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <h1 className="mb-4 text-lg font-bold text-foreground">Shopping Cart</h1>

      <div className="space-y-3">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <img src={product.image} alt={product.name} className="h-16 w-16 rounded-md object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-card-foreground truncate">{product.name}</h3>
              <p className="text-sm font-bold text-foreground">₹{product.price}</p>
            </div>
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1">
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-2 text-sm">{quantity}</span>
              <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <span className="text-sm font-semibold text-foreground w-16 text-right">₹{product.price * quantity}</span>
            <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <span className="text-base font-bold text-foreground">Total: ₹{totalPrice}</span>
        <Button className="bg-primary text-primary-foreground" onClick={() => setCheckoutOpen(true)}>
          Proceed to Checkout
        </Button>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} total={totalPrice} />
    </div>
  );
}
