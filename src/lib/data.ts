export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  categoryName?: string;
  description: string;
  badge?: string;
  artisan?: string;
  sellerName?: string;
  sellerAvatar?: string;
  ingredients?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export const categories: Category[] = [
  { id: "traditional-food", name: "Traditional Food", icon: "🍛", image: "" },
  { id: "handmade", name: "Handmade Products", icon: "🧶", image: "" },
  { id: "natural-care", name: "Natural Care", icon: "🌿", image: "" },
  { id: "gifts", name: "Gifts", icon: "🎁", image: "" },
  { id: "kids-zone", name: "Kids Zone", icon: "🧸", image: "" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Kerala Banana Chips",
    price: 199,
    originalPrice: 299,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527e3cfd?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=300&fit=crop",
    ],
    category: "traditional-food",
    description: "Crispy banana chips made with traditional Kerala recipe using coconut oil. A perfect snack for any time of the day.",
    badge: "Bestseller",
    artisan: "Sreeja G Nair",
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sreeja",
    ingredients: "RAW BANANA, COCONUT OIL, TURMERIC POWDER, SALT",
  },
  {
    id: "2",
    name: "Organic Coconut Oil",
    price: 349,
    originalPrice: 449,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=300&h=300&fit=crop",
    ],
    category: "natural-care",
    description: "Pure cold-pressed virgin coconut oil from Kerala. Rich in nutrients and perfect for cooking, hair and skin care.",
    badge: "Organic",
    artisan: "K. R. Madhavan",
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madhavan",
    ingredients: "100% PURE KERALA COCONUTS",
  },
  {
    id: "3",
    name: "Handloom Kasavu Saree",
    price: 2499,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop",
    category: "handmade",
    description: "Traditional Kerala kasavu saree handwoven by skilled artisans. Perfect for festivals and special occasions.",
    badge: "Handmade",
  },
  {
    id: "4",
    name: "Spice Gift Box",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=300&h=300&fit=crop",
    ],
    category: "gifts",
    description: "A curated gift box featuring authentic Kerala spices including cardamom, pepper, cinnamon and cloves.",
  },
  {
    id: "5",
    name: "Wooden Toy Elephant",
    price: 399,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop",
    category: "kids-zone",
    description: "Hand-carved wooden toy elephant made by traditional artisans. Safe, eco-friendly and beautifully crafted.",
    badge: "Eco-friendly",
  },
  {
    id: "6",
    name: "Kerala Halwa",
    price: 249,
    originalPrice: 349,
    image: "https://images.unsplash.com/photo-1589249397414-9ef05fbd4f89?w=300&h=300&fit=crop",
    category: "traditional-food",
    description: "Authentic Kozhikodan halwa made from rice flour, coconut milk and cashew nuts.",
    badge: "Popular",
  },
  {
    id: "7",
    name: "Ayurvedic Hair Oil",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=300&fit=crop",
    category: "natural-care",
    description: "Traditional ayurvedic hair oil made with natural herbs and coconut oil for healthy, strong hair.",
  },
  {
    id: "8",
    name: "Coir Door Mat",
    price: 499,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop",
    category: "handmade",
    description: "Eco-friendly coir doormat handcrafted in Kerala. Durable, natural and adds a traditional touch to your home.",
  },
  {
    id: "9",
    name: "Kerala Coffee Powder",
    price: 179,
    originalPrice: 229,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop",
    category: "traditional-food",
    description: "Freshly roasted and ground coffee from the hills of Wayanad. Rich aroma and authentic taste.",
  },
  {
    id: "10",
    name: "Bamboo Craft Set",
    price: 899,
    image: "https://images.unsplash.com/photo-1567225591450-06036b3392a6?w=300&h=300&fit=crop",
    category: "gifts",
    description: "Beautiful bamboo craft set featuring traditional Kerala designs. A perfect gift for art lovers.",
    badge: "Limited",
  },
];
