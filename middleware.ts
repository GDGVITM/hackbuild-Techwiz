import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./src/lib/auth/jwt";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/me",
  "/api/health",
  "/api/webhooks",
  "/favicon.ico",
  "/_next",
  "/api/upload" // Keep upload endpoint public for now
];

// Role-based route protection
const ROLE_BASED_ROUTES = {
  "/dashboard/business": ["business"],
  "/dashboard/student": ["student"],
  "/api/contracts": ["business", "student"],
  "/api/jobs": ["business", "student"],
  "/api/proposals": ["business", "student"],
  "/api/payments": ["business", "student"]
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get("token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // For pages, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const payload = await verifyToken<{ userId: string; role: string; exp: number }>(token);
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Token expired");
    }

    // Check role-based access for specific routes
    for (const [route, allowedRoles] of Object.entries(ROLE_BASED_ROUTES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(payload.role)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-role", payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    
    // Clear invalid cookies
    const response = pathname.startsWith("/api/") 
      ? NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      : NextResponse.redirect(new URL("/auth/login", request.url));
    
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    response.cookies.set("user", "", { maxAge: 0, path: "/" });
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
