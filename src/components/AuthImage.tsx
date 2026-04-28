import React, { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function AuthImage({ src, alt, className, fallback = "/placeholder.svg" }: AuthImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || src.includes("placehold.co") || src.startsWith("blob:")) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("adminToken")?.toString().trim().replace(/^"|"$/g, '') || "";
    
    setIsLoading(true);
    setError(false);

    // Fetch the image with the Authorization header
    const fetchImage = async () => {
      try {
        console.log(`[AuthImage] Attempting to fetch: ${src}`);
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          console.warn(`[AuthImage] HTTP Error ${response.status} for ${src}. Falling back.`);
          throw new Error(`Status ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setIsLoading(false);
      } catch (err: any) {
        console.error(`[AuthImage] Error for ${src}:`, err.message);
        setError(true);
        setImageSrc(fallback);
        setIsLoading(false);
      }
    };

    fetchImage();

    // Cleanup URL to prevent memory leaks
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  return (
    <img 
      src={imageSrc || fallback} 
      alt={alt} 
      className={className} 
      onError={() => {
        setError(true);
        setImageSrc(fallback);
      }}
    />
  );
}
