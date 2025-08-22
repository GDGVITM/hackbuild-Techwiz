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
    const proposalId = params.id;

    const proposal = await Proposal.findById(proposalId)
      .populate('jobId', 'title description businessId')
      .populate('studentId', 'name email');

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if user has permission to view this proposal
    const job = await Job.findById(proposal.jobId._id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Allow access if user is the student who submitted the proposal or the business owner
    if (proposal.studentId._id !== userId && job.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ proposal });
  } catch (error) {
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

    const { userId, role } = verifyToken(token);
    const proposalId = params.id;
    const { status, reason } = await request.json();

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if user is the business owner of the job
    const job = await Job.findById(proposal.jobId);
    if (!job || job.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate status
    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update proposal status
    proposal.status = status;
    
    // Add to status history
    if (!proposal.statusHistory) {
      proposal.statusHistory = [];
    }
    
    proposal.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: userId,
      reason: reason || `Status changed to ${status}`
    });

    await proposal.save();

    // If proposal is accepted, close the job
    if (status === 'accepted') {
      job.status = 'closed';
      await job.save();
    }

    // Return populated proposal
    const updatedProposal = await Proposal.findById(proposalId)
      .populate('jobId', 'title description businessId')
      .populate('studentId', 'name email');

    return NextResponse.json({ 
      proposal: updatedProposal,
      message: `Proposal status updated to ${status}`
    });
  } catch (error) {
    console.error('Failed to update proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}