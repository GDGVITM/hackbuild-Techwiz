'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'business')[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading, user, allowedRoles });
    
    if (!loading) {
      if (!isAuthenticated) {
        console.log('ProtectedRoute - User not authenticated, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log('ProtectedRoute - User role not allowed:', user.role, 'Allowed roles:', allowedRoles);
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = user.role === 'business' ? '/dashboard/business' : '/dashboard/student';
        console.log('ProtectedRoute - Redirecting to dashboard:', dashboardPath);
        router.push(dashboardPath);
        return;
      }
      
      console.log('ProtectedRoute - Access granted for user:', user?.role);
    }
  }, [isAuthenticated, loading, user, allowedRoles, redirectTo, router]);

  if (loading) {
    console.log('ProtectedRoute - Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, showing nothing');
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Role not allowed, showing nothing');
    return null;
  }

  console.log('ProtectedRoute - Rendering children');
  return <>{children}</>;
}

