// lib/utils/cookies.ts - Server-side only
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'business';
  phone?: string;
}

/**
 * Set authentication cookies with enhanced security (Server-side only)
 * @param token JWT token
 * @param user User object
 */
export const setAuthCookie = (token: string, user: AuthUser) => {
  const response = NextResponse.next();

  // Secure JWT token (httpOnly, secure, sameSite)
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // User cookie including role (readable client-side)
  response.cookies.set("user", JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
};

/**
 * Get authentication cookies with validation (Server-side only)
 */
export const getAuthCookie = async (): Promise<{ token: string; user: AuthUser } | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const user = cookieStore.get("user");

    if (!token?.value || !user?.value) {
      return null;
    }

    const parsedUser = JSON.parse(user.value) as AuthUser;
    
    // Validate user object structure
    if (!parsedUser.id || !parsedUser.email || !parsedUser.role) {
      return null;
    }

    return { 
      token: token.value, 
      user: parsedUser 
    };
  } catch (error) {
    console.error("Error parsing auth cookies:", error);
    return null;
  }
};

/**
 * Remove authentication cookies (Server-side only)
 */
export const removeAuthCookie = () => {
  const response = NextResponse.next();

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("user", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
};

/**
 * Create a response with auth cookies set (Server-side only)
 */
export const createAuthResponse = (
  data: any, 
  token: string, 
  user: AuthUser, 
  status: number = 200
) => {
  const response = NextResponse.json(data, { status });
  
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("user", JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
};
