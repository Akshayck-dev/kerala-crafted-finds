import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixImagePath(path?: string | null) {
  const fallback = "https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image";
  
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback;
  }
  
  const trimmedPath = path.trim();
  
  // If it's a blob URL (for previews), return it as is
  if (trimmedPath.startsWith('blob:')) {
    return trimmedPath;
  }

  // If it's a full URL to mallusmart, convert it to use our local /api proxy
  if (trimmedPath.includes("mallusmart.com")) {
    const relativePath = trimmedPath.split("mallusmart.com").pop()?.replace(/^\/+/, '') || "";
    // Avoid double /api prefix if the relative path already starts with api/
    const finalPath = relativePath.startsWith('api/') ? relativePath : `api/${relativePath}`;
    return `/${finalPath.replace(/^\/+/, '')}`;
  }
  
  // If already absolute URL (other than mallusmart)
  if (trimmedPath.startsWith("http")) {
    return trimmedPath;
  }
  
  // If it already starts with /api/, return it as is
  if (trimmedPath.startsWith("/api/")) {
    return trimmedPath;
  }
  
  // Clean the path (remove leading slashes to prevent double slashes)
  const cleanPath = trimmedPath.replace(/^\/+/, '');
  
  // Return the path via the proxy to avoid CORS/401 issues
  const fixed = `/api/${cleanPath}`;
  
  // Console logging removed for production, but kept here for debugging if needed
  // console.log(`[UTILS] Path fixed: ${path} -> ${fixed}`);
  
  return fixed;
}
