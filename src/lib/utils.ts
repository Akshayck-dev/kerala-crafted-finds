import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_URL } from "./api"

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

  // If it's a full URL to mallusmart, ensure it uses the correct API domain
  if (trimmedPath.includes("mallusmart.com")) {
    const relativePath = trimmedPath.split("mallusmart.com").pop()?.replace(/^\/+/, '') || "";
    // If it's an upload path, ensure it points to the Content/uploads directory on the backend
    const cleanPath = relativePath.startsWith('Content/uploads/') ? relativePath : 
                     relativePath.startsWith('uploads/') ? `Content/${relativePath}` : 
                     relativePath;
    
    // Ensure we don't have double slashes if BASE_URL ends with / or cleanPath starts with /
    const base = BASE_URL.replace(/\/+$/, '');
    const suffix = cleanPath.replace(/^\/+/, '');
    return `${base}/${suffix}`;
  }
  
  // If already absolute URL (other than mallusmart)
  if (trimmedPath.startsWith("http")) {
    return trimmedPath;
  }
  
  // Clean the path and return full URL
  const cleanPath = trimmedPath.replace(/^\/+/, '').replace(/^api\//, '');
  const base = BASE_URL.replace(/\/+$/, '');
  const suffix = cleanPath.replace(/^\/+/, '');
  
  // Add a cache buster to ensure fresh images after updates
  const cacheBuster = `v=${Date.now()}`;
  const separator = suffix.includes('?') ? '&' : '?';
  
  return `${base}/${suffix}${separator}${cacheBuster}`;
}
