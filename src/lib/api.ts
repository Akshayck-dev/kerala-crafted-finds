import { fixImagePath } from "./utils";
import type { Product, Category } from "./data";

const BASE_URL = "https://mallusmart.com";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/Product/GetAllProdutcs`);
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    
    // Log API response for debugging as requested
    console.log("API Response (Raw Products):", data);

    // Defensive mapping with direct field names from actual API response
    return (data || []).map((p: any) => ({
      id: p.id?.toString(),
      name: p.productName,
      price: Number(p.price),
      image: fixImagePath(p.image),
      category: p.categoryName ? p.categoryName.toLowerCase().trim().replace(/\s+/g, "-") : "all",
      categoryName: p.categoryName,
      sellerName: p.memberName,
      description: p.description || "Authentic Kerala handmade product.",
      originalPrice: Number(p.price) * 1.25,
      badge: "Pure Registry",
    })).filter((p: any) => p.id && p.name); // Ensure fields exist before rendering
  } catch (error) {
    console.error("API Error (Products):", error);
    return [];
  }
}

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("fashion") || n.includes("dress") || n.includes("jewellery")) return "💍";
  if (n.includes("kitchen") || n.includes("food") || n.includes("spice")) return "🍛";
  if (n.includes("natural") || n.includes("care") || n.includes("cosmetic") || n.includes("cleaning")) return "🌿";
  if (n.includes("gift") || n.includes("collection")) return "🎁";
  if (n.includes("kids") || n.includes("toy")) return "🧸";
  if (n.includes("organic") || n.includes("oil")) return "🥥";
  if (n.includes("handmade") || n.includes("craft")) return "🧶";
  return "📦";
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${BASE_URL}/Product/GetAllCategories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();
    
    // Log API response for debugging
    console.log("API Response (Raw Categories):", data);
 
    // Use name as the primary label
    return (data || [])
      .filter((c: any) => c.name && c.name.toLowerCase() !== "uncategorized")
      .map((c: any) => ({
        id: c.name.toLowerCase().trim().replace(/\s+/g, "-"),
        name: c.name,
        icon: getCategoryIcon(c.name),
        image: "",
      }));
  } catch (error) {
    console.error("API Error (Categories):", error);
    return [];
  }
}

export interface OrderPayload {
  customerName: string;
  address: string;
  mobile: string;
  email: string;
  createdOn: string;
  products: { productId: number; quantity: number }[];
}

export async function saveOrder(order: OrderPayload) {
  try {
    console.log("Submitting Order Payload:", order);
    const response = await fetch(`${BASE_URL}/Product/SaveOrderDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to save order");
    }
    
    const result = await response.json();
    console.log("Order Submission Result:", result);
    return result;
  } catch (error) {
    console.error("API Error (SaveOrder):", error);
    throw error;
  }
}

// ---------------- Admin API Methods ----------------

export async function adminLogin(email: string, password: string):Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/User/GenerateToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Login failed");
    }

    const data = await response.json();
    return data.token || data; // Handle depending on if they return raw token or wrapper object
  } catch (error) {
    console.error("API Error (AdminLogin):", error);
    throw error;
  }
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate?: string;
}

export async function fetchMembers(token: string): Promise<Member[]> {
  try {
    const response = await fetch(`${BASE_URL}/User/GetAllMembers`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch members");
    const data = await response.json();
    
    return (data || []).map((m: any) => ({
      id: m.id || m.memberId || crypto.randomUUID(),
      name: m.name || m.userName || "Unknown",
      email: m.email || "No email",
      phone: m.phone || m.mobile || "-",
      joinedDate: m.createdOn || new Date().toISOString()
    }));
  } catch (error) {
    console.error("API Error (Members):", error);
    return [];
  }
}

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
}

export async function fetchOrders(token: string): Promise<AdminOrder[]> {
  try {
    const response = await fetch(`${BASE_URL}/Product/GetAllOrders`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      // If endpoint doesn't exist, throw to fallback to mock data
      throw new Error("Failed to fetch orders");
    }
    const data = await response.json();
    
    return (data || []).map((o: any) => ({
      id: o.id || o.orderId || crypto.randomUUID(),
      customerName: o.customerName || "Unknown",
      date: o.createdOn || o.orderDate || new Date().toISOString(),
      status: o.status ? o.status.toLowerCase() : "pending",
      total: Number(o.total || o.totalAmount || 0)
    }));
  } catch (error) {
    console.warn("API Warning (Orders fallback): Using mocked orders due to error.", error);
    // Mock Data Fallback
    const { MOCK_ORDERS } = await import("./mock-orders");
    return MOCK_ORDERS;
  }
}
