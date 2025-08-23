// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
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
    
    // Verify the businessId matches the authenticated user
    if (body.businessId !== userId) {
      return NextResponse.json(
        { error: 'You can only create contracts for your own business' },
        { status: 403 }
      );
    }
    
    // Create the contract
    const contract = await Contract.create(body);
    
    return NextResponse.json({
      success: true,
      contract
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating contract:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create contract' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
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
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}