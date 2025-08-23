// src/app/api/ai/generate-contract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateContract, ContractInput } from '@/lib/ai/contractGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContractInput;
    
    // Validate required fields
    const requiredFields = ['jobTitle', 'jobDescription', 'studentName', 'businessName', 'milestones', 'totalAmount', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!body[field as keyof ContractInput]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const contractText = await generateContract(body);
    
    return NextResponse.json({
      success: true,
      contract: contractText
    });
  } catch (error: any) {
    console.error('Error generating contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate contract' },
      { status: 500 }
    );
  }
}