'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/business/JobCard';
import { Job } from '@/types/job';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  _id: string;
  jobId: string;
  status: string;
}

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        if (response.ok) {
          setJobs(data.jobs);
        } else {
          setError(data.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/proposals', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          setProposals(data.proposals);
        }
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      }
    };
    fetchProposals();
  }, [token]);

  // Create a set of job IDs that the student has already applied to
  const appliedJobIds = new Set(proposals.map(p => p.jobId));
  // Get the status of a proposal for a specific job
  const getProposalStatus = (jobId: string) => {
    const proposal = proposals.find(p => p.jobId === jobId);
    return proposal ? proposal.status : null;
  };

  if (loading) {
    return <div className="text-center py-10">Loading jobs...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }
  if (jobs.length === 0) {
    return <div className="text-center py-10">No jobs available at the moment.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <Link href="/dashboard/student/proposals">
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            My Proposals
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const hasApplied = appliedJobIds.has(job._id);
          const proposalStatus = getProposalStatus(job._id);
          
          return (
            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
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
                <p className="text-gray-600 mb-2">{job.description.substring(0, 100)}...</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.skillsRequired.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">
                    ${job.budgetMin} - ${job.budgetMax}
                  </span>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/student/jobs/${job._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </Link>
                    {!hasApplied && (
                      <Link href={`/dashboard/student/jobs/${job._id}?action=submit`}>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                          Submit Proposal
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}