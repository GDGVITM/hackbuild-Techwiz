// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['proposalId', 'jobId', 'businessId', 'studentId', 'title', 'description', 'milestones', 'totalAmount', 'startDate', 'endDate', 'terms'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create the contract
    const contract = await Contract.create(body);
    
    return NextResponse.json({
      success: true,
      contract
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create contract' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const contracts = await Contract.find({
      $or: [
        { businessId: userId },
        { studentId: userId }
      ]
    }).populate('jobId').populate('businessId').populate('studentId');
    
    return NextResponse.json({
      success: true,
      contracts
    });
    
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}