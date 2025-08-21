'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import Proposal from '@/lib/models/Proposal';


export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = await response.json();
        setJob(data.job);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) return <div>Loading job details...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
        <p className="text-gray-700 mb-4">{job.description}</p>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Budget</h2>
          <p className="text-green-600 font-medium">${job.budgetMin} - ${job.budgetMax}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Milestones</h2>
          <ul className="space-y-2">
            {job.milestones.map((milestone, index) => (
              <li key={index} className="flex justify-between border-b pb-2">
                <span>{milestone.title}</span>
                <span>${milestone.amount} (Due: {new Date(milestone.dueDate).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Submit Proposal</h2>
          <ProposalForm jobId={jobId} />
        </div>
      </div>
    </div>
  );
}