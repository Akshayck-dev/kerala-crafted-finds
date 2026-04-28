import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_URL, CACHE_BUSTER } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixImagePath(path?: string | null) {
  const fallback = "https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image";
  
  if (!path || typeof path !== 'string' || path.trim() === '') {
    // console.log("[fixImagePath] Fallback triggered: path is empty or not a string");
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
  
  // Standardize upload paths: ensure they start with /api/uploads/
  // We rely on the Vercel proxy to map /api/uploads/ to /Content/uploads/
  cleanPath = cleanPath.replace(/^\/+/, '').replace(/^api\//, '');
  
  // Remove any existing "Content/" or "uploads/" prefix so it consistently hits the /api/uploads proxy rule
  cleanPath = cleanPath.replace(/^Content\//i, '').replace(/^uploads\//i, '');
  
  let finalPath = cleanPath;
  // Note: we don't need to re-add uploads/ here because our proxy destination already includes it
  // and we want the path to be relative to that folder.
  
  const base = BASE_URL.replace(/\/+$/, '');
  // Always prefix with uploads/ so it hits the correct Vercel proxy rule
  const suffix = `uploads/${finalPath.replace(/^\/+/, '')}`;
  
  // Encode the suffix to handle spaces and special characters in filenames
  const encodedSuffix = suffix.split('/').map(part => encodeURIComponent(part)).join('/');
  
  const separator = encodedSuffix.includes('?') ? '&' : '?';
  const finalUrl = `${base}/${encodedSuffix}${separator}v=${CACHE_BUSTER}`;
  
  console.log(`[fixImagePath] "${path}" -> "${finalUrl}"`);
  return finalUrl;
}
