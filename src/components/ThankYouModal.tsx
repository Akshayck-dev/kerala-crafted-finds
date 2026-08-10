import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Confetti } from "@/components/Confetti";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function ThankYouModal({ 
  isOpen, 
  onClose, 
  title = "Thank You! 🎉", 
  message = "Your review has been successfully submitted. We appreciate your feedback!" 
}: ThankYouModalProps) {
  return (
    <>
      {isOpen && <Confetti />}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[92vw] max-w-[360px] bg-background/95 backdrop-blur-md border border-border/60 p-6 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-center text-lg font-black uppercase tracking-tight text-foreground">
              {title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {message}
          </p>
          <Button 
            onClick={onClose} 
            className="w-full h-10 rounded-xl bg-primary font-black italic tracking-tighter uppercase text-xs shadow-lg active:scale-95 transition-all"
          >
            Awesome!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
