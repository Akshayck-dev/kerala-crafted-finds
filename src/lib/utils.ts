import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_URL, CACHE_BUSTER } from "./api"

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

  // Handle full URLs to mallusmart
  let cleanPath = trimmedPath;
  if (trimmedPath.includes("mallusmart.com")) {
    cleanPath = trimmedPath.split("mallusmart.com").pop()?.replace(/^\/+/, '') || "";
  }
  
  // If already absolute URL (other than mallusmart)
  if (cleanPath.startsWith("http")) {
    return cleanPath;
  }
  
  // Standardize upload paths: ensure they start with Content/uploads/
  // Backend returns paths like "uploads/image.jpg" or "Content/uploads/image.jpg"
  cleanPath = cleanPath.replace(/^\/+/, '').replace(/^api\//, '');
  
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = `Content/${cleanPath}`;
  } else if (!cleanPath.startsWith('Content/') && (cleanPath.includes('.jpg') || cleanPath.includes('.png') || cleanPath.includes('.jpeg') || cleanPath.includes('.webp'))) {
    // If it looks like a file but doesn't have Content/ prefix, try adding it
    // Most images in this backend are under Content/
    cleanPath = `Content/${cleanPath}`;
  }

  const base = BASE_URL.replace(/\/+$/, '');
  const suffix = cleanPath.replace(/^\/+/, '');
  
  const separator = suffix.includes('?') ? '&' : '?';
  const finalUrl = `${base}/${suffix}${separator}v=${CACHE_BUSTER}`;
  
  // console.log(`[fixImagePath] Original: ${trimmedPath} -> Final: ${finalUrl}`);
  return finalUrl;
}
