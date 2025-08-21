"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Clock, CheckCircle } from "lucide-react"

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

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onApply?: (jobId: string) => void
}

export function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  if (!job) return null

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
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const totalMilestoneAmount = job.milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
  const sortedMilestones = job.milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2 pr-8">{job.title}</DialogTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={job.status === "open" ? "default" : "secondary"} className="text-sm">
                  {job.status === "open" ? "Open Position" : "Closed"}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Budget</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Project Range:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
                </span>
              </div>
              {totalMilestoneAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Milestones:</span>
                  <span className="font-medium">{formatCurrency(totalMilestoneAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Project Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Skills Required Section */}
          {job.skillsRequired.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Section */}
          {job.milestones.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Project Milestones</h3>
              <div className="space-y-3">
                {sortedMilestones.map((milestone, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{milestone.title}</h4>
                      </div>
                      <Badge variant="secondary">{formatCurrency(milestone.amount)}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDateShort(milestone.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Close
            </Button>
            {job.status === "open" && (
              <Button
                onClick={() => {
                  onApply?.(job._id)
                  onClose()
                }}
                className="flex-1"
              >
                Apply for This Job
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
