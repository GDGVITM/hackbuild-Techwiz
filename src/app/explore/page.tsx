"use client"
import { JobList } from "@/components/jobs/job-list"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Define the Job interface
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
    if (!user) {
      // Store the job ID in session storage to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', `/jobs/${jobId}`);
      router.push('/auth/login');
      return;
    }
    console.log("Apply to job:", jobId)
    // Handle job application logic for authenticated users
  }
  
  const handleViewDetails = (jobId: string) => {
    console.log("View job details:", jobId)
    // Handle view details logic
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
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
      
      {/* Show login prompt for unauthenticated users */}
      {!user && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Want to apply for these jobs?</CardTitle>
            <CardDescription>
              Create an account or log in to apply for jobs and manage your applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Log In
              </Button>
              <Button 
                onClick={() => router.push('/auth/register')}
                variant="outline"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <JobList
        jobs={jobs}
        onApply={handleApply}
        onViewDetails={handleViewDetails}
        isAuthenticated={!!user}
      />
    </div>
  )
}