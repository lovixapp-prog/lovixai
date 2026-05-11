/**
 * Utility for reliable external redirects (e.g., Stripe Checkout)
 * Handles mobile browser restrictions on window.open after async operations
 */

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || '';
  
  // Check for mobile devices
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Also check for iPadOS (which reports as Mac but has touch)
  const isIPadOS = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
  
  return isMobile || isIPadOS;
}

/**
 * Redirects to an external URL (e.g., Stripe Checkout or Customer Portal)
 * - On mobile: always navigates in the same tab (most reliable)
 * - On desktop: attempts new tab, falls back to same tab if blocked
 */
export function redirectToExternal(url: string): void {
  if (!url) return;
  
  if (isMobileBrowser()) {
    // Mobile: always use same-tab navigation (most reliable)
    window.location.assign(url);
    return;
  }
  
  // Desktop: try new tab, fallback to same tab if blocked
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // Popup was blocked, fallback to same tab
    window.location.assign(url);
  }
}
