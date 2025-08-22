import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createUnauthorizedResponse, createForbiddenResponse, verifyAuthToken } from '@/lib/utils/auth';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Prefer user injected by middleware; fallback to verifying token directly
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

    await dbConnect();

    // Get jobs based on user role
    let jobs;
    if (user.role === 'business') {
      jobs = await Job.find({ createdBy: user.userId }).populate('createdBy', 'name email');
    } else {
      jobs = await Job.find({ status: 'open' }).populate('createdBy', 'name email');
    }

    return NextResponse.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Prefer user injected by middleware; fallback to verifying token directly
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

    // Only business users can create jobs
    if (user.role !== 'business') {
      return createForbiddenResponse('Only business users can create jobs');
    }

    const body = await request.json();
    const { title, description, budget, skills, deadline } = body;

    if (!title || !description || !budget) {
      return NextResponse.json(
        { error: 'Title, description, and budget are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const job = new Job({
      title,
      description,
      budget,
      skills: skills || [],
      deadline: deadline || null,
      createdBy: user.userId,
      status: 'open'
    });

    await job.save();

    return NextResponse.json({
      success: true,
      job: job
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
