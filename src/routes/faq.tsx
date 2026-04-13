import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Mallu Smart" },
      { name: "description", content: "Frequently asked questions about Mallu Smart." },
      { property: "og:title", content: "FAQ — Mallu Smart" },
      { property: "og:description", content: "Frequently asked questions." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  { q: "What is Mallu Smart?", a: "Mallu Smart is an online marketplace dedicated to authentic Kerala products — handmade, natural and traditional items sourced directly from local artisans." },
  { q: "How can I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. Fill in your details and confirm your order. You can also order via WhatsApp from any product page." },
  { q: "Do you support WhatsApp orders?", a: "Yes! Every product page has an 'Order via WhatsApp' button that lets you place an order directly through WhatsApp." },
  { q: "Are products authentic?", a: "Absolutely. All products are sourced directly from verified local artisans and sellers in Kerala. We ensure quality and authenticity." },
  { q: "How long is delivery?", a: "Delivery typically takes 5–7 business days depending on your location. We'll keep you updated with tracking information." },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
      <div className="max-w-2xl">
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
