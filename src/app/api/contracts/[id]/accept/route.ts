import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;
    
    // Replace this with your actual database update
    // This is a mock implementation
    const updatedContract = {
      _id: contractId,
      title: 'Web Development Agreement',
      content: `
        <h2>Web Development Agreement</h2>
        <p>This agreement is made between Tech Company Inc. and the developer...</p>
        <h3>Project Scope</h3>
        <ul>
          <li>Design and development of a responsive website</li>
          <li>Integration with existing systems</li>
          <li>Testing and deployment</li>
        </ul>
        <h3>Payment Terms</h3>
        <p>Total project cost: $4,000</p>
        <p>Payment schedule as per milestones</p>
      `,
      createdAt: '2023-05-15',
      status: 'signed',
      changeRequests: [],
      proposal: {
        jobId: {
          title: 'Web Development Project',
          businessId: {
            name: 'Tech Company Inc.',
          },
        },
      },
    };

    return NextResponse.json({ contract: updatedContract });
  } catch (error) {
    console.error('Error accepting contract:', error);
    return NextResponse.json(
      { error: 'Failed to accept contract' },
      { status: 500 }
    );
  }
}