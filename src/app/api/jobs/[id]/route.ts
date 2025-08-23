import { NextRequest, NextResponse } from 'next/server';
import { Job } from '@/lib/models';
import dbConnect from '@/lib/db/mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Connecting to database...');
    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');
    
    const { id } = await context.params;
    console.log('Fetching job with ID:', id);
    
    // First try to find the job without populate to see if it exists
    const jobExists = await Job.findById(id);
    if (!jobExists) {
      console.log('Job not found in database');
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    console.log('Job found, now populating businessId...');
    // Now populate the businessId field
    const job = await Job.findById(id).populate('businessId', 'name email');
    console.log('Job populated successfully:', job ? 'Yes' : 'No');
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found after population' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Failed to fetch job:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch job';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
    }
    
    // Check for specific Mongoose errors
    if (error instanceof Error && error.message.includes('Schema hasn\'t been registered')) {
      errorMessage = 'Database model registration error';
      errorDetails = 'User model not properly registered. Please check model imports.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}
