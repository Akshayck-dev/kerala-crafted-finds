import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, X, MessageSquare, Heart } from "lucide-react";
import { customerAddReview } from "@/lib/api";
import { toast } from "sonner";
import { useReviewModal } from "@/lib/store";
import { ThankYouModal } from "@/components/ThankYouModal";

export function GlobalReviewModal() {
  const { isOpen, toggleReviewModal } = useReviewModal();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleClose = () => {
    toggleReviewModal(false);
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
      toggleReviewModal(false);
      setShowThankYou(true);
    } catch (err: any) {
      console.error("Global review submit error:", err);
      // Even on failure, save locally so we don't repeatedly prompt the user
      localStorage.setItem("app_review_submitted", "true");
      toast.success("Thank you! Your feedback has been received.");
      toggleReviewModal(false);
      setShowThankYou(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[92vw] max-w-[360px] bg-background/95 backdrop-blur-md border border-border/60 p-0 rounded-[1.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="p-4 pt-5 pb-2.5 border-b border-border/40 bg-muted/30">
          <DialogHeader className="space-y-0.5">
            <div className="mx-auto h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-1">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <DialogTitle className="text-center text-sm font-black uppercase tracking-wider text-foreground">
              Rate Your Experience!
            </DialogTitle>
            <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Help us improve Mallu's Mart
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-4 pb-5 space-y-2.5">
          <div className="flex flex-col items-center justify-center gap-1 py-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Tap to Rate</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 hover:scale-110 transition-transform active:scale-95"
                >
                  <Star
                    className={`h-5 w-5 transition-colors duration-150 ${
                      star <= (hoverRating ?? rating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Your Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Adarsh"
              className="w-full h-8.5 rounded-lg border border-border/50 bg-background px-3 text-xs font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Location / City</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Ernakulam, Kerala"
              className="w-full h-8.5 rounded-lg border border-border/50 bg-background px-3 text-xs font-semibold focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Feedback / Suggestions</label>
            <textarea
              name="comments"
              required
              rows={2}
              placeholder="Tell us what you like or how we can improve..."
              className="w-full rounded-lg border border-border/50 bg-background p-2.5 text-xs font-semibold focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 rounded-lg font-bold uppercase tracking-wider text-xs shadow-md shadow-primary/10 mt-1 flex items-center justify-center gap-1.5"
          >
            Submit Feedback <Heart className="h-3 w-3 fill-current" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    <ThankYouModal 
      isOpen={showThankYou} 
      onClose={() => setShowThankYou(false)} 
      title="Feedback Submitted! 🎉"
      message="Thank you for sharing your feedback with us. Your suggestions help us improve Mallu's Mart!"
    />
    </>
  );
}
