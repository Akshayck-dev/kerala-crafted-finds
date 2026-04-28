import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Package,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Start Selling — Mallu’s Mart" },
      {
        name: "description",
        content:
          "Join Mallu’s Mart as a homepreneur. Turn your skills into income by selling authentic Kerala products.",
      },
      { property: "og:title", content: "Start Selling — Mallu’s Mart" },
      {
        property: "og:description",
        content: "Join Mallu’s Mart and start selling your home-made products to customers across the world.",
      },
    ],
  }),
  component: SellPage,
});

const benefits = [
  {
    icon: Store,
    title: "Your Own Online Store",
    desc: "Get a dedicated storefront to showcase your products with professional images and descriptions.",
  },
  {
    icon: Users,
    title: "Access to Thousands",
    desc: "Reach customers across India who are looking for authentic Kerala products.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    desc: "We handle marketing and promotions so you can focus on creating amazing products.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Receive timely and secure payments directly to your bank account.",
  },
];

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Apply via WhatsApp",
    desc: "Fill out the form below or message us directly on WhatsApp with your product details.",
  },
  {
    number: "02",
    icon: CheckCircle2,
    title: "Get Verified",
    desc: "Our team reviews your application and verifies your product quality within 48 hours.",
  },
  {
    number: "03",
    icon: Package,
    title: "List Your Products",
    desc: "Upload photos and descriptions. We'll help you create the perfect listing.",
  },
  {
    number: "04",
    icon: Wallet,
    title: "Start Earning",
    desc: "Receive orders and payments. We handle delivery and customer support.",
  },
];

function SellPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    place: "",
    product: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build WhatsApp message from form data
    const lines = [
      `🛍️ *New Seller Application — Mallu’s Mart*`,
      ``,
      `👤 *Name:* ${formData.name}`,
      `📱 *Phone:* ${formData.phone}`,
      `📍 *Place:* ${formData.place}`,
      `📦 *Product:* ${formData.product}`,
    ];
    if (formData.message.trim()) {
      lines.push(`💬 *Message:* ${formData.message}`);
    }

    const text = encodeURIComponent(lines.join("\n"));
    const whatsappUrl = `https://wa.me/919495532563?text=${text}`;

    setSubmitted(true);

    // Open WhatsApp in a new tab
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.4em] backdrop-blur-sm">
              For Sellers & Artisans
            </span>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter sm:text-6xl lg:text-7xl">
              From Home <br className="hidden sm:block" /> to Horizon.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/90 sm:text-xl">
              Mallu’s Mart is Kerala's first platform dedicated exclusively to homepreneurs. Join our mission to take your authentic creations to the world.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="#seller-form">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-white px-10 text-lg font-bold text-primary shadow-2xl transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a
                href="https://wa.me/919495532563?text=Hi%2C%20I%20want%20to%20start%20selling%20on%20Mallu%20Mart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-2 border-white/30 bg-transparent px-10 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-white/10 active:scale-95"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              Why Sell With Us
            </span>
            <h2 className="mt-4 text-3xl font-black italic uppercase tracking-tighter text-foreground sm:text-4xl">
              Everything You Need to Succeed
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-[2.5rem] border border-border/50 bg-card p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-primary/5 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="mb-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-black italic uppercase tracking-tighter text-foreground sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mb-4 text-5xl font-black italic text-primary/10">{step.number}</div>
                <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-12 hidden h-5 w-5 text-primary/20 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Application Form */}
      <section id="seller-form" className="py-16 sm:py-24">
        <div className="mx-auto max-w-[700px] px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-10 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                Join Us
              </span>
              <h2 className="mt-4 text-3xl font-black italic uppercase tracking-tighter text-foreground sm:text-4xl">
                Seller Application
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Fill in your details below and we'll connect with you via WhatsApp to get you started.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[3rem] border border-primary/20 bg-primary/5 p-12 text-center"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Application Submitted!</h3>
                <p className="mt-3 text-muted-foreground">
                  WhatsApp is opening with your details. If it doesn't, please message us directly at{" "}
                  <a
                    href="https://wa.me/919495532563"
                    className="font-semibold text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +91 94955 32563
                  </a>
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-6 rounded-full"
                >
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[3rem] border border-border bg-card p-8 shadow-2xl sm:p-12"
              >
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="seller-name"
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="seller-name"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="seller-phone"
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="seller-phone"
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="seller-place"
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                      >
                        Place / District *
                      </Label>
                      <Input
                        id="seller-place"
                        required
                        placeholder="e.g. Wayanad, Kochi"
                        value={formData.place}
                        onChange={(e) => handleChange("place", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="seller-product"
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                      >
                        What do you sell? *
                      </Label>
                      <Input
                        id="seller-product"
                        required
                        placeholder="e.g. Spices, Handicrafts"
                        value={formData.product}
                        onChange={(e) => handleChange("product", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="seller-message"
                      className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                    >
                      Tell us more (optional)
                    </Label>
                    <Textarea
                      id="seller-message"
                      placeholder="Any additional details about your products, experience, etc."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="min-h-[120px] rounded-[2rem] border-border/50 bg-muted/30 p-6 focus-visible:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Submit via WhatsApp
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, your details will be sent to our team via WhatsApp for quick
                    processing.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
