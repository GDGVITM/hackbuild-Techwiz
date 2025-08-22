import { NextRequest, NextResponse } from 'next/server';
import Job from '@/lib/models/Job';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 params is a Promise
) {
  try {
    const { id } = await context.params;         // 👈 must await
    const job = await Job.findById(id).populate('businessId', 'name email');
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}
