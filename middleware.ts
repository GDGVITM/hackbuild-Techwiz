import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/me",
  "/api/health",
  "/api/webhooks",
  "/favicon.ico",
  "/_next",
  "/api/upload", // Keep upload endpoint public for now
  "/debug" // Debug page for troubleshooting
];

// Role-based route protection with more specific routes
const ROLE_BASED_ROUTES = {
  // Dashboard routes
  "/dashboard/business": ["business"],
  "/dashboard/student": ["student"],
  
  // API routes with role requirements
  "/api/jobs": ["business", "student"], // Both can access jobs
  "/api/proposals": ["business", "student"], // Both can access proposals
  "/api/contracts": ["business", "student"], // Both can access contracts
  "/api/payments": ["business", "student"], // Both can access payments
  
  // Business-specific API routes
  "/api/jobs/create": ["business"],
  "/api/jobs/update": ["business"],
  "/api/jobs/delete": ["business"],
  
  // Student-specific API routes
  "/api/proposals/submit": ["student"],
  "/api/proposals/update": ["student"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  if (!token || !userCookie) {
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
    // Parse user data from cookie (this is safe as it's set by the server)
    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      throw new Error("Invalid user data");
    }

    const { role, id: userId } = userData;

    if (!role || !userId) {
      throw new Error("Invalid user data structure");
    }

    // Check role-based access for the specific route being accessed
    let hasAccess = true;
    let requiredRoles: string[] = [];
    
    // Find the most specific matching route
    for (const [route, allowedRoles] of Object.entries(ROLE_BASED_ROUTES)) {
      if (pathname.startsWith(route)) {
        requiredRoles = allowedRoles;
        hasAccess = allowedRoles.includes(role);
        break; // Found the matching route, no need to check others
      }
    }

    // If route requires specific roles and user doesn't have access
    if (requiredRoles.length > 0 && !hasAccess) {
      console.log(`Access denied: User role ${role} not allowed for route ${pathname}. Required roles: ${requiredRoles.join(', ')}`);
      
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Insufficient permissions. Your role does not have access to this resource." },
          { status: 403 }
        );
      }
      
      // Redirect to appropriate dashboard based on user role
      const dashboardPath = role === 'business' ? '/dashboard/business' : '/dashboard/student';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Add user info to headers for API routes
    if (pathname.startsWith("/api/")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", userId);
      requestHeaders.set("x-user-role", role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For page routes, just allow access if authentication passed
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication check failed:", error);
    
    // Clear invalid cookies
    const response = pathname.startsWith("/api/") 
      ? NextResponse.json({ error: "Invalid authentication data" }, { status: 401 })
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
