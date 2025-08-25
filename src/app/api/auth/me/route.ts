import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/utils/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db/mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth/me - Starting authentication check...');
    
    // Get auth data from cookies
    const authData = await getAuthCookie();
    console.log('Auth/me - Auth data from cookies:', authData ? 'exists' : 'not found');
    
    if (!authData) {
      console.log('Auth/me - No auth data found, returning unauthenticated');
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // Verify token with timeout
    console.log('Auth/me - Verifying token...');
    const payload = await Promise.race([
      verifyToken(authData.token),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token verification timeout')), 3000)
      )
    ]);
    
    console.log('Auth/me - Token verified, checking user in database...');
    
    // Check if user still exists in database with timeout
    await dbConnect();
    const user = await Promise.race([
      User.findById(payload.userId).select('-password'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      )
    ]);
    
    if (!user) {
      console.log('Auth/me - User not found in database');
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    console.log('Auth/me - User found, returning authenticated response');
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Auth/me - Error during authentication check:', error);
    
    // If it's a timeout error, return unauthenticated quickly
    if (error.message.includes('timeout')) {
      console.log('Auth/me - Timeout occurred, returning unauthenticated');
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }
    
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}

