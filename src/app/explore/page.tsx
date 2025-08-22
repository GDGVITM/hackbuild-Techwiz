"use client"
import { JobList } from "@/components/jobs/job-list"
import { useEffect, useState } from "react"

// Define the Job interface in this file or import it from a shared types file
interface Job {
  _id: string
  businessId: string
  title: string
  description: string
  skillsRequired: string[]
  budgetMin: number
  budgetMax: number
  milestones: Array<{
    title: string
    amount: number
    dueDate: Date
  }>
  status: "open" | "closed"
  createdAt: Date
  updatedAt: Date
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        if (response.ok) {
          // Transform the data to match the Job interface if needed
          const transformedJobs = data.jobs.map((job: any) => ({
            ...job,
            budgetMin: job.budgetMin || job.budget,
            budgetMax: job.budgetMax || job.budget,
            skillsRequired: job.skillsRequired || job.skills || [],
            milestones: job.milestones || [],
            status: job.status || "open",
            createdAt: new Date(job.createdAt),
            updatedAt: new Date(job.updatedAt)
          }));
          setJobs(transformedJobs);
        } else {
          setError(data.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const handleApply = (jobId: string) => {
    console.log("Apply to job:", jobId)
    // Handle job application logic
  }

  const handleViewDetails = (jobId: string) => {
    console.log("View job details:", jobId)
    // Handle view details logic
  }

  if (loading) {
    return <div className="text-center py-10">Loading jobs...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <p className="text-lg">No jobs available at the moment.</p>
          <p className="text-muted-foreground mt-2">Check back later for new opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Jobs</h1>
        <p className="text-muted-foreground">Find your next freelance opportunity</p>
      </div>
      <JobList
        jobs={jobs}
        onApply={handleApply}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}