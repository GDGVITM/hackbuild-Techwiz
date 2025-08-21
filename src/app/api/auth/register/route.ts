import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Create new user
    const user = new User({ name, email, password, role });
    await user.save();
    
    // Create JWT token
    const token = signToken({ userId: user._id, role: user.role });
    
    return NextResponse.json({ 
      user: { id: user._id, name, email, role },
      token 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}