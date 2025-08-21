"use client"

import { useState } from "react"
import { JobCard } from "./job-card"
import { JobDetailModal } from "./job-detail-modal"

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
  skillsRequired: string[]
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find((j) => j._id === jobId)
    if (job) {
      setSelectedJob(job)
      setIsModalOpen(true)
    }
    onViewDetails?.(jobId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No jobs found</p>
        <p className="text-muted-foreground text-sm mt-2">Check back later for new opportunities</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onApply={onApply} onViewDetails={handleViewDetails} />
        ))}
      </div>

      <JobDetailModal job={selectedJob} isOpen={isModalOpen} onClose={handleCloseModal} onApply={onApply} />
    </>
  )
}
