// src/app/api/contracts/test-create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Try to create a minimal valid contract
    const testContract = new Contract({
      proposalId: '507f1f77bcf86cd799439011', // Dummy ObjectId
      jobId: '507f1f77bcf86cd799439012', // Dummy ObjectId
      businessId: '507f1f77bcf86cd799439013', // Dummy ObjectId
      studentId: '507f1f77bcf86cd799439014', // Dummy ObjectId
      title: 'Test Contract',
      description: 'Test Description',
      totalAmount: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      terms: 'Test terms and conditions',
      status: 'pending',
      paymentStatus: 'pending',
      milestones: [
        {
          title: 'Milestone 1',
          description: 'First milestone description',
          amount: 500,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          status: 'pending'
        }
      ]
    });
    
    console.log('Test Create - Contract object created:', {
      id: testContract._id,
      title: testContract.title,
      status: testContract.status,
      paymentStatus: testContract.paymentStatus
    });
    
    // Try to validate
    try {
      await testContract.validate();
      console.log('Test Create - Contract validation passed');
    } catch (validationError: any) {
      console.error('Test Create - Contract validation error:', validationError);
      return NextResponse.json({ 
        error: `Contract validation failed: ${validationError.message}`,
        details: validationError.errors
      }, { status: 400 });
    }
    
    // Try to save
    try {
      await testContract.save();
      console.log('Test Create - Contract saved successfully');
    } catch (saveError: any) {
      console.error('Test Create - Contract save error:', saveError);
      return NextResponse.json({ 
        error: `Failed to save contract: ${saveError.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test contract created successfully',
      contract: testContract
    });
    
  } catch (error: any) {
    console.error('Error creating test contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test contract' },
      { status: 500 }
    );
  }
}
