import { Outlet, Link, createRootRoute, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { SplashScreen } from "@/components/SplashScreen";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useState, useEffect } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { setProducts } from "@/lib/store";



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
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});



import { AnimatePresence, motion } from "framer-motion";

function RootComponent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopLoadingBar />
      {showSplash && (
        <SplashScreen 
          isLoading={isInitializing} 
          onComplete={() => setShowSplash(false)} 
        />
      )}
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <WhatsAppButton />
    </div>
  );
}
