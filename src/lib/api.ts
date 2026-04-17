import { fixImagePath } from "./utils";
import type { Product, Category, Member } from "./data";
import { toast } from "sonner";

// BASE_URL is now /api to utilize the Vite proxy and bypass local CORS restrictions
const BASE_URL = "/api";

// --- Helper Functions ---

function getAuthHeaders(method: string = "GET") {
  let token = localStorage.getItem("adminToken");
  
  // Aggressive Sanitization: trim whitespace/newlines and remove all surrounding quotes
  if (token) {
    token = token.trim().replace(/^["']+|["']+$/g, '');
  }

  const headers: Record<string, string> = {
    "Accept": "application/json, text/plain, */*",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };
  
  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = token;
  }
  
  return headers;
}

async function safeFetch(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

  try {
    console.log(`[API] calling ${url}`, options.method || "GET");
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    console.log(`[API] ${url} -> status ${response.status}`);
    clearTimeout(timeoutId);

    // Only retry on network errors or 500+ server errors
    if (!response.ok && response.status >= 500 && retry) {
      console.warn(`Retrying request to ${url} due to status ${response.status}`);
      return safeFetch(url, options, false);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Retry on genuine network errors (not logic or aborts)
    if (retry && error.name !== 'AbortError') {
      console.warn(`Retrying request to ${url} due to network error`);
      return safeFetch(url, options, false);
    }
    throw error;
  }
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem("adminToken");
    toast.error("Session expired. Please login again.");
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 1500);
    throw new Error("Unauthorized. Redirecting to login...");
  }
  
  // For 500 errors, the body might not be JSON or might be an ASP.NET error page
  if (response.status === 500) {
    const errorText = await response.clone().text().catch(() => "Unknown Server Error");
    const endpoint = response.url.split('/').pop() || "unknown";
    console.error(`Critical Backend Error (500) at ${endpoint}:`, errorText);
    throw new Error(`[${endpoint.toUpperCase()}] Backend Error (500): The server crashed. [Detail: ${errorText.substring(0, 200)}...]`);
  }

  let data;
  const clone = response.clone();
  try {
    data = await response.json();
  } catch (e) {
    data = await clone.text();
    // If it's just a string, return it as is
    return data;
  }

  if (!response.ok || data.success === false) {
    // Check for detailed validation errors
    if (data.errors) {
       const firstError = Object.values(data.errors)[0];
       const detail = Array.isArray(firstError) ? firstError[0] : firstError;
       throw new Error(`Validation Error: ${detail || "Check all fields"}`);
    }
    const errorMsg = data.message || data.error || `API Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  
  return data;
}

// --- Public Product APIs ---

export async function fetchProducts(): Promise<Product[]> {
  try {
    // NOTE: Backend has a typo in this endpoint (Produtcs). Do not "fix" it here.
    const response = await safeFetch(`${BASE_URL}/Product/GetAllProdutcs`);
    const data = await handleResponse(response);

    if (!Array.isArray(data)) {
        throw new Error("API did not return an array of products");
    }

    return data.map((p: any) => ({
      id: (p.id || p.ID)?.toString(),
      name: p.productName || p.ProductName || "N/A",
      price: Number(p.price || p.Price || 0),
      image: fixImagePath(p.image || p.Image),
      category: (p.categoryName || p.CategoryName || "all").toLowerCase().trim().replace(/\s+/g, "-"),
      categoryName: p.categoryName || p.CategoryName || "Uncategorized",
      sellerName: p.memberName || p.MemberName || "Mallu Smart",
      description: p.description || p.Description || "Authentic Kerala handmade product.",
      originalPrice: Number(p.price || p.Price || 0) * 1.25,
      badge: "Authentic",
      quantity: Number(p.quantity || p.Quantity || 0),
      unit: p.unit || p.Unit || "pcs",
      categoryID: Number(p.categoryID || p.CategoryID || 0),
      memberID: Number(p.memberID || p.MemberID || 0),
    })).filter((p: any) => p.id && (p.name !== "N/A"));
  } catch (error) {
    console.error("API Error (Products):", error);
    throw error; 
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await safeFetch(`${BASE_URL}/Product/GetAllCategories`);
    const data = await handleResponse(response);
 
    if (!Array.isArray(data)) {
        throw new Error("API did not return an array of categories");
    }

    return data
      .filter((c: any) => c.name && c.name.toLowerCase() !== "uncategorized")
      .map((c: any) => ({
        id: c.name.toLowerCase().trim().replace(/\s+/g, "-"),
        name: c.name ?? "N/A",
        icon: getCategoryIcon(c.name || ""),
        image: "",
      }));
  } catch (error) {
    console.error("API Error (Categories):", error);
    throw error;
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

// --- Order APIs ---

export interface OrderPayload {
  customerName: string;
  address: string;
  mobile: string;
  email: string;
  createdOn: string;
  orderRef?: string;
  products: { productId: number; quantity: number }[];
}

export async function saveOrder(order: OrderPayload) {
  try {
    const orderRef = order.orderRef || window.crypto?.randomUUID?.() || Date.now().toString();
    
    const backendPayload = {
      customerName: order.customerName,
      address: order.address,
      mobile: order.mobile,
      email: order.email,
      createdOn: order.createdOn || new Date().toISOString(),
      orderRef: orderRef,
      products: (order.products || []).map(p => ({
        productId: Number(p.productId),
        quantity: Number(p.quantity)
      }))
    };

    console.log("Syncing Order:", orderRef);

    const response = await safeFetch(`${BASE_URL}/Product/SaveOrderDetails`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Request-ID": orderRef
      },
      body: JSON.stringify(backendPayload),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (SaveOrder):", error);
    throw error;
  }
}

// --- Admin APIs ---

export async function adminLogin(email: string, password: string): Promise<string> {
  try {
    const response = await safeFetch(`${BASE_URL}/User/GenerateToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    const token = typeof data === 'string' ? data : data.token;
    return (token || "").toString().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("API Error (AdminLogin):", error);
    throw error;
  }
}

// Product CRUD
export async function addOrUpdateProduct(product: Partial<Product>) {
  try {
    // We are using the "product" wrapper and PascalCase keys
    // identified during API probing as the correct structure.
    const payload = {
      product: {
        Id: Number(product.id || 0),
        ProductName: product.name || "",
        Description: product.description || "",
        Price: Number(product.price || 0),
        Quantity: Number(product.quantity || 0),
        Unit: product.unit || "pcs",
        CategoryID: Number(product.categoryID || 0),
        MemberID: Number(product.memberID || 0),
        IsActive: product.isActive ?? true,
        Image: product.image || "", // This field currently blocks the API due to backend type mismatch (IFormFile)
        CreatedOn: product.createdOn || new Date().toISOString(),
        ModifiedOn: new Date().toISOString(),
      }
    };

    const response = await safeFetch(`${BASE_URL}/Product/AddOrUpdateProduct`, {
      method: "POST",
      headers: getAuthHeaders("POST"),
      body: JSON.stringify(payload),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (AddOrUpdateProduct):", error);
    throw error;
  }
}

export async function deleteProduct(productId: number) {
  try {
    const response = await safeFetch(`${BASE_URL}/Product/DeleteProduct`, {
      method: "POST",
      headers: getAuthHeaders("POST"),
      body: JSON.stringify({ ProductId: productId }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (DeleteProduct):", error);
    throw error;
  }
}

// Member CRUD
export async function fetchMembers(): Promise<Member[]> {
  try {
    const response = await safeFetch(`${BASE_URL}/User/GetAllMembers`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    
    return (data || []).map((m: any) => ({
      id: m.id || m.ID || m.memberId || m.MemberId || crypto.randomUUID(),
      name: m.name || m.Name || "N/A",
      email: m.email || m.Email || "No email",
      phone: m.contactNumber || m.ContactNumber || m.phone || m.Phone || "N/A",
      businessName: m.businessName || m.BusinessName || "N/A",
      district: m.district || m.District || "All Kerala",
      joinedDate: m.createdOn || m.CreatedOn || new Date().toISOString()
    }));
  } catch (error) {
    console.error("API Error (Members):", error);
    return [];
  }
}

export async function addOrUpdateMember(member: Partial<Member>) {
  try {
    const payload = {
      ...member,
      id: Number(member.id || 0),
      ownProduct: member.ownProduct ?? true,
      isActive: member.isActive ?? true,
      createdOn: member.createdOn || new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    };

    const response = await safeFetch(`${BASE_URL}/User/AddOrUpdateMember`, {
      method: "POST",
      headers: getAuthHeaders("POST"),
      body: JSON.stringify(payload),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (AddOrUpdateMember):", error);
    throw error;
  }
}

export async function deleteMember(memberId: number) {
  try {
    const response = await safeFetch(`${BASE_URL}/User/DeleteMember`, {
      method: "POST",
      headers: getAuthHeaders("POST"),
      body: JSON.stringify({ MemberId: memberId }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (DeleteMember):", error);
    throw error;
  }
}

// Order Management
export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalPrice: number;
  phone?: string;
  address?: string;
  email?: string;
  products?: { productId: number; quantity: number }[];
  createdOn?: string;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  const response = await safeFetch(`${BASE_URL}/Product/GetAllOrders`, {
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(response);
  
  return (data || []).map((o: any, index: number) => {
    // Robust mapping for actual backend response structure
    return {
      // Backend does not return an ID, so we generate one based on customer and date, or index
      id: (o.id || o.ID || o.orderId || o.OrderId || `ORD-${o.customerName}-${index}`).toString(),
      customerName: o.customerName || "Guest User",
      date: o.createdOn || new Date().toISOString(),
      createdOn: o.createdOn,
      status: (o.status || "pending").toString().toLowerCase() as any,
      // Backend does not currently return a total price, so we default to 0
      totalPrice: Number(o.totalPrice || o.TotalPrice || 0),
      phone: o.mobile || o.phone || "N/A",
      address: o.address || "N/A",
      email: o.email || "N/A",
      products: o.products || [],
    };
  });
}
