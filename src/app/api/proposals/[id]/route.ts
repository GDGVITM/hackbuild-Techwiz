// src/app/api/proposals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Proposal from '@/lib/models/Proposal';
import Job from '@/lib/models/Job';
import { verifyToken } from '@/lib/auth/jwt';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const { status } = await request.json();

    const proposal = await Proposal.findById(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if the user is the business owner of the job
    const job = await Job.findById(proposal.jobId);
    if (!job || job.businessId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    proposal.status = status;
    await proposal.save();

    // If proposal is accepted, create a contract
    if (status === 'accepted') {
      // Contract creation logic will be implemented in the next step
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}