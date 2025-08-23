// src/app/api/contracts/[id]/sign/route.ts
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
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is authorized to sign this contract
    if (contract.businessId.toString() !== userId && contract.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if contract is ready for signing (payment completed)
    if (contract.paymentStatus !== 'paid') {
      return NextResponse.json({ 
        error: 'Contract must be paid before it can be signed' 
      }, { status: 400 });
    }
    
    const { signature, signatureType } = body;
    
    if (!signature || !signatureType) {
      return NextResponse.json({ 
        error: 'Signature and signatureType are required' 
      }, { status: 400 });
    }
    
    if (!['business', 'student'].includes(signatureType)) {
      return NextResponse.json({ 
        error: 'Invalid signatureType. Must be "business" or "student"' 
      }, { status: 400 });
    }
    
    // Update the appropriate signature field
    if (signatureType === 'business') {
      if (contract.businessId.toString() !== userId) {
        return NextResponse.json({ 
          error: 'Only the business owner can sign as business' 
        }, { status: 403 });
      }
      
      contract.businessSignature = signature;
      contract.businessSignedAt = new Date();
    } else {
      if (contract.studentId.toString() !== userId) {
        return NextResponse.json({ 
          error: 'Only the student can sign as student' 
        }, { status: 403 });
      }
      
      contract.studentSignature = signature;
      contract.studentSignedAt = new Date();
    }
    
    // Check if both parties have signed
    if (contract.businessSignature && contract.studentSignature) {
      contract.status = 'signed';
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
      message: 'Signature saved successfully',
      contract: updatedContract
    });
    
  } catch (error: any) {
    console.error('Error saving signature:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to save signature' },
      { status: 500 }
    );
  }
}
