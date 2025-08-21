import { NextRequest, NextResponse } from 'next/server';
import Proposal from '@/lib/models/Proposal';
import Job from '@/lib/models/Job';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    
    const proposal = await Proposal.findById(params.id)
      .populate('jobId', 'title')
      .populate('studentId', 'name email');
    
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check if the user is the owner of the proposal or the business owner of the job
    const job = await Job.findById(proposal.jobId);
    if (proposal.studentId._id.toString() !== userId && job.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Failed to fetch proposal:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const { status, coverLetter, milestones, quoteAmount } = await request.json();
    
    const proposal = await Proposal.findById(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Check if the user is the owner of the proposal
    if (proposal.studentId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update the proposal
    if (status) proposal.status = status;
    if (coverLetter) proposal.coverLetter = coverLetter;
    if (milestones) proposal.milestones = milestones;
    if (quoteAmount) proposal.quoteAmount = quoteAmount;
    
    await proposal.save();
    
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Failed to update proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}