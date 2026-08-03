import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, X, MessageSquare, Heart } from "lucide-react";
import { customerAddReview } from "@/lib/api";
import { toast } from "sonner";

export function GlobalReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Check if review already submitted
    const isSubmitted = localStorage.getItem("app_review_submitted") === "true";
    // 2. Check if review dismissed in this session
    const isDismissed = sessionStorage.getItem("app_review_dismissed") === "true";

    if (isSubmitted || isDismissed) {
      return;
    }

    // 3. Set a 50-second timer to open the modal
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 50000); // 50 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as dismissed for this session so it won't show again
    sessionStorage.setItem("app_review_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement).value;
    const comments = (form.elements.namedItem("comments") as HTMLTextAreaElement).value;

    setIsSubmitting(true);
    try {
      await customerAddReview({
        name,
        location,
        star: rating,
        comments,
        productId: 0,
        reviewType: "Platform",
      });

      toast.success("Thank you for sharing your feedback with us! ❤️");
      // Mark as submitted globally so it never shows again
      localStorage.setItem("app_review_submitted", "true");
      setIsOpen(false);
    } catch (err: any) {
      console.error("Global review submit error:", err);
      // Even on failure, save locally so we don't repeatedly prompt the user
      localStorage.setItem("app_review_submitted", "true");
      toast.success("Thank you! Your feedback has been received.");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-md border border-border/60 p-0 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 border-b border-border/40 bg-muted/30">
          <DialogHeader className="space-y-1">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
              <MessageSquare className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-black uppercase tracking-wider text-foreground">
              Rate Your Experience!
            </DialogTitle>
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Help us improve Mallu's Mart
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tap to Rate</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-110 transition-transform active:scale-95"
                >
                  <Star
                    className={`h-7 w-7 transition-colors duration-150 ${
                      star <= (hoverRating ?? rating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Adarsh"
              className="w-full h-10 rounded-xl border border-border/50 bg-background px-3.5 text-xs font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Location / City</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Ernakulam, Kerala"
              className="w-full h-10 rounded-xl border border-border/50 bg-background px-3.5 text-xs font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Feedback / Suggestions</label>
            <textarea
              name="comments"
              required
              rows={3}
              placeholder="Tell us what you like or how we can improve your shopping experience..."
              className="w-full rounded-xl border border-border/50 bg-background p-3.5 text-xs font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-1.5"
          >
            Submit Feedback <Heart className="h-3.5 w-3.5 fill-current" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
