import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Mallu Smart" },
      { name: "description", content: "Get in touch with Mallu Smart." },
      { property: "og:title", content: "Contact Us — Mallu Smart" },
      { property: "og:description", content: "Get in touch with Mallu Smart." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-4">Contact Us</h1>
      <div className="grid gap-8 md:grid-cols-2 max-w-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Message sent! We'll get back to you soon.");
          }}
          className="space-y-3"
        >
          <div>
            <Label className="text-xs">Name</Label>
            <Input required placeholder="Your name" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input required type="email" placeholder="you@email.com" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Message</Label>
            <Textarea required placeholder="Your message..." className="text-sm min-h-[80px]" />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground">Send Message</Button>
        </form>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">support@mallusmart.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">+91 9999999999</span>
          </div>
        </div>
      </div>
    </div>
  );
}
