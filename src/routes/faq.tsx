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
  { q: "What is Mallu Smart?", a: "Mallu Smart is a platform where local people sell their products directly to customers. We support small businesses, home makers, and artisans by helping them reach more customers." },
  { q: "How can I place an order?", a: "Simply browse our collection, add items to your cart, and proceed to checkout. We also offer a direct order option via WhatsApp for your convenience." },
  { q: "Are products authentic?", a: "Yes, every product here is real, local, and made with care by authentic artisans and local sellers from Kerala." },
  { q: "Can I become a seller?", a: "Definitely! We are built for local sellers. You can join our registry and start selling your handcrafted or natural products directly to customers." },
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
