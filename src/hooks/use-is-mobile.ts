'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Corresponds to md: in Tailwind

export function useIsMobile(): boolean {
  // Initialize state based on a default that won't cause hydration errors.
  // We assume desktop until the client-side check runs.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    const checkDevice = () => {
      const isMobileUserAgent = /Mobi/i.test(window.navigator.userAgent);
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isMobileUserAgent || isSmallScreen);
    };

    // Run the check once on mount
    checkDevice();

    // Add listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return isMobile;
}
