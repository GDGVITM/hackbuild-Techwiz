import { NextRequest, NextResponse } from 'next/server';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

// GET job details (public)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const job = await Job.findById(id).populate('businessId', 'name email');

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}
