// src/app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Proposal from '@/lib/models/Proposal';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    let query: any = {};
    
    // If jobId is provided, get proposals for that job
    if (jobId) {
      query.jobId = jobId;
    } else {
      // Otherwise, get proposals for the current user
      query.studentId = userId;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const proposals = await Proposal.find(query)
      .populate('jobId', 'title description businessId')
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    return NextResponse.json({ proposals });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const proposalData = await request.json();

    // Check if student already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({
      jobId: proposalData.jobId,
      studentId: userId
    });

    if (existingProposal) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 400 });
    }

    const proposal = new Proposal({
      ...proposalData,
      studentId: userId,
      milestones: proposalData.milestones.map(m => ({
        ...m,
        dueDate: new Date(m.dueDate)
      }))
    });

    await proposal.save();
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}