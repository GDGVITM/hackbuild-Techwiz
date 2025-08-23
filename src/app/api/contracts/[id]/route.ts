// src/app/api/contracts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
  const { id: contractId } = await params;
    
    await dbConnect();
    
    // First, find the contract without populating for authorization check
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is authorized to view this contract
    // Compare with the string representation of the ObjectIds
    if (contract.businessId.toString() !== userId && contract.studentId.toString() !== userId) {
      console.log('Authorization failed:', {
        userId,
        businessId: contract.businessId.toString(),
        studentId: contract.studentId.toString()
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // If authorized, now populate the contract with related data
    const populatedContract = await Contract.findById(contractId)
      .populate('proposalId')
      .populate('jobId')
      .populate('businessId')
      .populate('studentId');
    
    return NextResponse.json({ 
      success: true, 
      contract: populatedContract 
    });
  } catch (error: any) {
    console.error('Error fetching contract:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
  const { id: contractId } = await params;
    const body = await request.json();
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is authorized to update this contract
    if (contract.businessId.toString() !== userId && contract.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update allowed fields
    const allowedUpdates = ['status', 'paymentStatus', 'milestones', 'terms'];
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        contract[field] = body[field];
      }
    }
    
    contract.updatedAt = new Date();
    await contract.save();
    
    // Populate the updated contract
    const updatedContract = await Contract.findById(contractId)
      .populate('proposalId')
      .populate('jobId')
      .populate('businessId')
      .populate('studentId');
    
    return NextResponse.json({
      success: true,
      contract: updatedContract
    });
    
  } catch (error: any) {
    console.error('Error updating contract:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update contract' },
      { status: 500 }
    );
  }
}