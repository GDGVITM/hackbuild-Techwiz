// src/app/api/contracts/[id]/reset-payment/route.ts
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
      return NextResponse.json({ error: 'Only the business owner can reset payment status' }, { status: 403 });
    }
    
    console.log('Reset Payment - Current contract state:', {
      id: contract._id,
      paymentStatus: contract.paymentStatus,
      status: contract.status
    });
    
    // Reset payment status to pending
    contract.paymentStatus = 'pending';
    contract.razorpayOrderId = undefined;
    contract.razorpayPaymentId = undefined;
    contract.razorpaySignature = undefined;
    contract.updatedAt = new Date();
    
    console.log('Reset Payment - Contract after reset:', {
      id: contract._id,
      paymentStatus: contract.paymentStatus,
      status: contract.status
    });
    
    // Save the contract
    try {
      await contract.save();
      console.log('Reset Payment - Contract saved successfully');
    } catch (saveError: any) {
      console.error('Reset Payment - Contract save error:', saveError);
      return NextResponse.json({ 
        error: `Failed to save contract: ${saveError.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment status reset successfully',
      contract: {
        id: contract._id,
        paymentStatus: contract.paymentStatus,
        status: contract.status
      }
    });
    
  } catch (error: any) {
    console.error('Error resetting payment status:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to reset payment status' },
      { status: 500 }
    );
  }
}
