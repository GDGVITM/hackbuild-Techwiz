import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import { createAuthResponse } from '@/lib/utils/cookies';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Establish database connection
    await dbConnect();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Create JWT token
    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    // Prepare user data for response
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    // Create response with cookies
    return createAuthResponse({
      success: true,
      user: userData,
      message: 'Login successful'
    }, token, userData);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Login failed. Please try again.'
    }, { status: 500 });
  }
}