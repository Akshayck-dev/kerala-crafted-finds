import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Get in Touch — Kerala Crafted Finds" },
      { name: "description", content: "Contact Kerala Crafted Finds for support or inquiries." },
      { property: "og:title", content: "Get in Touch — Kerala Crafted Finds" },
      { property: "og:description", content: "We are here to help. Reach out to the Kerala Crafted Finds team." },
    ],
  }),
  component: ContactPage,
});

import { motion } from "framer-motion";
import { useState } from "react";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build a structured WhatsApp message from the form
    const lines = [
      `📩 *New Contact Inquiry — Mallu Smart*`,
      ``,
      `👤 *Name:* ${formData.name}`,
      `📧 *Email:* ${formData.email}`,
      formData.subject ? `📌 *Subject:* ${formData.subject}` : null,
      `💬 *Message:* ${formData.message}`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const whatsappUrl = `https://wa.me/919495532563?text=${text}`;

    setSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 600);
  };

  return (
    <div className="pb-24">
      <div className="section-padding">
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 space-y-4"
        >
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Customer Support ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>
          <h1 className="fluid-heading-2 font-black italic tracking-tighter uppercase text-foreground">
            Contact Us
          </h1>
          <p className="max-w-xl text-lg font-medium text-muted-foreground/80 leading-relaxed pt-2">
            We are here to help you anytime.
          </p>
        </motion.div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* Contact Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[3rem] border border-border bg-card p-8 shadow-2xl sm:p-12"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
                  <Send className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Message Sent!</h3>
                <p className="mt-3 text-muted-foreground">
                  WhatsApp is opening with your message. If it doesn't open, please message us directly at{" "}
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
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  variant="outline"
                  className="mt-6 rounded-full"
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <>
                <h2 className="mb-8 text-2xl font-bold text-foreground">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Full Name</Label>
                      <Input
                        id="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Email Address</Label>
                      <Input
                        id="email"
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Artisan Inquiry"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Your Message</Label>
                    <Textarea 
                       id="message" 
                       required 
                       placeholder="How can we help you today?" 
                       value={formData.message}
                       onChange={(e) => handleChange("message", e.target.value)}
                       className="min-h-[150px] rounded-[2rem] border-border/50 bg-muted/30 p-6 focus-visible:ring-primary" 
                    />
                  </div>

                  <Button type="submit" className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98">
                    Send via WhatsApp <Send className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Your message will be sent to our team via WhatsApp for a faster response.
                  </p>
                </form>
              </>
            )}
          </motion.div>

          {/* Contact Information & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12 lg:pt-8"
          >
            <div className="space-y-8">
               <div className="group flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Email Response Unit</h4>
                    <p className="text-xl font-bold">mallusmart.kerala@gmail.com</p>
                  </div>
               </div>

               <div className="group flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Hotline Support</h4>
                    <p className="text-xl font-bold">+91 94955 32563</p>
                  </div>
               </div>

               <div className="group flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Base of Operations</h4>
                    <p className="text-xl font-bold">Wayanad Heritage Hub, <br />Kerala, India</p>
                  </div>
               </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-6">
               <h4 className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase text-center lg:text-left">Follow the Journey</h4>
               <div className="flex justify-center gap-4 lg:justify-start">
                  <Button size="icon" className="h-14 w-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Instagram className="h-6 w-6" />
                  </Button>
                  <Button size="icon" className="h-14 w-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Facebook className="h-6 w-6" />
                  </Button>
                  <Button size="icon" className="h-14 w-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Twitter className="h-6 w-6" />
                  </Button>
               </div>
            </div>

            {/* Support Disclaimer Banner */}
            <div className="rounded-[2rem] bg-muted/50 p-6 text-sm text-muted-foreground leading-relaxed">
               <p><strong>Note:</strong> We typically respond to all inquiries within 24 hours. For immediate support, use the floating WhatsApp button or click "Send via WhatsApp" in the form.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full ${className}`} />
}

