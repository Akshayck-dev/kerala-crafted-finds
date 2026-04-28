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
              <img src={logo} alt="Mallu’s Mart" className="h-10 w-auto" />
              <span className="text-lg font-black italic tracking-tighter uppercase text-foreground">Mallu’s Mart</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kerala's first platform dedicated exclusively to products created by **homepreneurs**. Taking authentic creations from Kerala homes to the world.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Quick Links</h4>
            <div className="flex flex-col gap-1.5">
              <Link to="/shop" className="text-xs text-muted-foreground hover:text-primary transition-colors">Shop All</Link>
              <Link to="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
              <Link to="/sell" className="text-xs text-muted-foreground hover:text-primary transition-colors">Start Selling</Link>
              <Link to="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Connect</h4>
            <p className="text-xs text-muted-foreground font-medium">mallusmart.kerala@gmail.com</p>
            <p className="text-xs text-muted-foreground font-medium">+91 9495532563</p>
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
          <p className="text-xs text-muted-foreground font-bold italic uppercase tracking-tighter">Mallu’s Mart — Home to Horizon</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-[0.2em]">© 2026 Mallu’s Mart Kerala. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
