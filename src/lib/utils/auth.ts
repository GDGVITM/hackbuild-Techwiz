import { NextRequest } from 'next/server';
import { verifyToken, JWTPayloadWithUser } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    role: string;
    email?: string;
  };
}

/**
 * Extract user information from request headers (set by middleware)
 */
export function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || !userRole) {
    return null;
  }

  return {
    userId,
    role: userRole as 'student' | 'business',
  };
}

/**
 * Verify JWT token from request and return user payload
 */
export async function verifyAuthToken(request: NextRequest): Promise<JWTPayloadWithUser | null> {
  try {
    const token = request.cookies.get("token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    return await verifyToken<JWTPayloadWithUser>(token);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(message: string = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 });
}

