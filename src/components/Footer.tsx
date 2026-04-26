import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <img src={logo} alt="Mallu Smart" className="h-10 w-auto" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bringing authentic Kerala products directly from local artisans to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Quick Links</h4>
            <div className="flex flex-col gap-1.5">
              <Link to="/shop" className="text-xs text-muted-foreground hover:text-primary transition-colors">Shop</Link>
              <Link to="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Contact</h4>
            <p className="text-xs text-muted-foreground">mallusmart.kerala@gmail.com</p>
            <p className="text-xs text-muted-foreground">9495532563</p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.facebook.com/share/17RAiqmBvv/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-110 hover:opacity-90">
                <Facebook size={14} />
              </a>
              <a href="https://www.instagram.com/mallusmart?igsh=cWY3eHE4bWh3dnhr" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-110 hover:opacity-90">
                <Instagram size={14} />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-110 hover:opacity-90">
                <Twitter size={14} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">Mallu Smart — Built for local sellers</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-[0.2em]">© 2026 Kerala Crafted Finds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
