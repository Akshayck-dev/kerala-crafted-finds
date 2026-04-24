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
  
  // If it's a full URL to mallusmart, convert it to use our local /api proxy
  // This bypasses the 401 Unauthorized errors caused by hotlink protection
  if (trimmedPath.includes("mallusmart.com")) {
    const relativePath = trimmedPath.split("mallusmart.com").pop()?.replace(/^\/+/, '') || "";
    return `/api/${relativePath}`;
  }
  
  // If already absolute URL (other than mallusmart)
  if (trimmedPath.startsWith("http")) {
    return trimmedPath;
  }
  
  // Clean the path (remove leading slashes to prevent double slashes)
  const cleanPath = trimmedPath.replace(/^\/+/, '');
  
  // Return the path via the proxy to avoid CORS/401 issues
  return `/api/${cleanPath}`;
}
