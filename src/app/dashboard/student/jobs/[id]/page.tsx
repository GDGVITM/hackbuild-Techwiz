'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProposalForm from '@/components/student/ProposalForm';
import { Job } from '@/types/job';
import { useAuth } from '@/context/AuthContext';

export default function JobDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const action = searchParams.get('action');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchJobAndProposalStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        
        if (!jobResponse.ok) {
          const errorData = await jobResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${jobResponse.status}`);
        }
        
        const jobData = await jobResponse.json();
        setJob(jobData.job);
        
        // Check if student has already applied
        if (user?.role === 'student' && token) {
          const proposalsResponse = await fetch('/api/proposals', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (proposalsResponse.ok) {
            const proposalsData = await proposalsResponse.json();
            const userProposal = proposalsData.proposals?.find(
              (p: any) => p.jobId === jobId
            );
            
            if (userProposal) {
              setHasApplied(true);
              setProposalStatus(userProposal.status);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndProposalStatus();
  }, [jobId, user, token]);

  if (loading) return <div className="text-center py-10">Loading job details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!job) return <div className="text-center py-10">Job not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">
                ${job.budgetMin} - ${job.budgetMax}
              </span>
              {hasApplied && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  proposalStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                  proposalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {proposalStatus === 'accepted' ? 'Accepted' :
                   proposalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              )}
            </div>
          </div>
          
          {user?.role === 'student' && !hasApplied && (
            <Button onClick={() => {
              const element = document.getElementById('proposal-form');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              Submit Proposal
            </Button>
          )}
        </div>
        
        <p className="text-gray-700 mb-6">{job.description}</p>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
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
      </div>
      
      {/* Always show the proposal form for testing */}
      {user?.role === 'student' && (
        <div id="proposal-form" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Submit Proposal</h2>
          
          {hasApplied ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                You have already submitted a proposal for this job. 
                Status: <span className="font-semibold">{proposalStatus}</span>
              </p>
              <div className="mt-4">
                <a href="/dashboard/student/proposals" className="text-blue-600 hover:text-blue-800">
                  View all your proposals
                </a>
              </div>
            </div>
          ) : (
            <ProposalForm 
              jobId={jobId} 
              onProposalSubmitted={() => {
                setHasApplied(true);
                setProposalStatus('pending');
              }} 
            />
          )}
        </div>
      )}
    </div>
  );
}