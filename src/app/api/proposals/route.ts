// src/app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/utils/auth';
import Proposal from '@/lib/models/Proposal';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';
import { verifyAuthToken } from '@/lib/utils/auth';

interface MilestoneData {
  title: string;
  amount: number;
  dueDate: string;
}

interface ProposalData {
  jobId: string;
  coverLetter: string;
  milestones: MilestoneData[];
  quoteAmount: number;
}

interface QueryParams {
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Proposals API - Starting request...');

    let user = getUserFromRequest(request);
    console.log('Proposals API - User from headers:', user);

    if (!user) {
      console.log('Proposals API - No user from headers, trying token verification...');
      const payload = await verifyAuthToken(request);
      if (payload) {
        user = { userId: payload.userId, role: payload.role as 'student' | 'business' };
        console.log('Proposals API - User from token:', user);
      }
    }

    if (!user) {
      console.log('Proposals API - No authentication found');
      return createUnauthorizedResponse('Authentication required');
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: QueryParams = {};

    // If jobId is provided, get proposals for that job
    if (jobId) {
      // For business users, verify they own the job
      if (user.role === 'business') {
        const job = await Job.findById(jobId);
        if (!job || job.businessId.toString() !== user.userId) {
          return createForbiddenResponse('Unauthorized to view proposals for this job');
        }
      }
      // For students, verify they can only see proposals for jobs they can access
      else if (user.role === 'student') {
        // Students can only see proposals for open jobs
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'open') {
          return createForbiddenResponse('Job not accessible');
        }
      }
      query.jobId = jobId;
    } else {
      // If no jobId provided, get proposals based on user role
      if (user.role === 'student') {
        // Students can only see their own proposals
        query.studentId = user.userId;
      } else if (user.role === 'business') {
        // Business users can see proposals for all their jobs
        const businessJobs = await Job.find({ businessId: user.userId }).select('_id');
        const jobIds = businessJobs.map(job => job._id);
        query.jobId = { $in: jobIds };
      }
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort: QueryParams = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    console.log('Proposals API - Fetching proposals with query:', query);
    const proposals = await Proposal.find(query)
      .populate('jobId', 'title description businessId budgetMin budgetMax')
      .populate('studentId', 'name email')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await Proposal.countDocuments(query);

    console.log('Proposals API - Returning proposals:', proposals.length);
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
    console.error('Proposals API - Failed to fetch proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

// POST new proposal (only students)
export async function POST(request: NextRequest) {
  try {
    let user = getUserFromRequest(request);
    if (!user) {
      const payload = await verifyAuthToken(request);
      if (payload) {
        user = { userId: payload.userId, role: payload.role as 'student' | 'business' };
      }
    }
    if (!user) {
      return createUnauthorizedResponse('Authentication required');
    }

    // Only students can submit proposals
    if (user.role !== 'student') {
      return createForbiddenResponse('Only students can submit proposals');
    }

    const body: ProposalData = await request.json();
    const { jobId, coverLetter, milestones, quoteAmount } = body;

    if (!jobId || !coverLetter || !quoteAmount) {
      return NextResponse.json(
        { error: 'Job ID, cover letter, and quote amount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'open') {
      return NextResponse.json({ error: 'Job is not open for proposals' }, { status: 400 });
    }

    // Check if student already has a proposal for this job
    const existingProposal = await Proposal.findOne({
      jobId,
      studentId: user.userId
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this job' },
        { status: 400 }
      );
    }

    const proposal = new Proposal({
      jobId,
      studentId: user.userId,
      coverLetter,
      milestones: milestones || [],
      quoteAmount,
      status: 'pending'
    });

    await proposal.save();

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
