import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mallu Smart" },
      { name: "description", content: "Learn about Mallu Smart's mission to bring authentic Kerala products to you." },
      { property: "og:title", content: "About — Mallu Smart" },
      { property: "og:description", content: "Learn about Mallu Smart's mission." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-4">About Mallu Smart</h1>
      <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          Mallu Smart is a platform dedicated to bringing authentic Kerala products directly from local artisans to customers. Our mission is to support small businesses and deliver high-quality handmade, natural, and traditional items across India.
        </p>
        <p>
          We believe in preserving Kerala's heritage by connecting local creators with modern buyers.
        </p>
      </div>
    </div>
  );
}
