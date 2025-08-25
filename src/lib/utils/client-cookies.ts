// lib/utils/client-cookies.ts - Client-side only
import { AuthUser } from './cookies';

/**
 * Get user data from client-side cookies
 */
export const getClientUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
    
    if (!userCookie) return null;
    
    const userValue = userCookie.split('=')[1];
    const user = JSON.parse(decodeURIComponent(userValue)) as AuthUser;
    
    // Validate user object structure
    if (!user.id || !user.email || !user.role) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error parsing client user cookie:", error);
    return null;
  }
};

/**
 * Check if user is authenticated on client-side
 */
export const isClientAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    
    return !!tokenCookie;
  } catch (error) {
    return false;
  }
};

/**
 * Clear client-side cookies
 */
export const clearClientCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear token cookie
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Clear user cookie
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

