'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';
import ProposalList from '@/components/business/ProposalList';

export default function BusinessJobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setJob(data.job);
      } catch (error) {
        console.error('Failed to fetch job:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) return <div className="text-center py-10">Loading job details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!job) return <div className="text-center py-10">Job not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Proposals</h2>
        <ProposalList jobId={jobId} />
      </div>
    </div>
  );
}