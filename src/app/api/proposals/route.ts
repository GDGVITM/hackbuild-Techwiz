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

    const query = jobId ? { jobId } : { studentId: userId };
    const proposals = await Proposal.find(query)
      .populate('jobId', 'title')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

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

    const proposal = new Proposal({
      ...proposalData,
      studentId: userId,
    });

    await proposal.save();
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}