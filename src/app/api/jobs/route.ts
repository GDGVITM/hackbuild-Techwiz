import { NextRequest, NextResponse } from 'next/server';
import Job from '@/lib/models/Job';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skills = searchParams.get('skills');
    const query = skills ? { 
      $text: { $search: skills },
      status: 'open'
    } : { status: 'open' };

    const jobs = await Job.find(query)
      .populate('businessId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const jobData = await request.json();

    const job = new Job({
      ...jobData,
      businessId: userId,
    });

    await job.save();
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}