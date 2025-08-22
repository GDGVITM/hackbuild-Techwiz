"use client"

import { JobList } from "@/components/jobs/job-list"

// Mock data for demonstration
const mockJobs = [
  {
    _id: "1",
    businessId: "business1",
    title: "Full-Stack Developer for E-commerce Platform",
    description:
      "We're looking for an experienced full-stack developer to build a modern e-commerce platform with React, Node.js, and MongoDB. The project includes user authentication, payment processing, and admin dashboard.",
    skillsRequired: ["React", "Node.js", "MongoDB", "TypeScript", "Stripe", "AWS"],
    budgetMin: 5000,
    budgetMax: 8000,
    milestones: [
      {
        title: "Frontend Setup & Authentication",
        amount: 2000,
        dueDate: new Date("2024-02-15"),
      },
      {
        title: "Backend API & Database",
        amount: 2500,
        dueDate: new Date("2024-03-01"),
      },
      {
        title: "Payment Integration & Testing",
        amount: 1500,
        dueDate: new Date("2024-03-15"),
      },
    ],
    status: "open" as const,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "2",
    businessId: "business2",
    title: "Mobile App UI/UX Design",
    description:
      "Design a clean and modern mobile app interface for a fitness tracking application. Need wireframes, mockups, and a complete design system.",
    skillsRequired: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping"],
    budgetMin: 2000,
    budgetMax: 3500,
    milestones: [
      {
        title: "Wireframes & User Flow",
        amount: 1000,
        dueDate: new Date("2024-02-10"),
      },
      {
        title: "High-Fidelity Mockups",
        amount: 1500,
        dueDate: new Date("2024-02-25"),
      },
    ],
    status: "open" as const,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    _id: "3",
    businessId: "business3",
    title: "WordPress Website Migration",
    description:
      "Migrate existing WordPress site to a new hosting provider and optimize for performance. Includes SSL setup and backup configuration.",
    skillsRequired: ["WordPress", "PHP", "MySQL", "cPanel", "SSL"],
    budgetMin: 800,
    budgetMax: 1200,
    milestones: [],
    status: "closed" as const,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
  },
]

export default function HomePage() {
  const handleApply = (jobId: string) => {
    console.log("Apply to job:", jobId)
    // Handle job application logic
  }

  const handleViewDetails = (jobId: string) => {
    console.log("View job details:", jobId)
    // Handle view details logic
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Jobs</h1>
        <p className="text-muted-foreground">Find your next freelance opportunity</p>
      </div>

      <JobList jobs={mockJobs} onApply={handleApply} onViewDetails={handleViewDetails} />
    </div>
  )
}
