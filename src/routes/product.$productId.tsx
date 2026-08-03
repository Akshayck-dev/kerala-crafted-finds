import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { addToCart, useProducts } from "@/lib/store";
import { ShoppingCart, MessageCircle, ArrowLeft, CheckCircle2, ShieldCheck, Truck, RotateCcw, Loader2, Calendar, Star, ThumbsUp, ThumbsDown, ChevronRight, ChevronLeft, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { QuantitySelector } from "@/components/QuantitySelector";
import { fetchProducts, customerAddReview, fetchReviews } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { AuthImage } from "@/components/AuthImage";
import { cn, toTitleCase } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
  title?: string;
  likes?: number;
  dislikes?: number;
}

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { products, setProducts } = useProducts();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(products.length === 0);

  // Shipping Availability Checker State
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkedPincode, setCheckedPincode] = useState<string | null>(null);
  const [isValidPin, setIsValidPin] = useState<boolean | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const getDeliveryDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const handleCheckShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) {
      setPinError("Please enter a pincode.");
      setIsValidPin(null);
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPinError("Please enter a valid 6-digit pincode.");
      setIsValidPin(null);
      return;
    }
    
    setPinError(null);
    setIsChecking(true);
    
    setTimeout(() => {
      setIsChecking(false);
      setCheckedPincode(pincode.trim());
      setIsValidPin(true);
    }, 600);
  };

  const product = products.find((p) => p.id === productId);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  useEffect(() => {
    if (!productId) return;
    
    async function loadRealReviews() {
      try {
        const apiReviews = await fetchReviews();
        
        const storageKey = `product_reviews_${productId}`;
        const stored = localStorage.getItem(storageKey);
        let localReviews: Review[] = [];
        if (stored) {
          try {
            localReviews = JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse local reviews", e);
          }
        }
        
        // Filter out any mock/seed reviews from localReviews
        const cleanLocalReviews = localReviews.filter(r => !r.id.includes("seed"));

        const mergedMap = new Map<string, Review>();
        
        apiReviews.forEach((r: any) => {
          if (r.isActive !== false) {
            mergedMap.set(r.id || r.comment, {
              id: r.id || `${productId}-${Date.now()}-${Math.random()}`,
              reviewerName: r.reviewerName || "Anonymous",
              rating: r.rating || 5,
              date: r.date || new Date().toISOString().split('T')[0],
              comment: r.comment || "",
              isVerified: true,
              likes: 0,
              dislikes: 0,
              title: r.rating === 5 ? "Excellent Product" : r.rating === 4 ? "Very Good" : "Good"
            });
          }
        });

        cleanLocalReviews.forEach((r) => {
          mergedMap.set(r.id || r.comment, r);
        });

        setReviews(Array.from(mergedMap.values()).sort((a, b) => b.date.localeCompare(a.date)));
      } catch (err) {
        console.error("Failed to load real reviews", err);
        const storageKey = `product_reviews_${productId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed: Review[] = JSON.parse(stored);
            setReviews(parsed.filter(r => !r.id.includes("seed")));
          } catch (e) {
            setReviews([]);
          }
        } else {
          setReviews([]);
        }
      }
    }
    
    loadRealReviews();
  }, [productId]);

  const handleAddReview = async (newReview: Omit<Review, "id" | "date" | "isVerified">) => {
    const defaultTitle = newReview.rating === 5 ? "Excellent Product" : newReview.rating === 4 ? "Very Good" : newReview.rating === 3 ? "Good" : newReview.rating === 2 ? "Disappointed" : "Very Poor";
    const reviewToAdd: Review = {
      ...newReview,
      id: `${productId}-${Date.now()}`,
      date: "Just now",
      isVerified: true,
      title: defaultTitle,
      likes: 0,
      dislikes: 0,
    };

    try {
      await customerAddReview({
        name: newReview.reviewerName,
        location: "Kerala",
        star: newReview.rating,
        comments: newReview.comment,
      });
    } catch (err) {
      console.error("Backend review submission failed, saved locally:", err);
    }

    const updated = [reviewToAdd, ...reviews];
    setReviews(updated);
    localStorage.setItem(`product_reviews_${productId}`, JSON.stringify(updated));
    setShowWriteForm(false);
    toast.success("Thank you! Your review has been submitted.");
  };

  useEffect(() => {
    async function syncRegistry() {
        if (products.length === 0) {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                console.error("Registry sync failed", err);
            } finally {
                setIsSyncing(false);
            }
        } else {
            setIsSyncing(false);
        }
    }
    syncRegistry();
  }, [productId, products.length, setProducts]);

  if (isSyncing) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-12">
        <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left: Image Skeleton */}
            <div className="space-y-4">
               <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
               <div className="flex gap-3">
                  <Skeleton className="h-20 w-20 rounded-2xl" />
                  <Skeleton className="h-20 w-20 rounded-2xl" />
                  <Skeleton className="h-20 w-20 rounded-2xl" />
               </div>
            </div>

            {/* Right: Info Skeleton */}
            <div className="space-y-8 pt-4">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-[1px] flex-1" />
                  </div>
                  <Skeleton className="h-12 w-3/4 rounded-xl" />
                  <Skeleton className="h-10 w-1/4 rounded-lg" />
               </div>

               <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-3xl" />
                  <Skeleton className="h-20 w-full rounded-3xl" />
               </div>

               <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pt-4">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-12 w-32 rounded-2xl" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-16 w-48 rounded-2xl" />
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
               </div>
            </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-24 text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground mb-4">
                Record Not Found
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                The requested item could not be found. It may have been removed or the link is broken.
            </p>
            <Link to="/shop">
                <Button className="rounded-full px-8">Return to Shop</Button>
            </Link>
        </div>
    );
  }

  const whatsappMsg = encodeURIComponent(`Hi, I'd like to order: ${toTitleCase(product.name)} (₹${product.price}) x ${qty}`);
  const galleryImages = Array.from(new Set([product.image, ...(product.images || [])])).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:py-12 pb-32">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground transition-colors hover:text-foreground uppercase">
        <ArrowLeft className="h-4 w-4" /> Back to Collection
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Left Column: Image Stack/Carousel */}
        <div className="space-y-4 min-w-0">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-muted shadow-2xl">
            {product.badge && (
              <Badge className="absolute left-6 top-6 z-10 bg-black/80 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white backdrop-blur-md">
                {product.badge}
              </Badge>
            )}
            <AuthImage 
              src={galleryImages[selectedImage]} 
              alt={toTitleCase(product.name)} 
              className="aspect-square w-full object-cover transition-all duration-700 hover:scale-110" 
            />
          </div>
          
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <AuthImage src={img} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Info */}
        <div className="flex flex-col space-y-5 lg:pt-4 min-w-0">
          <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B68D40] uppercase">
                Product Detail
              </span>
              <div className="h-[1px] flex-1 bg-[#B68D40]/30" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {product.categoryName || product.category?.replace("-", " ")}
              </span>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">
                {toTitleCase(product.name)}
              </h1>

              {/* Rating Summary Badge */}
              {reviews.length > 0 && (
                <button 
                  onClick={() => {
                    const element = document.getElementById("reviews-section");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 w-fit hover:opacity-80 transition-all text-xs font-semibold text-muted-foreground pt-1"
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                      const active = i < Math.round(avg);
                      return (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            active ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="font-bold text-foreground">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#B68D40]">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through decoration-destructive/30">
                  ₹{Math.round(product.originalPrice)}
                </span>
              )}
            </div>

          {product.ingredients && (
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase leading-relaxed">
              {product.ingredients}
            </p>
          )}

              {/* Premium Features Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/50 bg-muted/20 p-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">Category</span>
                  <p className="text-sm font-bold text-foreground capitalize">{product.categoryName || product.category?.replace("-", " ")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">Net Weight</span>
                  <p className="text-sm font-bold text-foreground">
                    {product.quantity ? `${product.quantity} ${product.unit || ''}` : 'Standard Pack'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">Authenticity</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                     <ShieldCheck className="h-3.5 w-3.5 text-[#B68D40]" /> Certified Kerala
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-60">Availability</span>
                  <p className="text-sm font-bold text-green-600">Ships in 10 days</p>
                </div>
              </div>

            {/* Artisan Card */}
            <div className="w-fit flex items-center justify-between gap-8 rounded-2xl border border-border bg-card py-1.5 px-3 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-primary/10">
                  <AvatarImage src={product.sellerAvatar} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">MS</AvatarFallback>
                </Avatar>
                <div className="space-y-0">
                  <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase leading-none block">
                    Seller
                  </span>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {product.sellerName || product.artisan || "Independent Artisan"}
                  </p>
                  {product.businessName && (
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
                      {product.businessName}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-primary/5 p-1 text-primary/60">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

          {/* Action Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-start sm:gap-6">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase leading-none block">
                Select Quantity
              </span>
              <QuantitySelector 
                quantity={qty} 
                onUpdate={setQty} 
                size="md" 
              />
            </div>

            <div className="hidden sm:flex items-center gap-2.5">
              <Button 
                className="h-10 rounded-xl bg-primary px-6 text-xs font-bold tracking-wider text-white transition-all active:scale-95 sm:flex-none uppercase"
                onClick={() => addToCart(product, qty)}
              >
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
              </Button>
              <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-10 w-10 shrink-0 rounded-xl border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/5 transition-all"
                 asChild
              >
                <a href={`https://wa.me/919495532563?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4.5 w-4.5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Simple Shipping Checker */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#B68D40]" />
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Shipping Availability
              </span>
            </div>

            <form onSubmit={handleCheckShipping} className="flex gap-2 relative max-w-sm">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    if (pinError) setPinError(null);
                  }}
                  className="w-full h-10 rounded-xl border border-border/50 bg-background px-3.5 text-xs font-medium tracking-wide transition-all focus:border-primary/50 focus:outline-none"
                />
                {pinError && (
                  <p className="absolute left-1 -bottom-4 text-[9px] font-bold text-destructive uppercase tracking-wider">
                    {pinError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isChecking}
                className="h-10 rounded-xl px-5 bg-primary font-bold text-xs tracking-wider uppercase text-white shadow-sm active:scale-95 transition-all shrink-0"
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check"
                )}
              </Button>
            </form>

            {checkedPincode && isValidPin && (
              <div className="mt-3 space-y-3 max-w-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 rounded-xl bg-green-500/5 border border-green-500/10 p-2.5 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Available to {checkedPincode}</p>
                    <p className="text-[10px] font-semibold text-foreground/80">Delivery by {getDeliveryDate(10)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border bg-muted/10 p-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Standard</span>
                      <span className="font-bold text-green-600 text-[9px] uppercase">Free</span>
                    </div>
                    <p className="font-extrabold text-[11px] text-foreground">{getDeliveryDate(5)} - {getDeliveryDate(8)}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/10 p-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Express</span>
                      <span className="font-bold text-[#B68D40] text-[9px] uppercase">₹99</span>
                    </div>
                    <p className="font-extrabold text-[11px] text-foreground">{getDeliveryDate(2)} - {getDeliveryDate(4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mb-10 border-y border-border/50 py-6 px-4">
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 flex">
            {[
              { icon: ShieldCheck, title: "Quality Assured", desc: "Hand-picked authentic items" },
              { icon: Truck, title: "Fast Shipping", desc: "Directly from Kerala hub" },
              { icon: RotateCcw, title: "7 Day Return", desc: "Hassle free replacements" },
            ].map((badge, idx) => (
              <CarouselItem key={idx} className="pl-4 basis-full sm:basis-1/3">
                <div className="flex items-center gap-4 py-2 px-1 justify-center sm:justify-start">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-foreground shrink-0">
                    <badge.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-foreground truncate">{badge.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{badge.desc}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Product Reviews Section */}
      <section id="reviews-section" className="space-y-6 mb-16 w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Customer Reviews ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
              Ratings & Feedback
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRatingInput(5);
                setShowWriteForm(true);
              }}
              className="text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-muted"
            >
              Write a Review
            </Button>
          </div>
        </div>

        {showWriteForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowWriteForm(false)}
            />
            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-background rounded-[2rem] border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10 mx-4">
              <button 
                onClick={() => setShowWriteForm(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                  const comment = (form.elements.namedItem("comment") as HTMLTextAreaElement).value;
                  if (!name || !comment) {
                    toast.error("Please fill in all fields.");
                    return;
                  }
                  handleAddReview({ reviewerName: name, rating: ratingInput, comment });
                  form.reset();
                }}
                className="space-y-4"
              >
                <h4 className="text-base font-bold uppercase tracking-wider text-foreground">Write a Review</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your name"
                    className="w-full h-10 rounded-xl border border-border/50 bg-background px-3.5 text-xs font-medium tracking-wide focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="transition-transform active:scale-95 text-foreground"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 cursor-pointer",
                            star <= ratingInput ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Review Comments</label>
                  <textarea
                    name="comment"
                    required
                    rows={4}
                    placeholder="What did you think of the quality, packaging, and shipping?"
                    className="w-full rounded-xl border border-border/50 bg-background p-3 text-xs font-medium tracking-wide focus:outline-none focus:border-primary/50"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full rounded-xl font-bold uppercase tracking-wider text-xs h-10 mt-2">
                  Submit Review
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Carousel List */}
        {reviews.length > 0 ? (
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth w-full">
              {reviews.map((review) => {
                const isLong = review.comment.length > 80;
                const commentSnippet = isLong ? review.comment.slice(0, 80) + "..." : review.comment;
                return (
                  <div key={review.id} className="w-[300px] shrink-0 border border-border/50 bg-card rounded-2xl p-4 shadow-sm snap-start flex flex-col justify-between min-h-[170px] select-none hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-foreground text-xs truncate max-w-[120px]">{review.reviewerName}</span>
                          {review.isVerified && (
                            <span className="text-[8px] bg-green-500/10 text-green-700 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 scale-90 origin-left flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5 text-green-600" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{review.date}</span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground leading-tight truncate">
                        {review.title || "Very Good"}
                      </h4>

                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {commentSnippet}
                        {isLong && (
                          <button 
                            onClick={() => setShowAllReviewsModal(true)}
                            className="text-primary font-bold ml-1 hover:underline text-xs"
                          >
                            more
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 bg-green-600/10 text-green-700 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                        <span>{review.rating}</span>
                        <Star className="h-3 w-3 fill-green-700 text-green-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="h-3 w-3" /> {review.likes || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <ThumbsDown className="h-3 w-3" /> {review.dislikes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show All Reviews Button */}
            <div className="mt-4 max-w-sm">
              <Button
                variant="outline"
                onClick={() => setShowAllReviewsModal(true)}
                className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs border border-border/60 hover:bg-muted flex items-center justify-center gap-1"
              >
                Show all reviews <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-medium py-4">Be the first to review this product!</p>
        )}
      </section>

      {/* Show All Reviews Modal */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAllReviewsModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-background rounded-[2rem] border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10 mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">All Reviews</h3>
                <p className="text-xs text-muted-foreground">Based on {reviews.length} customer ratings</p>
              </div>
              <button 
                onClick={() => setShowAllReviewsModal(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rating Summary inside Modal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center rounded-2xl border border-border/50 bg-muted/5 p-4 mt-2 shrink-0">
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/50 pb-3 md:pb-0 md:pr-3">
                <span className="text-3xl font-black text-foreground leading-none">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                    const active = i < Math.round(avg);
                    return (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          active ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                        )}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">Based on {reviews.length} reviews</span>
              </div>

              <div className="col-span-2 space-y-1.5 px-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[10px]">
                      <span className="w-8 font-bold text-foreground/80 flex items-center gap-0.5 shrink-0 justify-end">
                        {star} <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-muted-foreground shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin divide-y divide-border/30">
              {reviews.map((review, idx) => (
                <div key={review.id} className={cn("pt-4 flex flex-col gap-2", idx === 0 && "pt-0")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{review.reviewerName}</span>
                      {review.isVerified && (
                        <span className="text-[9px] bg-green-500/10 text-green-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{review.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground leading-tight">
                    {review.title || "Very Good"}
                  </h4>

                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    {review.comment}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 mt-1 border-t border-dashed border-border/20">
                    <div className="flex items-center gap-1 bg-green-600/10 text-green-700 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                      <span>{review.rating}</span>
                      <Star className="h-3 w-3 fill-green-700 text-green-700" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <ThumbsUp className="h-3.5 w-3.5" /> {review.likes || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <ThumbsDown className="h-3.5 w-3.5" /> {review.dislikes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      <section className="space-y-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Explore More ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>
          <h2 className="fluid-heading-3 font-black italic tracking-tighter uppercase text-foreground">
            You May Also Like
          </h2>
        </div>

        <div className="grid mobile-grid-dense gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 [&>*]:min-w-0">
          {products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
        {products.filter((p) => p.category === product.category && p.id !== product.id).length === 0 && (
           <p className="text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase italic py-12">No other records found in this category.</p>
        )}
      </section>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 p-3 backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-full sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2.5">
          <Button 
             variant="outline" 
             size="icon" 
             className="h-10 w-10 shrink-0 rounded-xl border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/5"
             asChild
          >
            <a href={`https://wa.me/919495532563?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4.5 w-4.5" />
            </a>
          </Button>
          <Button 
            className="h-10 flex-1 rounded-xl bg-primary text-xs font-bold tracking-wider text-white uppercase"
            onClick={() => addToCart(product, qty)}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart — ₹{product.price * qty}
          </Button>
        </div>
        <div className="h-1 w-full mobile-safe-bottom" />
      </div>
    </div>
  );
}