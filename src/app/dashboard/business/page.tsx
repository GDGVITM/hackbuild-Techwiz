'use client';

import { useState } from 'react';

import JobCard from '@/components/business/JobCard';
import { Job } from '@/types/job';
import CreateJobForm from './CreateJobForm';

export default function BusinessDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowCreateForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Post New Job'}
        </button>
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