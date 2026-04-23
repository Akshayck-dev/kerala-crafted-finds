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
  
  // If already absolute URL
  if (trimmedPath.startsWith("http")) {
    return trimmedPath;
  }
  
  // Clean the path (remove leading slashes to prevent double slashes)
  const cleanPath = trimmedPath.replace(/^\/+/, '');
  
  // Return the path with the absolute production domain to use the Original API assets
  return `https://mallusmart.com/${cleanPath}`;
}
