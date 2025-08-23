'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


export default function Navbar() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                FreelanceHub
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              FreelanceHub
            </Link>
          </div>



          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
                <Link
                  href={user.role === 'student' ? '/dashboard/student' : '/dashboard/business'}
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/dashboard') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/explore"
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/explore') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
                    }`}
                >
                  Explore Jobs
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/auth/login') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
                    }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}