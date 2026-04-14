import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { SplashScreen } from "@/components/SplashScreen";
import { useState, useEffect } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { setProducts } from "@/lib/store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mallu Smart — Authentic Kerala Products" },
      { name: "description", content: "Discover handmade, natural & trusted Kerala products from local artisans." },
      { name: "author", content: "Mallu Smart" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeApp() {
        try {
            // Fetch initial registry data
            const [pData] = await Promise.all([
                fetchProducts(),
                fetchCategories()
            ]);
            setProducts(pData);
        } catch (err) {
            console.error("Initialization failed", err);
        } finally {
            setIsInitializing(false);
        }
    }
    initializeApp();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {showSplash && (
        <SplashScreen 
          isLoading={isInitializing} 
          onComplete={() => setShowSplash(false)} 
        />
      )}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
