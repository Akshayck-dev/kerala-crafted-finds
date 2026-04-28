import { motion } from "framer-motion";

export function WhatsAppButton() {
  const phoneNumber = "919495532563";
  const message = encodeURIComponent("Hi! I'm interested in your products from Mallu’s Mart.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-float"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring */}
      <span className="whatsapp-pulse" />
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        fill="#fff"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.129 6.742 3.047 9.375L1.053 31.27l6.13-1.961A15.908 15.908 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.598c-.39 1.098-1.924 2.01-3.172 2.277-.854.18-1.968.324-5.72-1.23-4.803-1.988-7.893-6.86-8.132-7.18-.228-.32-1.924-2.563-1.924-4.888 0-2.324 1.217-3.467 1.648-3.94.391-.43.913-.58 1.201-.58.152 0 .288.008.41.015.434.016.651.039.937.723.358.854 1.23 3.008 1.338 3.227.11.218.218.514.072.812-.14.304-.262.44-.48.692-.22.253-.426.447-.645.718-.202.238-.43.492-.178.928.253.434 1.124 1.855 2.414 3.006 1.66 1.48 3.058 1.94 3.492 2.154.434.218.69.182.944-.11.26-.294 1.11-1.293 1.406-1.738.29-.44.585-.366.982-.218.402.144 2.546 1.2 2.98 1.42.434.218.723.328.83.508.11.184.11 1.053-.28 2.15z" />
      </svg>
    </motion.a>
  );
}
