import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyAuthToken, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/utils/auth';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

// GET all jobs
export async function GET(request: NextRequest) {
  try {
    console.log('Jobs API - Starting request...');
    
    let user = getUserFromRequest(request);
    console.log('Jobs API - User from headers:', user);
    
    if (!user) {
      console.log('Jobs API - No user from headers, trying token verification...');
      const payload = await verifyAuthToken(request);
      if (payload) {
        user = { userId: payload.userId, role: payload.role as 'student' | 'business' };
        console.log('Jobs API - User from token:', user);
      }
    }

    if (!user) {
      console.log('Jobs API - No authentication found, returning public jobs');
      // Return public jobs for unauthenticated users
      await dbConnect();
      const jobs = await Job.find({ status: 'open' }).populate('businessId', 'name email');
      return NextResponse.json({ success: true, jobs });
    }

    await dbConnect();

    let jobs;
    if (user.role === 'business') {
      // Business users → see only their own jobs
      console.log('Jobs API - Fetching jobs for business user:', user.userId);
      jobs = await Job.find({ businessId: user.userId }).populate('businessId', 'name email');
    } else if (user.role === 'student') {
      // Students → see all open jobs
      console.log('Jobs API - Fetching open jobs for student');
      jobs = await Job.find({ status: 'open' }).populate('businessId', 'name email');
    } else {
      // Public (no auth) → see all open jobs
      console.log('Jobs API - Fetching public jobs');
      jobs = await Job.find({ status: 'open' }).populate('businessId', 'name email');
    }

    console.log('Jobs API - Returning jobs:', jobs.length);
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Jobs API - Error fetching jobs:', error);
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

    // Check if user is business
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
