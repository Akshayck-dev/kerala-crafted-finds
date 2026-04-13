import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base font-bold text-primary">Mallu</span>
              <span className="text-base font-bold text-foreground">Smart</span>
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
            <p className="text-xs text-muted-foreground">support@mallusmart.com</p>
            <p className="text-xs text-muted-foreground">+91 9999999999</p>
            <div className="mt-3 flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">FB</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">IG</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">TW</a>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">© 2026 Mallu Smart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
