/**
 * Error Handler Utility
 * Performs a hard refresh (clears cache) when an error occurs during form submission
 * Similar to Ctrl+Shift+R or Cmd+Shift+R
 */

export function handleFormError(error, customMessage = 'An error occurred. Please try again.') {
  console.error('Form submission error:', error);

  // Store error message in localStorage to show after refresh
  try {
    localStorage.setItem('lastFormError', customMessage);
  } catch (e) {
    console.error('Failed to store error message:', e);
  }

  // Perform hard refresh (clears cache)
  if (typeof window !== 'undefined') {
    // Force reload from server, bypassing cache
    window.location.reload(true);
  }
}

/**
 * Check if there was a form error before refresh
 * Returns the error message if exists, then clears it
 */
export function getLastError() {
  if (typeof window === 'undefined') return null;

  try {
    const error = localStorage.getItem('lastFormError');
    if (error) {
      localStorage.removeItem('lastFormError');
      return error;
    }
  } catch (e) {
    console.error('Failed to retrieve error message:', e);
  }

  return null;
}

/**
 * Handle navigation timeout error
 * Performs a hard refresh when navigation takes too long
 */
export function handleNavigationTimeout(href, timeout = 10000) {
  let timeoutId;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      console.error('Navigation timeout for:', href);
      cleanup();
      handleFormError(new Error('Navigation timeout'), 'Navigation took too long. Page has been refreshed.');
      reject(new Error('Navigation timeout'));
    }, timeout);
  });

  return { promise, cleanup };
}

/**
 * Safe navigation with timeout handling
 */
export function safeNavigate(router, href, timeout = 10000) {
  const { promise, cleanup } = handleNavigationTimeout(href, timeout);

  try {
    router.push(href);
    cleanup();
  } catch (error) {
    cleanup();
    handleFormError(error, 'Navigation failed. Page has been refreshed.');
  }
}
