import dbConnect from '@/lib/db/mongoose';
import { NextResponse } from 'next/server';



export async function GET() {
  try {
    // Test database connection
    await dbConnect();

    return NextResponse.json({
      status: 'success',
      message: 'Backend is running properly',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Backend or database issue',
      error: error.message,
    }, { status: 500 });
  }
}