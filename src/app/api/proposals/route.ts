// src/app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Proposal from '@/lib/models/Proposal';
import Job from '@/lib/models/Job';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let query: any = {};
    
    // If jobId is provided, get proposals for that job
    if (jobId) {
      // For business users, verify they own the job
      if (role === 'business') {
        const job = await Job.findById(jobId);
        if (!job || job.businessId.toString() !== userId) {
          return NextResponse.json({ error: 'Unauthorized to view proposals for this job' }, { status: 403 });
        }
      }
      query.jobId = jobId;
    } else {
      // If no jobId provided, get proposals based on user role
      if (role === 'student') {
        query.studentId = userId;
      } else if (role === 'business') {
        // Get all jobs owned by this business, then get proposals for those jobs
        const businessJobs = await Job.find({ businessId: userId }).select('_id');
        const jobIds = businessJobs.map(job => job._id);
        query.jobId = { $in: jobIds };
      }
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const proposals = await Proposal.find(query)
      .populate('jobId', 'title description businessId budgetMin budgetMax')
      .populate('studentId', 'name email')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await Proposal.countDocuments(query);

    return NextResponse.json({ 
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = verifyToken(token);
    
    // Only students can submit proposals
    if (role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit proposals' }, { status: 403 });
    }

    const proposalData = await request.json();

    // Check if student already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({
      jobId: proposalData.jobId,
      studentId: userId
    });

    if (existingProposal) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 400 });
    }

    // Validate milestone amounts match quote amount
    const totalMilestoneAmount = proposalData.milestones.reduce((sum: number, m: any) => sum + m.amount, 0);
    if (Math.abs(totalMilestoneAmount - proposalData.quoteAmount) > 0.01) {
      return NextResponse.json({ error: 'Total milestone amounts must equal the quote amount' }, { status: 400 });
    }

    const proposal = new Proposal({
      ...proposalData,
      studentId: userId,
      milestones: proposalData.milestones.map((m: any) => ({
        ...m,
        dueDate: new Date(m.dueDate),
        status: 'pending'
      })),
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        reason: 'Proposal submitted'
      }]
    });

    await proposal.save();
    
    // Populate the saved proposal for response
    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('jobId', 'title description businessId')
      .populate('studentId', 'name email');

    return NextResponse.json({ proposal: populatedProposal }, { status: 201 });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}