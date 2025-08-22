import { NextRequest, NextResponse } from 'next/server';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Find all jobs
    const jobs = await Job.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    const { title, description, budget, deadline, skills, businessId } = await request.json();

    // Validate input
    if (!title || !description || !budget || !deadline || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new job
    const job = new Job({
      title,
      description,
      budget,
      deadline,
      skills: skills || [],
      businessId
    });

    await job.save();

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}