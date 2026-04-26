

import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { Search, Heart, ShoppingCart, Menu, X, User, MessageSquare, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist, toggleCart } from "@/lib/store";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/" as const, label: "Home" },
    { to: "/shop" as const, label: "Shop" },
    { to: "/about" as const, label: "About" },
    { to: "/faq" as const, label: "FAQ" },
    { to: "/contact" as const, label: "Contact" },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 md:top-4 md:px-6",
        scrolled ? "md:top-2" : "md:top-4"
      )}
    >
      <div 
        className={cn(
          "mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 transition-all duration-300",
          "border border-border/50 bg-background/70 backdrop-blur-xl md:rounded-full",
          scrolled ? "h-14 shadow-lg ring-1 ring-black/5" : "h-16 md:h-20"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
          <div className="relative overflow-hidden rounded-full transition-all group-hover:scale-105 shrink-0">
            <img 
              src={logo} 
              alt="Mallu Smart" 
              className={cn(
                "h-8 w-8 min-[380px]:h-10 min-[380px]:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 transition-all duration-300",
                scrolled && "md:h-10 md:w-10 lg:h-12 lg:w-12"
              )} 
            />
          </div>
          <span className="hidden min-[400px]:block text-[14px] min-[450px]:text-lg font-black italic tracking-tighter sm:block leading-none">
            MALLU SMART
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full bg-muted/30 p-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200",
                "hover:bg-background hover:text-foreground hover:shadow-sm"
              )}
              activeProps={{ 
                className: "bg-background text-primary shadow-sm" 
              }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Search className="h-4 w-4" />
          </Button>
          
          <Link to="/shop" className="relative group">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
              <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-in zoom-in items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="group relative h-9 w-9 rounded-full hover:bg-muted"
            onClick={() => toggleCart(true)}
          >
            <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-in zoom-in items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background">
                {totalItems}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="hidden h-9 w-9 rounded-full hover:bg-muted md:flex">
            <User className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay Redesign */}
      {mobileOpen && <MobileMenuContent scrolled={scrolled} setMobileOpen={setMobileOpen} logo={logo} navLinks={navLinks} />}
    </header>
  );
}

function MobileMenuContent({ scrolled, setMobileOpen, logo, navLinks }: { 
  scrolled: boolean, 
  setMobileOpen: (open: boolean) => void, 
  logo: string,
  navLinks: { to: string, label: string }[] 
}) {
  const [showContact, setShowContact] = React.useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-background p-6 backdrop-blur-3xl animate-in fade-in duration-300 md:hidden overflow-hidden">
      {/* Menu Header: Logo & Close Button */}
      <div className="relative z-20 flex items-center justify-between">
        <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border/50">
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-black italic tracking-tighter uppercase text-foreground">
            MALLU SMART
          </span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-muted border border-border/50"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Background Brand Watermark - More subtle */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.02]">
        <span className="text-[25vh] font-black italic tracking-tighter text-foreground uppercase rotate-90 whitespace-nowrap">
          MALLU SMART
        </span>
      </div>

      <div className="relative z-10 flex h-[calc(100%-60px)] flex-col justify-between pt-16 pb-6">
        <nav className="flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "group flex flex-col items-start py-4 border-b border-border/50 last:border-0"
              )}
              activeProps={{ className: "text-primary" }}
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none transition-all active:scale-95 group-hover:text-primary">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
           {!showContact ? (
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-full font-black italic uppercase tracking-wider bg-background border-2 border-border/50 text-[10px]">
                  Account
                </Button>
                <Button 
                  onClick={() => setShowContact(true)}
                  className="h-12 rounded-full font-black italic uppercase tracking-wider bg-primary text-white shadow-xl shadow-primary/20 text-[10px]"
                >
                  Contact Us
                </Button>
             </div>
           ) : (
             <div className="grid grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                   onClick={() => setShowContact(false)}
                  className="h-12 w-12 rounded-full p-0 flex items-center justify-center border-2 border-border/50"
                >
                  <X className="h-4 w-4" />
                </Button>
                <a 
                  href="https://wa.me/919495532563" 
                  className="h-12 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg active:scale-95 transition-transform"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:contact@mallusmart.com" 
                  className="h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a 
                  href="tel:+910000000000" 
                  className="h-12 flex items-center justify-center rounded-full bg-foreground text-background shadow-lg active:scale-95 transition-transform"
                >
                  <Phone className="h-5 w-5" />
                </a>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
