'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuthCookie, removeAuthCookie } from '@/lib/utils/cookies';
import {useAuth} from '@/contexts/AuthContext';

export default function Navbar() {
  const { user,logout} = useAuth();
  const router = useRouter();

  useEffect(() => {
    const authData = getAuthCookie();
    if (authData) {
    //   setUser(authData.user);
    }
  }, []);

  const handleLogout = () => {
    logout();
    // setUser(null);
    router.push('/login');
  };

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
            {user ? (
              <>
                <Link href={user.role === 'student' ? '/dashboard/student' : '/dashboard/business'} className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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