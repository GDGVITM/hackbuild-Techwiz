import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth/jwt';
import { createAuthResponse } from '@/lib/utils/cookies';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({
        error: 'No token provided'
      }, { status: 401 });
    }

    // Verify current token
    const payload = await verifyToken(token);
    
    // Check if user still exists
    await dbConnect();
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 401 });
    }

    // Generate new token
    const newToken = await signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    // Prepare user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    // Create response with new cookies
    return createAuthResponse({
      success: true,
      user: userData,
      message: 'Token refreshed successfully'
    }, newToken, userData);

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      error: 'Token refresh failed'
    }, { status: 401 });
  }
}

