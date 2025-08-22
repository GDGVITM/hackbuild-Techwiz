import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose'; // Import the dbConnect function

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
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
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
      return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 400 });
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
    const token = signToken({ userId: user._id, role: user.role });
    
    return NextResponse.json({
      user: {
        id: user._id,
        name,
        email,
        role,
        phone
      },
      token
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}