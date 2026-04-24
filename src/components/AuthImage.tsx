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
    if (!src || src.includes("placehold.co")) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("adminToken")?.toString().trim().replace(/^"|"$/g, '') || "";
    
    setIsLoading(true);
    setError(false);

    // Fetch the image with the Authorization header
    fetch(src, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch image");
      return response.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      setImageSrc(objectUrl);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("AuthImage Error:", err);
      setError(true);
      setImageSrc(fallback);
      setIsLoading(false);
    });

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
