import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { clearCart } from "@/lib/store";
import { useState } from "react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

export function CheckoutModal({ open, onOpenChange, total }: CheckoutModalProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearCart();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {submitted ? "Order Confirmed! 🎉" : "Checkout"}
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="text-sm text-muted-foreground py-4">
            Thank you for your order! We will contact you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input required placeholder="Enter your full name" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mobile Number</Label>
              <Input required type="tel" placeholder="+91 9876543210" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Email Address</Label>
              <Input required type="email" placeholder="you@email.com" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Address</Label>
              <Input required placeholder="Full delivery address" className="h-8 text-sm" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-foreground">Total: ₹{total}</span>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Confirm Order
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
