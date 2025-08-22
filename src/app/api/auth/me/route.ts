import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/utils/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Get auth data from cookies
    const authData = await getAuthCookie();
    
    if (!authData) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // Verify token
    const payload = await verifyToken(authData.token);
    
    // Check if user still exists in database
    await dbConnect();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

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
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}

