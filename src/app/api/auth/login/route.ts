import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password'; // Now this import will work
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
    const user = await User.findOne({ email });
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
    const token = signToken({ 
      userId: user._id.toString(), 
      role: user.role 
    });
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Login failed' 
    }, { status: 500 });
  }
}