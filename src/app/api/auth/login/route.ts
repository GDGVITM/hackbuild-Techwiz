import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create JWT token
    const token = signToken({ userId: user._id, role: user.role });
    
    return NextResponse.json({ 
      user: { id: user._id, email: user.email, role: user.role },
      token 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}