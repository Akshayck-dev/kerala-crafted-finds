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
      { title: "FAQ — Mallu’s Mart" },
      { name: "description", content: "Frequently asked questions about Mallu’s Mart and our homepreneur mission." },
      { property: "og:title", content: "FAQ — Mallu’s Mart" },
      { property: "og:description", content: "Frequently asked questions." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  { q: "What is Mallu’s Mart?", a: "Mallu’s Mart is Kerala's first website dedicated exclusively to products created by homepreneurs. We bring together traditional foods, handmade crafts, and unique clothing made by talented entrepreneurs from their homes." },
  { q: "How can I place an order?", a: "Browse our collection, add items to your cart, and checkout. Every product carries a story and the spirit of Kerala." },
  { q: "Are products authentic?", a: "Absolutely. Every product is lovingly made by homepreneurs from their homes, ensuring 100% authenticity and local quality." },
  { q: "Can I become a seller?", a: "Yes! If you are a homepreneur from Kerala, we offer you a 'Home to Horizon' opportunity. Join us to take your authentic creations to the world." },
];

import { motion } from "framer-motion";

function FaqPage() {
  return (
    <div className="pb-24">
      <div className="section-padding">
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.4em] text-[#B68D40] uppercase">
                Support Archive ——
             </span>
             <div className="h-[1px] flex-1 bg-[#B68D40]/20" />
          </div>
          <h1 className="fluid-heading-2 font-black italic tracking-tighter uppercase text-foreground">
            Got Questions?
          </h1>
        </div>

        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <AccordionItem value={`item-${i}`} className="rounded-[2rem] border border-border/50 bg-card/40 px-6 transition-colors hover:bg-card/80">
                  <AccordionTrigger className="py-6 text-base font-black italic tracking-tight uppercase hover:no-underline">
                      {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-lg font-medium leading-relaxed text-muted-foreground/80">
                      {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
