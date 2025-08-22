// src/app/api/proposals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/utils/auth';
import Proposal from '@/lib/models/Proposal';
import Job from '@/lib/models/Job';
import dbConnect from '@/lib/db/mongoose';

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
    const user = getUserFromRequest(request);
    if (!user) {
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
      query.jobId = jobId;
    } else {
      // If no jobId provided, get proposals based on user role
      if (user.role === 'student') {
        query.studentId = user.userId;
      } else if (user.role === 'business') {
        // Get all jobs owned by this business, then get proposals for those jobs
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

    const proposals = await Proposal.find(query)
      .populate('jobId', 'title description createdBy budgetMin budgetMax')
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
    const user = getUserFromRequest(request);
    if (!user) {
      return createUnauthorizedResponse('Authentication required');
    }

    // Only students can submit proposals
    if (user.role !== 'student') {
      return createForbiddenResponse('Only students can submit proposals');
    }

    await dbConnect();

    const proposalData: ProposalData = await request.json();

    // Check if student already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({
      jobId: proposalData.jobId,
      studentId: user.userId
    });

    if (existingProposal) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 400 });
    }

    // Validate milestone amounts match quote amount
    const totalMilestoneAmount = proposalData.milestones.reduce((sum: number, m: MilestoneData) => sum + m.amount, 0);
    if (Math.abs(totalMilestoneAmount - proposalData.quoteAmount) > 0.01) {
      return NextResponse.json({
        error: 'Total milestone amounts must equal the quote amount',
        details: {
          totalMilestoneAmount,
          quoteAmount: proposalData.quoteAmount,
          difference: Math.abs(totalMilestoneAmount - proposalData.quoteAmount)
        }
      }, { status: 400 });
    }

    // Validate quote amount is within job budget range
    const job = await Job.findById(proposalData.jobId);
    if (job) {
      if (proposalData.quoteAmount < job.budgetMin) {
        return NextResponse.json({
          error: `Quote amount ($${proposalData.quoteAmount}) is below the job's minimum budget ($${job.budgetMin})`,
          details: {
            quoteAmount: proposalData.quoteAmount,
            budgetMin: job.budgetMin,
            budgetMax: job.budgetMax
          }
        }, { status: 400 });
      }

      if (proposalData.quoteAmount > job.budgetMax) {
        return NextResponse.json({
          error: `Quote amount ($${proposalData.quoteAmount}) exceeds the job's maximum budget ($${job.budgetMax})`,
          details: {
            quoteAmount: proposalData.quoteAmount,
            budgetMin: job.budgetMin,
            budgetMax: job.budgetMax
          }
        }, { status: 400 });
      }
    }

    // Validate milestone due dates are in the future
    const currentDate = new Date();
    const invalidMilestones = proposalData.milestones.filter((m: MilestoneData) => {
      const dueDate = new Date(m.dueDate);
      return dueDate <= currentDate;
    });

    if (invalidMilestones.length > 0) {
      return NextResponse.json({
        error: 'Milestone due dates must be in the future',
        details: {
          invalidMilestones: invalidMilestones.map((m: MilestoneData) => ({
            title: m.title,
            dueDate: m.dueDate
          }))
        }
      }, { status: 400 });
    }

    const newProposal = new Proposal({
      ...proposalData,
      studentId: user.userId,
      milestones: proposalData.milestones.map((m: MilestoneData) => ({
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

    await newProposal.save();

    // Populate the saved proposal for response
    const populatedProposal = await Proposal.findById(newProposal._id)
      .populate('jobId', 'title description createdBy')
      .populate('studentId', 'name email');

    return NextResponse.json({ proposal: populatedProposal }, { status: 201 });
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
