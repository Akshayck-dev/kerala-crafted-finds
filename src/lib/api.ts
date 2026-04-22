import { fixImagePath } from "./utils";
import type { Product, Category, Member } from "./data";
import { toast } from "sonner";
import { useLoadingStore } from "./loading-store";

// BASE_URL is set directly to the production domain as requested.
// NOTE: This may require CORS configuration on the backend.
// Use the Vite proxy to avoid CORS issues and standardize headers.
const BASE_URL = "https://mallusmart.com";

console.log("[API] Module loaded. Version: 1.0.2 - PASCAL_CASE_VALIDATION");

// --- Helper Functions ---

function getAuthHeaders(method: string = "GET", includeContentType: boolean = true) {
  let token = localStorage.getItem("adminToken");
  
  if (token) {
    token = token.toString().trim().replace(/^"|"$/g, '');
  }

  const isInvalidToken = !token || 
                         token === "null" || 
                         token === "undefined" || 
                         token === "[object Object]" ||
                         token.length < 5;
  
  const headers: Record<string, string> = {
    "Accept": "application/json"
  };
  
  if (includeContentType && method !== "GET" && method !== "DELETE") {
    headers["Content-Type"] = "application/json";
  }
  
  if (!isInvalidToken) {
    // Backend accepts both raw and Bearer, standardize on Bearer
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  
  return headers;
}

async function safeFetch(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const { startLoading, stopLoading } = useLoadingStore.getState();
  startLoading();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

  const method = options.method || 'GET';
  console.log(`[API] calling ${url} ${method}`);
  
  // Debug headers
  const authHeader = (options.headers as Record<string, string>)?.['Authorization'];
  if (authHeader) {
    console.log(`[AUTH] Header present: ${authHeader.substring(0, 15)}... [Length: ${authHeader.length}]`);
    if (authHeader.includes('undefined') || authHeader.includes('null') || authHeader.includes('[object')) {
      console.warn(`[AUTH] SUSPICIOUS HEADER DETECTED: ${authHeader}`);
    }
  } else {
    console.log(`[AUTH] No Authorization header sent.`);
  }

    const finalHeaders: Record<string, string> = {
      ...getAuthHeaders(method),
      ...(options.headers as Record<string, string>),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // CRITICAL: If body is FormData (e.g. AddOrUpdateProduct), we MUST NOT set Content-Type.
    // The browser must set it automatically to include the boundary string, otherwise 415 error occurs.
    if (options.body instanceof FormData) {
      delete finalHeaders['Content-Type'];
      console.log(`[API] FormData detected for ${url}. Stripping manual Content-Type header.`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
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
  } finally {
    stopLoading();
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
    
    // Log the error but do NOT purge the token on 500. 
    // Purging should only happen on 401 Unauthorized to avoid frustrating logouts during backend instability.
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
    const errorMsg = data.message || data.error || (typeof data === 'string' ? data : null) || `API Request failed with status ${response.status}`;
    console.error(`[API ERROR] Status: ${response.status} | Message: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  return data;
}

// --- Public Product APIs ---

export async function fetchProducts(onlyActive: boolean = true): Promise<Product[]> {
  try {
    // Added timestamp to bust any browser/proxy caches
    const response = await safeFetch(`${BASE_URL}/Product/GetAllProdutcs?t=${Date.now()}`, {
        headers: getAuthHeaders("GET", false)
    });
    const data = await handleResponse(response);

    if (!Array.isArray(data)) {
        throw new Error("API did not return an array of products");
    }

    return data.map((p: any, index: number) => {
      // Robust ID mapping: check for all backend variations
      const rawId = p.productId || p.ProductId || p.ProductID || p.productID || p.id || p.ID || p.Id || `AUTO-${index}`;
      
      return {
        id: rawId.toString(),
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
        isActive: p.isActive ?? p.IsActive ?? true,
      };
    }).filter((p: any) => p.id && (p.name !== "N/A") && (!onlyActive || p.isActive !== false))
       .sort((a: any, b: any) => {
         const idA = parseInt(a.id);
         const idB = parseInt(b.id);
         if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
         return b.id.localeCompare(a.id); // Fallback for string IDs
       });
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
      .map((c: any, index: number) => {
        // IMPORTANT: The original API omits IDs in the category list but expects numeric IDs (1, 2, 3...) for saves.
        // We use (index + 1) to reconstruct those missing IDs based on the server's list order.
        const dbId = (index + 1).toString();
        
        return {
          id: dbId,
          name: c.name ?? "N/A",
          slug: (c.name || "category").toLowerCase().trim().replace(/\s+/g, "-"),
          icon: getCategoryIcon(c.name || ""),
          image: "",
        };
      })
      .filter((c) => c.name.toLowerCase() !== "uncategorized");
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
    
    if (!token) throw new Error("No token received from login API");
    
    // Clean and return the token
    return token.toString().trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("API Error (AdminLogin):", error);
    throw error;
  }
}

export async function addOrUpdateProduct(product: Partial<Product>, imageFile?: File | null) {
  try {
    const finalId = Number(product.id || 0);
    const now = new Date().toISOString(); // Full ISO string to match Member API

    const formData = new FormData();
    
    // Core fields with exhaustive casing for model binding resilience
    formData.append("ProductID", finalId.toString());
    formData.append("id", finalId.toString());
    formData.append("Id", finalId.toString());
    
    formData.append("MemberID", (product.memberID || 1).toString());
    formData.append("CategoryID", (product.categoryID || 0).toString());
    formData.append("ProductName", product.name || "");
    formData.append("Description", product.description || "");
    formData.append("ProductDescription", product.description || ""); // Redundant key
    formData.append("Price", (product.price || 0).toString());
    formData.append("Quantity", (product.quantity || 0).toString());
    formData.append("IsActive", (product.isActive !== false).toString());
    formData.append("Unit", product.unit || "pcs");
    formData.append("CreatedOn", now);
    formData.append("ModifiedOn", now);

    // Image handling: Send file in both common keys
    if (imageFile) {
        formData.append("NewImage", imageFile);
        formData.append("Image", imageFile); // Some backends use 'Image' for the file itself
        console.log(`[API] Attaching new image file under 'NewImage' and 'Image': ${imageFile.name}`);
    } else {
        formData.append("Image", product.image || "");
    }

    console.log("[API] AddOrUpdateProduct FormData Payload:");
    formData.forEach((value, key) => {
      if (typeof value === 'string') console.log(`  ${key}: ${value}`);
      else console.log(`  ${key}: [File: ${value.name}]`);
    });

    const headers = getAuthHeaders("POST", false);
    console.log(`[API] calling ${BASE_URL}/Product/AddOrUpdateProduct POST`);
    const response = await safeFetch(`${BASE_URL}/Product/AddOrUpdateProduct`, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await handleResponse(response);
    return result;

  } catch (error) {
    console.error("API Error (AddOrUpdateProduct):", error);
    throw error;
  }
}

export async function deleteProduct(productId: number) {
  try {
    // Backend requires ProductId in BOTH query string and JSON body for POST
    const response = await safeFetch(`${BASE_URL}/Product/DeleteProduct?ProductId=${productId}`, {
      method: "POST",
      headers: getAuthHeaders("POST", true),
      body: JSON.stringify({ ProductId: productId }),
    });
    
    // Add a slightly longer delay to ensure the database soft-delete is indexed before refresh
    if (response.ok) {
        await new Promise(r => setTimeout(r, 1200));
    }
    
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (DeleteProduct):", error);
    throw error;
  }
}

// Member CRUD
export async function fetchMembers(): Promise<Member[]> {
  try {
    // Added timestamp to bust any browser/proxy caches
    const response = await safeFetch(`${BASE_URL}/User/GetAllMembers?t=${Date.now()}`, {
      headers: getAuthHeaders("GET", false),
    });
    console.log(`[API] GetAllMembers Response Status: ${response.status} ${response.statusText}`);
    const data = await handleResponse(response);
    if (Array.isArray(data) && data.length > 0) {
      console.log("[API] First Member Keys:", Object.keys(data[0]));
      console.log("[API] First Member Data:", data[0]);
    }
    
    return (Array.isArray(data) ? data : []).map((m: any, index: number) => ({
      // Handle various backend casing for Member ID and provide index fallback
      id: (m.id || m.ID || m.memberId || m.MemberId || m.memberID || m.MemberID || m.Id || (index + 1)).toString(),
      name: m.name || m.Name || "N/A",
      email: m.email || m.Email || "No email",
      phone: m.contactNumber || m.ContactNumber || m.phone || m.Phone || "N/A",
      contactNumber: m.contactNumber || m.ContactNumber || "N/A",
      businessName: m.businessName || m.BusinessName || "N/A",
      district: m.district || m.District || "All Kerala",
      place: m.place || m.Place || "",
      product: m.product || m.Product || "",
      licenceNumber: m.licenceNumber || m.LicenceNumber || "NA",
      ownProduct: m.ownProduct ?? m.OwnProduct ?? true,
      isActive: m.isActive ?? m.IsActive ?? true,
      joinedDate: m.createdOn || m.CreatedOn || new Date().toISOString(),
      modifiedOn: m.modifiedOn || m.ModifiedOn || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("API Error (Members):", error);
    return [];
  }
}

export async function addOrUpdateMember(member: Partial<Member>) {
  try {
    const finalId = Number(member.id || 0);
    
    // Reverting to JSON as FormData returned 415 Unsupported Media Type
    // Adding both casing for ID to be safe
    const payload = {
      id: finalId,
      Id: finalId,
      MemberId: finalId,
      MemberID: finalId,
      Name: String(member.name || ""),
      BusinessName: String(member.businessName || ""),
      Place: String(member.place || ""),
      District: String(member.district || "Ernakulam"),
      Product: String(member.product || ""),
      ContactNumber: String(member.phone || member.contactNumber || ""),
      LicenceNumber: String(member.licenceNumber || "NA"),
      OwnProduct: member.ownProduct ?? true,
      IsActive: member.isActive ?? true,
      CreatedOn: member.joinedDate || member.createdOn || new Date().toISOString(),
    };

    console.log("[API] AddOrUpdateMember (JSON) Payload:", payload);

    const response = await safeFetch(`${BASE_URL}/User/AddOrUpdateMember`, {
      method: "POST",
      headers: getAuthHeaders("POST", true), // application/json
      body: JSON.stringify(payload),
    });
    
    console.log(`[API] AddOrUpdateMember Response Status: ${response.status} ${response.statusText}`);
    const result = await handleResponse(response);
    console.log("[API] AddOrUpdateMember Result Body:", result);
    return result;
  } catch (error) {
    console.error("API Error (AddOrUpdateMember):", error);
    throw error;
  }
}


export async function deleteMember(memberId: number) {
  try {
    console.log(`[API] Deleting Member ID: ${memberId}`);
    
    // Aligning with DeleteProduct pattern: POST with query param, no body
    const response = await safeFetch(`${BASE_URL}/User/DeleteMember?id=${memberId}&memberId=${memberId}&MemberId=${memberId}`, {
      method: "POST",
      headers: getAuthHeaders("POST"), // No JSON body needed
    });
    
    console.log(`[API] DeleteMember Response Status: ${response.status} ${response.statusText}`);
    
    // Add a short delay to ensure the backend database/index is updated before the refresh happens
    if (response.ok) {
        await new Promise(r => setTimeout(r, 1500));
    }

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
  try {
    // Phase 1: Fetch products to get prices (orders don't include them)
    let productPriceMap: Record<string, number> = {};
    try {
      const products = await fetchProducts(false);
      productPriceMap = products.reduce((acc, p) => {
        acc[p.id.toString()] = p.price;
        return acc;
      }, {} as Record<string, number>);
    } catch (e) {
      console.warn("[API] Could not fetch products for order price calculation:", e);
    }

    const response = await safeFetch(`${BASE_URL}/Product/GetAllOrders`, {
      headers: getAuthHeaders("GET", false),
    });
    const data = await handleResponse(response);
    
    return (data || []).map((o: any, index: number) => {
      const rawDate = o.createdOn || o.CreatedOn || o.date || o.Date || new Date().toISOString();
      const rawProducts = o.products || o.Products || [];
      
      // Calculate total price from product lookup
      let calculatedTotal = 0;
      rawProducts.forEach((item: any) => {
          const pid = (item.productId || item.ProductId || item.ProductID || item.productID || item.id || item.ID || "").toString();
          const price = productPriceMap[pid] || 0;
          const qty = Number(item.quantity || item.Quantity || 1); // Default to 1 if null
          calculatedTotal += price * qty;
      });

      return {
        id: (o.id || o.ID || o.orderId || o.OrderId || o.OrderID || o.orderID || (index + 1)).toString(),
        customerName: o.customerName || o.CustomerName || "Guest User",
        date: rawDate,
        createdOn: rawDate,
        status: (o.status || o.Status || "pending").toString().toLowerCase() as any,
        totalPrice: calculatedTotal > 0 ? calculatedTotal : Number(o.totalPrice || o.TotalPrice || 0),
        phone: o.mobile || o.Mobile || o.phone || o.Phone || "N/A",
        address: o.address || o.Address || "N/A",
        email: o.email || o.Email || "N/A",
        products: rawProducts,
      };
    }).sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("API Error (Orders):", error);
    return [];
  }
}


export async function changePassword(newPassword: string) {
  try {
    const response = await safeFetch(`${BASE_URL}/User/ChangePassword?Password=${encodeURIComponent(newPassword)}`, {
      method: "POST",
      headers: getAuthHeaders("POST", false),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("API Error (ChangePassword):", error);
    throw error;
  }
}

