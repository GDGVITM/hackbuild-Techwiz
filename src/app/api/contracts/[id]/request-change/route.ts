// src/app/api/contracts/[id]/request-change/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const contractId = params.id;
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the student is authorized to request changes
    if (contract.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Create change request object
    const changeRequest = {
      message,
      status: 'pending',
      createdAt: new Date(),
    };
    
    // Update contract with change request
    contract.status = 'changes_requested';
    contract.changeRequests = contract.changeRequests || [];
    contract.changeRequests.push(changeRequest);
    contract.updatedAt = new Date();
    await contract.save();
    
    // Return updated contract
    return NextResponse.json({ 
      success: true, 
      contract: {
        ...contract.toObject(),
        status: 'changes_requested'
      }
    });
  } catch (error: any) {
    console.error('Error requesting changes:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to request changes' },
      { status: 500 }
    );
  }
}