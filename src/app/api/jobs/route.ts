import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyAuthToken, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/utils/auth';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

// GET all jobs
export async function GET(request: NextRequest) {
  try {
    let user = getUserFromRequest(request);
    if (!user) {
      const payload = await verifyAuthToken(request);
      if (payload) {
        user = { userId: payload.userId, role: payload.role as 'student' | 'business' };
      }
    }

    await dbConnect();

    let jobs;
    if (user && user.role === 'business') {
      // Business users → see only their own jobs
      jobs = await Job.find({ businessId: user.userId }).populate('businessId', 'name email');
    } else {
      // Students + Public (no auth) → see all open jobs
      jobs = await Job.find({ status: 'open' }).populate('businessId', 'name email');
    }

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST new job (only business)
export async function POST(request: NextRequest) {
  try {
    let user = getUserFromRequest(request);
    if (!user) {
      const payload = await verifyAuthToken(request);
      if (payload) {
        user = { userId: payload.userId, role: payload.role as 'student' | 'business' };
      }
    }

    if (!user) {
      return createUnauthorizedResponse('Authentication required');
    }

    if (user.role !== 'business') {
      return createForbiddenResponse('Only business users can create jobs');
    }

    const body = await request.json();
    const { title, description, budgetMin, budgetMax, skillsRequired, milestones } = body;

    if (!title || !description || !budgetMin || !budgetMax) {
      return NextResponse.json(
        { error: 'Title, description, and budget range are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const job = new Job({
      title,
      description,
      budgetMin,
      budgetMax,
      skillsRequired: skillsRequired || [],
      milestones: milestones || [],
      businessId: user.userId,
      status: 'open'
    });

    await job.save();

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
