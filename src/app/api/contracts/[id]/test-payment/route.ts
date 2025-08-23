// src/app/api/contracts/[id]/test-payment/route.ts
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
    
    // Log the current contract state
    console.log('Test Payment - Current contract state:', {
      id: contract._id,
      paymentStatus: contract.paymentStatus,
      status: contract.status,
      businessId: contract.businessId,
      studentId: contract.studentId,
      totalAmount: contract.totalAmount,
      title: contract.title,
      description: contract.description,
      terms: contract.terms,
      startDate: contract.startDate,
      endDate: contract.endDate,
      milestones: contract.milestones
    });
    
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
    
    // Ensure paymentStatus is valid
    if (contract.paymentStatus && !['pending', 'partial', 'completed'].includes(contract.paymentStatus)) {
      console.log('Test Payment - Invalid paymentStatus detected, resetting to pending');
      contract.paymentStatus = 'pending';
    }
    
    // Also handle cases where paymentStatus might be null/undefined
    if (!contract.paymentStatus) {
      console.log('Test Payment - No paymentStatus detected, setting to pending');
      contract.paymentStatus = 'pending';
    }
    
    if (contract.paymentStatus === 'completed') {
      return NextResponse.json({ 
        error: 'Payment has already been made for this contract' 
      }, { status: 400 });
    }

    // Simulate successful payment for testing
    contract.paymentStatus = 'completed';
    contract.razorpayOrderId = `test_order_${Date.now()}`;
    contract.razorpayPaymentId = `test_payment_${Date.now()}`;
    contract.razorpaySignature = `test_signature_${Date.now()}`;
    contract.updatedAt = new Date();
    
    console.log('Test Payment - Contract before save:', {
      id: contract._id,
      paymentStatus: contract.paymentStatus,
      status: contract.status,
      totalAmount: contract.totalAmount,
      title: contract.title
    });
    
    // Check if all required fields are present
    const requiredFields = ['title', 'description', 'totalAmount', 'startDate', 'endDate', 'terms'];
    const missingFields = requiredFields.filter(field => !contract[field as keyof typeof contract]);
    
    if (missingFields.length > 0) {
      console.error('Test Payment - Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Check if milestones have all required fields
    if (contract.milestones && contract.milestones.length > 0) {
      const milestoneRequiredFields = ['title', 'description', 'amount', 'dueDate'];
      const invalidMilestones = contract.milestones.filter((milestone: any, index: number) => {
        const missingMilestoneFields = milestoneRequiredFields.filter(field => !milestone[field]);
        if (missingMilestoneFields.length > 0) {
          console.error(`Test Payment - Milestone ${index} missing fields:`, missingMilestoneFields);
          return true;
        }
        return false;
      });
      
      if (invalidMilestones.length > 0) {
        return NextResponse.json({ 
          error: `Invalid milestones: missing required fields` 
        }, { status: 400 });
      }
    }
    
    // Validate the contract before saving
    try {
      console.log('Test Payment - Starting contract validation...');
      await contract.validate();
      console.log('Test Payment - Contract validation passed');
    } catch (validationError: any) {
      console.error('Test Payment - Contract validation error:', validationError);
      console.error('Test Payment - Validation error details:', {
        name: validationError.name,
        message: validationError.message,
        errors: validationError.errors
      });
      
      // Try to fix common validation issues
      console.log('Test Payment - Attempting to fix validation issues...');
      
      // Ensure all required fields have default values
      if (!contract.title) contract.title = 'Contract';
      if (!contract.description) contract.description = 'Contract description';
      if (!contract.terms) contract.terms = 'Contract terms and conditions';
      if (!contract.startDate) contract.startDate = new Date();
      if (!contract.endDate) contract.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (!contract.totalAmount) contract.totalAmount = 0;
      
      // Ensure milestones have required fields
      if (contract.milestones && contract.milestones.length > 0) {
        contract.milestones = contract.milestones.map((milestone: any) => ({
          title: milestone.title || 'Milestone',
          description: milestone.description || 'Milestone description',
          amount: milestone.amount || 0,
          dueDate: milestone.dueDate || new Date(),
          status: milestone.status || 'pending'
        }));
      }
      
      // Try validation again
      try {
        console.log('Test Payment - Retrying validation after fixes...');
        await contract.validate();
        console.log('Test Payment - Contract validation passed after fixes');
      } catch (retryError: any) {
        console.error('Test Payment - Contract validation still failing after fixes:', retryError);
        
        // Last resort: try to create a new contract object with clean data
        console.log('Test Payment - Attempting to create new contract object...');
        try {
          const cleanContract = new Contract({
            _id: contract._id,
            proposalId: contract.proposalId,
            jobId: contract.jobId,
            businessId: contract.businessId,
            studentId: contract.studentId,
            title: contract.title || 'Contract',
            description: contract.description || 'Contract description',
            totalAmount: contract.totalAmount || 0,
            startDate: contract.startDate || new Date(),
            endDate: contract.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            terms: contract.terms || 'Contract terms and conditions',
            status: contract.status || 'pending',
            paymentStatus: 'completed',
            razorpayOrderId: `test_order_${Date.now()}`,
            razorpayPaymentId: `test_payment_${Date.now()}`,
            razorpaySignature: `test_signature_${Date.now()}`,
            updatedAt: new Date(),
            milestones: contract.milestones || []
          });
          
          console.log('Test Payment - Clean contract created, attempting to save...');
          await cleanContract.save();
          console.log('Test Payment - Clean contract saved successfully');
          
          return NextResponse.json({
            success: true,
            message: 'Test payment completed successfully (using clean contract)',
            contract: cleanContract
          });
          
        } catch (cleanError: any) {
          console.error('Test Payment - Clean contract creation failed:', cleanError);
          return NextResponse.json({ 
            error: `All attempts to fix contract failed: ${cleanError.message}`,
            originalError: retryError.message
          }, { status: 400 });
        }
      }
    }
    
    // Save the contract
    try {
      await contract.save();
      console.log('Test Payment - Contract saved successfully');
    } catch (saveError: any) {
      console.error('Test Payment - Contract save error:', saveError);
      return NextResponse.json({ 
        error: `Failed to save contract: ${saveError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test payment completed successfully',
      contract
    });
    
  } catch (error: any) {
    console.error('Error processing test payment:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process test payment' },
      { status: 500 }
    );
  }
}
