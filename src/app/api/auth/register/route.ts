import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth/jwt';
import { createAuthResponse } from '@/lib/utils/cookies';
import dbConnect from '@/lib/db/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Establish database connection
    await dbConnect();

    const { name, email, phone, role, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role || !phone) {
      return NextResponse.json({
        error: 'All fields (name, email, password, role, phone) are required'
      }, { status: 400 });
    }

    // Validate role
    if (!['student', 'business'].includes(role)) {
      return NextResponse.json({
        error: 'Role must be either "student" or "business"'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Simple phone number validation
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({
        error: 'Phone number must be 10 digits'
      }, { status: 400 });
    }

    // Check if phone number is already registered
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({
        error: 'User with this phone number already exists'
      }, { status: 400 });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone
    });

    await user.save();

    // Create JWT token
    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    });

    // Prepare user data for response
    const userData = {
      id: user._id.toString(),
      name,
      email,
      role,
      phone
    };

    // Create response with cookies
    return createAuthResponse({
      success: true,
      user: userData,
      message: 'Registration successful'
    }, token, userData, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}