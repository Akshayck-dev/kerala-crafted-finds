import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixImagePath(path?: string | null) {
  const fallback = "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&h=600&fit=crop";
  
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
  
  // Return the full URL with base
  return `https://mallusmart.com/${cleanPath}`;
}
