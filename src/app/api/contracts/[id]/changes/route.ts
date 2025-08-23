// src/app/api/contracts/[id]/changes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Contract from '@/lib/models/Contract';
import jwt from 'jsonwebtoken';

export async function GET(
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
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is authorized to view this contract
    if (contract.businessId.toString() !== userId && contract.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // For now, return a placeholder for requested changes
    // In a real implementation, you might store this in a separate field or table
    return NextResponse.json({
      success: true,
      changes: contract.status === 'changes_requested' ? 
        'Student has requested changes to the contract terms. Please review and update accordingly.' : 
        'No changes requested'
    });
    
  } catch (error: any) {
    console.error('Error fetching contract changes:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract changes' },
      { status: 500 }
    );
  }
}
