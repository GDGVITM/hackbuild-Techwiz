import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Job } from '@/lib/models';
import mongoose from 'mongoose';
import ensureModelsRegistered from '@/lib/models/register';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    await dbConnect();
    console.log('Database connected successfully');
    
    // Ensure models are registered
    await ensureModelsRegistered();
    
    // Test if models are registered
    const models = mongoose.connection.models;
    console.log('Registered models:', Object.keys(models));
    
    // Test Job model
    const jobCount = await Job.countDocuments();
    console.log('Job count:', jobCount);
    
    // Test User model registration
    const User = mongoose.model('User');
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);
    
    // Get a sample job if any exists
    let sampleJob = null;
    try {
      sampleJob = await Job.findOne().populate('businessId', 'name email');
      console.log('Sample job populated successfully');
    } catch (populateError) {
      console.error('Error populating sample job:', populateError);
      // Try without populate
      sampleJob = await Job.findOne();
      console.log('Sample job found without populate');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      registeredModels: Object.keys(models),
      jobCount,
      userCount,
      sampleJob: sampleJob ? {
        id: sampleJob._id,
        title: sampleJob.title,
        businessId: sampleJob.businessId
      } : null
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 