"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Clock } from "lucide-react"
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Milestone {
  title: string
  amount: number
  dueDate: Date
}

interface Job {
  _id: string
  businessId: string
  title: string
  description: string
  skills: string[]
  budgetMin: number
  budgetMax: number
  milestones: Milestone[]
  status: "open" | "closed"
  createdAt: Date
  updatedAt: Date
}

interface JobListProps {
  jobs: Job[]
  onApply?: (jobId: string) => void
  onViewDetails?: (jobId: string) => void
}

export function JobList({ jobs, onApply, onViewDetails }: JobListProps) {
  const { user } = useAuth();
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const handleApply = (jobId: string) => {
    if (user?.role === 'student') {
      router.push(`/dashboard/student/jobs/${jobId}?action=submit`);
    } else {
      onApply?.(jobId);
    }
  }

  const handleViewDetails = (jobId: string) => {
    if (user?.role === 'student') {
      router.push(`/dashboard/student/jobs/${jobId}`);
    } else if (user?.role === 'business') {
      router.push(`/dashboard/business/jobs/${jobId}`);
    } else {
      onViewDetails?.(jobId);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => {
        const totalMilestoneAmount = job.milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
        const nextMilestone = job.milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

        return (
          <Card key={job._id} className="w-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold line-clamp-2 mb-2">{job.title}</CardTitle>
                  <Badge variant={job.status === "open" ? "default" : "secondary"} className="mb-2">
                    {job.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{job.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Posted Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
              
              {/* Budget */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}</span>
              </div>
              
              {/* Skills Required */}
              {job.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Skills Required:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button onClick={() => handleViewDetails(job._id)} variant="outline" className="flex-1">
                View Details
              </Button>
              {job.status === "open" && (
                <Button onClick={() => handleApply(job._id)} className="flex-1">
                  Apply Now
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}