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
    await dbConnect();
    
    // Update the expected fields to match the frontend
    const { 
      title, 
      description, 
      budgetMin, 
      budgetMax, 
      skillsRequired, 
      milestones,
      businessId
    } = await request.json();
    
    // Validate input
    if (!title || !description || !budgetMin || !budgetMax || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new job with the correct fields
    const job = new Job({
      title,
      description,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      skills: skillsRequired || [],
      milestones: milestones || [],
      businessId
    });
    
    await job.save();
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}