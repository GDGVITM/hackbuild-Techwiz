// src/app/api/contracts/[id]/debug/route.ts
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
    
    // Verify the user is the business owner of this contract
    if (contract.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Only the business owner can view this contract' }, { status: 403 });
    }
    
    // Get contract schema info
    const contractSchema = Contract.schema;
    const paymentStatusPath = contractSchema.path('paymentStatus');
    
    return NextResponse.json({
      success: true,
      contract: {
        id: contract._id,
        title: contract.title,
        status: contract.status,
        paymentStatus: contract.paymentStatus,
        businessId: contract.businessId,
        studentId: contract.studentId,
        totalAmount: contract.totalAmount,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt
      },
      schema: {
        paymentStatus: {
          type: paymentStatusPath.instance,
          enum: paymentStatusPath.enumValues,
          required: paymentStatusPath.isRequired,
          default: paymentStatusPath.defaultValue
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error debugging contract:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to debug contract' },
      { status: 500 }
    );
  }
}
