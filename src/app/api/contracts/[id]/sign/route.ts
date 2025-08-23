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
    const { signature, signatureType } = await request.json();
    
    if (!signature || !signatureType) {
      return NextResponse.json({ error: 'Signature and signatureType are required' }, { status: 400 });
    }
    
    if (!['business', 'student'].includes(signatureType)) {
      return NextResponse.json({ error: 'Invalid signatureType. Must be "business" or "student"' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    // Verify the user is authorized to sign
    if (signatureType === 'business' && contract.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Only the business owner can sign as business' }, { status: 403 });
    }
    
    if (signatureType === 'student' && contract.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Only the student can sign as student' }, { status: 403 });
    }
    
    // Check if payment is completed
    if (contract.paymentStatus !== 'completed') {
      return NextResponse.json({ error: 'Payment must be completed before signing' }, { status: 400 });
    }
    
    // Check if already signed
    if (signatureType === 'business' && contract.businessSignature) {
      return NextResponse.json({ error: 'Business has already signed this contract' }, { status: 400 });
    }
    
    if (signatureType === 'student' && contract.studentSignature) {
      return NextResponse.json({ error: 'Student has already signed this contract' }, { status: 400 });
    }
    
    // Save the signature
    if (signatureType === 'business') {
      contract.businessSignature = signature;
      contract.businessSignedAt = new Date();
    } else {
      contract.studentSignature = signature;
      contract.studentSignedAt = new Date();
    }
    
    // Update contract status to signed if both parties have signed
    if (contract.businessSignature && contract.studentSignature) {
      contract.status = 'signed';
    }
    
    contract.updatedAt = new Date();
    
    // Save the contract
    await contract.save();
    
    return NextResponse.json({
      success: true,
      message: `${signatureType} signature saved successfully`,
      contract: {
        id: contract._id,
        status: contract.status,
        businessSignature: contract.businessSignature ? 'signed' : 'pending',
        studentSignature: contract.studentSignature ? 'signed' : 'pending',
        businessSignedAt: contract.businessSignedAt,
        studentSignedAt: contract.studentSignedAt
      }
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
