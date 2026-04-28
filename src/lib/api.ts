import { fixImagePath } from "./utils";
import type { Product, Category, Member } from "./data";
import { toast } from "sonner";
import { useLoadingStore } from "./loading-store";

export const BASE_URL = "/api";
export const CACHE_BUSTER = "FORCE_UPDATE_v10_4_" + Date.now();
console.log(`[API] Cache Buster Active: ${CACHE_BUSTER} | Base: ${BASE_URL}`);

console.log("[API] Module loaded. Version: 1.0.4 - PROXY_AWARE");

// --- Helper Functions ---

function getAuthToken() {
  if (typeof window === 'undefined') return "";
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
  return token.toString().trim().replace(/^"|"$/g, '');
}

/**
 * Standardized header generator for API requests.
 * Ensures the token is always cleaned and Bearer is correctly formatted.
 */
function getAuthHeaders(method: string = "GET", isJson: boolean = true) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  if (token && token.length > 10) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isJson && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

function startLoading() {
  useLoadingStore.getState().startLoading();
}

function stopLoading() {
  useLoadingStore.getState().stopLoading();
}

/**
 * Robust wrapper for fetch to handle auth headers, error logging, and FormData requirements.
 */
async function safeFetch(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
  startLoading();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s for large image uploads

  const method = options.method || 'GET';
  const token = getAuthToken();

  console.log(`[API] calling ${url} ${method}`);

  const finalHeaders: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  if (token && token.length > 10) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
    console.log(`[AUTH] Header present: Bearer ${token.substring(0, 10)}... [Length: ${token.length}]`);
  } else {
    console.warn(`[AUTH] WARNING: No valid token found for ${url}!`);
  }

  // CRITICAL: If body is FormData (e.g. AddOrUpdateProduct), we MUST NOT set Content-Type.
  // The browser must set it automatically to include the boundary string, otherwise 415 error occurs.
  if (options.body instanceof FormData) {
    delete finalHeaders['Content-Type'];
    console.log(`[API] FormData detected for ${url}. Stripping manual Content-Type header.`);
  } else if (!finalHeaders['Content-Type'] && method !== 'GET') {
    finalHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      signal: controller.signal,
    });

    console.log(`[API] ${url} -> status ${response.status} (${response.statusText})`);
    if (response.status !== 200) {
        const clone = response.clone();
        const text = await clone.text().catch(() => "N/A");
        console.warn(`[API] Error Body for ${url}:`, text.substring(0, 500));
    }
    clearTimeout(timeoutId);

    if (!response.ok && response.status >= 500 && retry) {
      console.warn(`Retrying request to ${url} due to status ${response.status}`);
      return safeFetch(url, options, false);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
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
    console.log(`[API] Parsed JSON response for ${response.url.split('/').pop()}:`, data);
  } catch (e) {
    data = await clone.text();
    console.log(`[API] Parsed TEXT response for ${response.url.split('/').pop()}:`, data.substring(0, 100));
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

    if (data.length > 0) {
      console.log("[API] First Raw Product Data:", data[0]);
    }

    return data.map((p: any, index: number) => {
      // Robust ID mapping: check for all backend variations
      const rawId = p.productId || p.ProductId || p.ProductID || p.productID || p.id || p.ID || p.Id || `AUTO-${index}`;

      return {
        id: rawId.toString(),
        name: p.productName || p.ProductName || "N/A",
        price: Number(p.price || p.Price || 0),
        image: fixImagePath(p.image || p.Image || (Array.isArray(p.images || p.Images) && (p.images || p.Images).length > 0 ? (p.images || p.Images)[0] : null)),
        images: (Array.isArray(p.images || p.Images || p.otherImages || p.OtherImages)
          ? (p.images || p.Images || p.otherImages || p.OtherImages)
          : []).map((img: any) => fixImagePath(img)),
        category: (p.categoryName || p.CategoryName || "all").toLowerCase().trim().replace(/\s+/g, "-"),
        categoryName: p.categoryName || p.CategoryName || "Uncategorized",
        sellerName: p.memberName || p.MemberName || "Mallu’s Mart",
        businessName: p.businessName || p.BusinessName || "",
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
    const response = await safeFetch(`${BASE_URL}/Product/GetAllCategories`, {
      headers: getAuthHeaders("GET", false),
    });
    const data = await handleResponse(response);
    console.log("[API] GetAllCategories Raw Data (First Item):", data[0]);

    return (Array.isArray(data) ? data : []).map((c: any, index: number) => ({
      // Prioritize actual database IDs from the backend
      id: (c.categoryID || c.CategoryID || c.id || c.ID || (index + 1)).toString(),
      name: c.categoryName || c.name || "N/A",
      slug: (c.categoryName || c.name || "category").toLowerCase().trim().replace(/\s+/g, "-"),
      icon: getCategoryIcon(c.categoryName || c.name || ""),
      image: c.image || "",
    }));
  } catch (error) {
    console.error("API Error (FetchCategories):", error);
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

// Helper to convert URL to File object for backend IFormFile compatibility
export async function urlToFile(url: string, filename: string = "image.jpg"): Promise<File> {
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export async function addOrUpdateProduct(product: any, imageFile?: File | null, otherImages: File[] = []) {
  const productId = Number(product.id || 0);
  const isUpdate = productId > 0;
  console.log(`[API] VERSION 10.0 - FULL | Mode: ${isUpdate ? "UPDATE" : "ADD"} | id=${productId}`);

  try {
    const formData = new FormData();
    const now = new Date().toISOString();

    // 1. Core Fields Mapping (Aligned with Postman collection)
    formData.append("id", productId.toString());
    formData.append("MemberID", (product.memberID || 1).toString());
    formData.append("CategoryID", (product.categoryID || 1).toString());
    formData.append("ProductName", product.name || product.productName || "");
    formData.append("Description", product.description || "");
    formData.append("Price", Number(product.price || 0).toString());
    formData.append("Quantity", Number(product.quantity || 0).toString());
    formData.append("Unit", product.unit || "pcs");
    formData.append("IsActive", (product.isActive ?? true).toString());
    formData.append("CreatedOn", product.createdOn || now);
    formData.append("ModifiedOn", now);

    // 2. 🔥 IMAGE LOGIC (Updated per Postman & Request)
    // Only send if a NEW file is selected. Otherwise pass empty/null as requested.
    
    if (imageFile) {
      console.log("[IMAGE] Main → Appending new file to 'MainProductImage'");
      formData.append("MainProductImage", imageFile);
    } else {
      console.log("[IMAGE] Main → No change, skipping 'MainProductImage'");
      // Optionally append empty string if backend requires the key to exist
      // formData.append("MainProductImage", ""); 
    }

    if (otherImages && otherImages.length > 0) {
      console.log(`[IMAGE] Gallery → Appending ${otherImages.length} files to 'ProductGalleryImage'`);
      otherImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("ProductGalleryImage", file);
        }
      });
    } else {
      console.log("[IMAGE] Gallery → No change, skipping 'ProductGalleryImage'");
    }

    // 3. 🔍 Debug: Verify EXACT FormData keys before sending
    const token = typeof window !== 'undefined' ? (localStorage.getItem("adminToken") || "").replace(/^"|"$/g, '') : "";
    console.log(`--- FINAL FormData Payload (Postman Sync) ---`);
    for (let pair of (formData as any).entries()) {
      const val = pair[1];
      console.log(`  ${pair[0]}:`, val instanceof File ? `File(${val.name}, ${val.size}b)` : val);
    }
    console.log("--------------------------------------");

    const url = `${BASE_URL}/Product/AddOrUpdateProduct`;
    const response = await safeFetch(url, {
      method: "POST",
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await handleResponse(response);
    console.log("[API] Success (v10.1):", data);
    return data;
  } catch (error: any) {
    console.error("[API] Error (v10.1):", error.message);
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
    const response = await safeFetch(`${BASE_URL}/User/GetAllMembers`, {
      headers: getAuthHeaders("GET", false),
    });
    const data = await handleResponse(response);
    console.log("[API] GetAllMembers Full Raw Data:", data);

    return (Array.isArray(data) ? data : []).map((m: any, index: number) => {
      const mid = (m.memberID || m.MemberID || m.memberId || m.MemberId || m.id || m.ID || (index + 1)).toString();

      // More robust isActive detection
      const rawActive = m.isActive ?? m.IsActive ?? m.active ?? m.Active ?? true;
      let isActiveValue = true;
      if (typeof rawActive === "boolean") isActiveValue = rawActive;
      else if (typeof rawActive === "number") isActiveValue = rawActive === 1;
      else if (typeof rawActive === "string") isActiveValue = rawActive.toLowerCase() === "true";

      return {
        id: mid,
        name: m.name || m.Name || "N/A",
        email: m.email || m.Email || m.mail || m.Mail || m.emailID || m.EmailID || m.emailAddress || m.EmailAddress || "No email",
        phone: m.contactNumber || m.ContactNumber || m.phone || m.Phone || "N/A",
        contactNumber: m.contactNumber || m.ContactNumber || "N/A",
        businessName: m.businessName || m.BusinessName || "N/A",
        district: m.district || m.District || "All Kerala",
        place: m.place || m.Place || "",
        product: m.product || m.Product || "",
        licenceNumber: m.licenceNumber || m.LicenceNumber || "NA",
        ownProduct: m.ownProduct ?? m.OwnProduct ?? true,
        isActive: isActiveValue,
        joinedDate: m.createdOn || m.CreatedOn || m.joinedDate || m.JoinedDate || new Date().toISOString(),
        modifiedOn: m.modifiedOn || m.ModifiedOn || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("API Error (Members):", error);
    return [];
  }
}

export async function addOrUpdateMember(member: Partial<Member>) {
  try {
    const finalId = Number(member.id || 0);
    const emailStr = String(member.email || "");
    const activeStatus = member.isActive ?? true;

    // Payload with multiple casing and variations to satisfy backend model binding
    const payload = {
      id: finalId,
      Id: finalId,
      MemberId: finalId,
      MemberID: finalId,
      Name: String(member.name || ""),
      Email: emailStr,
      Mail: emailStr,
      email: emailStr,
      mail: emailStr,
      EmailId: emailStr,
      EmailID: emailStr,
      EmailAddress: emailStr,
      emailAddress: emailStr,
      BusinessName: String(member.businessName || ""),
      Place: String(member.place || ""),
      District: String(member.district || "Ernakulam"),
      Product: String(member.product || ""),
      ContactNumber: String(member.phone || member.contactNumber || ""),
      LicenceNumber: String(member.licenceNumber || "NA"),
      OwnProduct: member.ownProduct ?? true,
      IsActive: activeStatus,
      isActive: activeStatus,
      Active: activeStatus,
      CreatedOn: member.joinedDate || member.createdOn || new Date().toISOString(),
    };

    console.log("[API] AddOrUpdateMember Payload:", payload);

    // Reverting to clean URL as query params might be confusing the backend into a delete/error state
    const url = `${BASE_URL}/User/AddOrUpdateMember`;

    const response = await safeFetch(url, {
      method: "POST",
      headers: getAuthHeaders("POST", true), // application/json
      body: JSON.stringify(payload),
    });

    console.log(`[API] AddOrUpdateMember Status: ${response.status}`);
    const result = await handleResponse(response);
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

