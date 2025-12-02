'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client-side canonical URL manager
 * This ensures the canonical link is always properly set
 */
export function CanonicalURLManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get or create canonical link element
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    // Base URL - always use the root without query parameters
    const baseUrl = 'https://audiovibes.vercel.app';
    
    // For all pages with query parameters, canonical should point to root
    // This prevents duplicate content issues with search results
    if (searchParams.toString()) {
      canonicalLink.href = baseUrl;
    } else {
      // For the home page and any other pages without query params
      canonicalLink.href = `${baseUrl}${pathname === '/' ? '' : pathname}`;
    }
  }, [pathname, searchParams]);

  return null;
}
