'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/business/JobCard';
import { Job } from '@/types/job';
import CreateJobForm from './CreateJobForm';

export default function BusinessDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowCreateForm(false);
  };

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
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard/business/proposals">
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
              View Proposals
            </button>
          </Link>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Post New Job'}
          </button>
        </div>
      </div>
      {showCreateForm && (
        <div className="mb-8">
          <CreateJobForm onJobCreated={handleJobCreated} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}