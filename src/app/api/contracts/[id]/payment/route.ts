// src/app/api/contracts/[id]/payment/route.ts
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
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is the business owner of this contract
    if (contract.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Only the business owner can make payments' }, { status: 403 });
    }
    
    // Check if contract is approved and payment is pending
    if (contract.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Contract must be approved before payment can be made' 
      }, { status: 400 });
    }
    
    if (contract.paymentStatus === 'paid') {
      return NextResponse.json({ 
        error: 'Payment has already been made for this contract' 
      }, { status: 400 });
    }
    
    // TODO: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
    // For now, we'll simulate a successful payment
    
    // Update payment status
    contract.paymentStatus = 'paid';
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
      message: 'Payment processed successfully',
      contract: updatedContract
    });
    
  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}
