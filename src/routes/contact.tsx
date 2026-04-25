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

function ContactPage() {
  return (
    <div className="pb-24">
      <div className="section-padding">
        {/* Header Block */}
        <div className="mb-16 space-y-4">
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
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* Contact Form Section */}
          <div className="rounded-[3rem] border border-border bg-card p-8 shadow-2xl sm:p-12">
            <h2 className="mb-8 text-2xl font-bold text-foreground">Send a Message</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you! Your inquiry has been received. We will get back to you within 24 hours.");
              }}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Full Name</Label>
                  <Input id="name" required placeholder="John Doe" className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Email Address</Label>
                  <Input id="email" required type="email" placeholder="john@example.com" className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Subject</Label>
                <Input id="subject" placeholder="Artisan Inquiry" className="h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:ring-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-[10px] font-bold tracking-widest uppercase opacity-60">Your Message</Label>
                <Textarea 
                   id="message" 
                   required 
                   placeholder="How can we help you today?" 
                   className="min-h-[150px] rounded-[2rem] border-border/50 bg-muted/30 p-6 focus-visible:ring-primary" 
                />
              </div>

              <Button type="submit" className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98">
                Send Message <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Contact Information & Socials */}
          <div className="space-y-12 lg:pt-8">
            <div className="space-y-8">
               <div className="group flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Email Response Unit</h4>
                    <p className="text-xl font-bold">support@keralacrafted.com</p>
                  </div>
               </div>

               <div className="group flex gap-6 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Hotline Support</h4>
                    <p className="text-xl font-bold">+91 99999 00000</p>
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
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/50 hover:bg-muted">
                    <Instagram className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/50 hover:bg-muted">
                    <Facebook className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/50 hover:bg-muted">
                    <Twitter className="h-6 w-6" />
                  </Button>
               </div>
            </div>

            {/* Support Disclaimer Banner */}
            <div className="rounded-[2rem] bg-muted/50 p-6 text-sm text-muted-foreground leading-relaxed">
               <p><strong>Note:</strong> We typically respond to all artisan inquiries within 24 hours. For immediate order support, please use the WhatsApp button found in the cart or on product pages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full ${className}`} />
}
