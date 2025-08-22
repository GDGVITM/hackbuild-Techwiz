'use client';
import { useState } from 'react';
import ProposalForm from '@/components/student/ProposalForm';

export default function TestProposalPage() {
  const [submitted, setSubmitted] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Proposal Form</h1>
      
      {submitted ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Proposal submitted successfully!
        </div>
      ) : (
        <ProposalForm 
          jobId="68a76ff75001bbf81fc90088" 
          onProposalSubmitted={() => setSubmitted(true)} 
        />
      )}
    </div>
  );
}