# JWT Authentication System

This document describes the comprehensive JWT authentication system implemented in the FreelanceHub project.

## Overview

The authentication system uses JWT tokens stored in HTTP-only cookies for security, with role-based access control for different user types (students and businesses).

## Architecture

### Components

1. **Middleware** (`middleware.ts`) - Root-level route protection
2. **JWT Utilities** (`src/lib/auth/jwt.ts`) - Token creation and verification
3. **Server Cookie Utilities** (`src/lib/utils/cookies.ts`) - Server-side secure cookie management
4. **Client Cookie Utilities** (`src/lib/utils/client-cookies.ts`) - Client-side cookie helpers
5. **Auth Context** (`src/context/AuthContext.tsx`) - Client-side state management
6. **Protected Route Component** (`src/components/auth/ProtectedRoute.tsx`) - Client-side route protection
7. **API Authentication Utilities** (`src/lib/utils/auth.ts`) - Server-side auth helpers

## Features

### Security Features
- **HTTP-only cookies** for JWT storage (prevents XSS attacks)
- **Secure flag** in production (HTTPS only)
- **SameSite: lax** for CSRF protection
- **Token expiration** (7 days by default)
- **Role-based access control**
- **Automatic token refresh**
- **Server-side authentication verification**

### User Roles
- **Student** - Can browse jobs, submit proposals
- **Business** - Can post jobs, manage contracts

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securepassword",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890"
  },
  "message": "Registration successful"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890"
  },
  "message": "Login successful"
}
```

#### GET `/api/auth/me`
Get current user information (for client-side auth verification).

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890"
  }
}
```

#### POST `/api/auth/logout`
Clear authentication cookies.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "1234567890"
  },
  "message": "Token refreshed successfully"
}
```

## Usage Examples

### Client-Side Authentication

#### Using AuthContext
```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Protected Routes
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function BusinessDashboard() {
  return (
    <ProtectedRoute allowedRoles={['business']}>
      <div>Business Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

### Server-Side Authentication

#### API Route Protection
```tsx
import { getUserFromRequest, createUnauthorizedResponse } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }

  // Only business users can access this endpoint
  if (user.role !== 'business') {
    return createForbiddenResponse('Insufficient permissions');
  }

  // Your API logic here
  return NextResponse.json({ data: 'protected data' });
}
```

#### Manual Token Verification
```tsx
import { verifyAuthToken } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  const payload = await verifyAuthToken(request);
  
  if (!payload) {
    return createUnauthorizedResponse('Invalid token');
  }

  // Use payload.userId and payload.role
  return NextResponse.json({ success: true });
}
```

## Environment Variables

Add these to your `.env.local` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=your-mongodb-connection-string
```

## Security Best Practices

1. **Never store sensitive data in JWT payload** - Only include user ID, role, and email
2. **Use HTTPS in production** - Cookies with secure flag require HTTPS
3. **Implement rate limiting** - Prevent brute force attacks
4. **Validate input** - Always validate user input on both client and server
5. **Log security events** - Monitor for suspicious activity
6. **Regular token rotation** - Consider implementing refresh token rotation
7. **Server-side authentication verification** - Always verify auth status server-side

## Error Handling

The system provides consistent error responses:

- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Insufficient permissions
- **400 Bad Request** - Invalid input data
- **500 Internal Server Error** - Server-side errors

## Middleware Configuration

The root middleware automatically protects all routes except those listed in `PUBLIC_PATHS`. It also handles:

- Token verification
- Role-based access control
- Automatic redirects for unauthenticated users
- Cookie cleanup for invalid tokens

## Client-Side vs Server-Side

### Client-Side (Browser)
- Uses `document.cookie` for reading user data
- Cannot access httpOnly tokens (security feature)
- Relies on server API calls for authentication verification
- Manages UI state and user experience

### Server-Side (API Routes)
- Uses `cookies()` from `next/headers`
- Has access to httpOnly tokens
- Performs actual authentication verification
- Sets secure cookies

## Testing Authentication

### Manual Testing
1. Register a new account
2. Login and verify cookies are set
3. Access protected routes
4. Test role-based access
5. Logout and verify cookies are cleared

### API Testing
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# Check auth status
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt

# Access protected endpoint
curl -X GET http://localhost:3000/api/jobs \
  -b cookies.txt
```

## Troubleshooting

### Common Issues

1. **"JWT_SECRET environment variable is not set"**
   - Add JWT_SECRET to your .env.local file

2. **"Token verification failed"**
   - Check if JWT_SECRET matches between server restarts
   - Verify token hasn't expired

3. **"Authentication required"**
   - Ensure cookies are being sent with requests
   - Check if middleware is properly configured

4. **"Insufficient permissions"**
   - Verify user role matches required roles for the route

5. **"next/headers only works in Server Components"**
   - Use client-side cookie utilities for client components
   - Use server-side cookie utilities only in API routes

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_AUTH=true
```

This will log authentication events to the console.
