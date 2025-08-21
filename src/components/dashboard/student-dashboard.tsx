"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock3,
  MessageCircle,
  Briefcase,
  GraduationCap,
} from "lucide-react"

// Mock data for available jobs
const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "Internship",
    salary: "$25/hour",
    description:
      "Join our dynamic team as a Frontend Developer Intern. Work on cutting-edge web applications using React, TypeScript, and modern development tools.",
    requirements: ["React", "JavaScript", "HTML/CSS", "Git"],
    postedDate: "2024-01-15",
    companyLogo: "/business-user.png",
  },
  {
    id: 2,
    title: "UX/UI Design Intern",
    company: "Creative Studios",
    location: "New York, NY",
    type: "Internship",
    salary: "$22/hour",
    description:
      "Design beautiful and intuitive user interfaces for mobile and web applications. Collaborate with product teams to create exceptional user experiences.",
    requirements: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    postedDate: "2024-01-14",
    companyLogo: "/business-user.png",
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Analytics Pro",
    location: "Boston, MA",
    type: "Internship",
    salary: "$28/hour",
    description:
      "Work with large datasets to extract meaningful insights. Build machine learning models and create data visualizations for business stakeholders.",
    requirements: ["Python", "SQL", "Machine Learning", "Statistics"],
    postedDate: "2024-01-13",
    companyLogo: "/business-user.png",
  },
  {
    id: 4,
    title: "Marketing Intern",
    company: "Brand Builders",
    location: "Los Angeles, CA",
    type: "Internship",
    salary: "$20/hour",
    description:
      "Support marketing campaigns across digital channels. Create content, analyze performance metrics, and assist with social media management.",
    requirements: ["Social Media", "Content Creation", "Analytics", "Communication"],
    postedDate: "2024-01-12",
    companyLogo: "/business-user.png",
  },
  {
    id: 5,
    title: "Software Engineering Intern",
    company: "DevTech Inc",
    location: "Seattle, WA",
    type: "Internship",
    salary: "$30/hour",
    description:
      "Develop scalable backend services and APIs. Work with cloud technologies and contribute to our microservices architecture.",
    requirements: ["Java", "Spring Boot", "AWS", "Docker"],
    postedDate: "2024-01-11",
    companyLogo: "/business-user.png",
  },
  {
    id: 6,
    title: "Product Management Intern",
    company: "Innovation Labs",
    location: "Austin, TX",
    type: "Internship",
    salary: "$26/hour",
    description:
      "Support product development lifecycle from ideation to launch. Conduct market research and work closely with engineering teams.",
    requirements: ["Product Strategy", "Market Research", "Agile", "Communication"],
    postedDate: "2024-01-10",
    companyLogo: "/business-user.png",
  },
  {
    id: 7,
    title: "Cybersecurity Intern",
    company: "SecureNet",
    location: "Washington, DC",
    type: "Internship",
    salary: "$27/hour",
    description:
      "Learn about cybersecurity best practices and help implement security measures. Assist with vulnerability assessments and security audits.",
    requirements: ["Network Security", "Ethical Hacking", "Risk Assessment", "Compliance"],
    postedDate: "2024-01-09",
    companyLogo: "/business-user.png",
  },
  {
    id: 8,
    title: "Mobile App Developer Intern",
    company: "AppCraft",
    location: "Miami, FL",
    type: "Internship",
    salary: "$24/hour",
    description:
      "Develop mobile applications for iOS and Android platforms. Work with cross-platform frameworks and native development tools.",
    requirements: ["React Native", "Swift", "Kotlin", "Mobile UI/UX"],
    postedDate: "2024-01-08",
    companyLogo: "/business-user.png",
  },
]

// Mock data for student applications
const mockApplications = [
  {
    id: 1,
    jobTitle: "Frontend Developer Intern",
    company: "TechCorp Solutions",
    status: "accepted",
    appliedDate: "2024-01-16",
    proposal: "I'm excited to apply for this position...",
  },
  {
    id: 2,
    jobTitle: "UX/UI Design Intern",
    company: "Creative Studios",
    status: "pending",
    appliedDate: "2024-01-15",
    proposal: "As a design student with experience in Figma...",
  },
  {
    id: 3,
    jobTitle: "Data Science Intern",
    company: "Analytics Pro",
    status: "declined",
    appliedDate: "2024-01-14",
    proposal: "My background in statistics and Python...",
  },
  {
    id: 4,
    jobTitle: "Marketing Intern",
    company: "Brand Builders",
    status: "accepted",
    appliedDate: "2024-01-13",
    proposal: "I have experience managing social media accounts...",
  },
  {
    id: 5,
    jobTitle: "Software Engineering Intern",
    company: "DevTech Inc",
    status: "pending",
    appliedDate: "2024-01-12",
    proposal: "I'm proficient in Java and have worked with Spring Boot...",
  },
  {
    id: 6,
    jobTitle: "Product Management Intern",
    company: "Innovation Labs",
    status: "pending",
    appliedDate: "2024-01-11",
    proposal: "My coursework in business strategy aligns well...",
  },
]

// Mock chat conversations for accepted applications
const mockChatConversations = [
  {
    id: 1,
    company: "TechCorp Solutions",
    jobTitle: "Frontend Developer Intern",
    lastMessage: "Great! When can you start?",
    timestamp: "2024-01-17T10:30:00Z",
    unread: 2,
    messages: [
      {
        id: 1,
        sender: "business",
        content: "Hi! We're excited to move forward with your application.",
        timestamp: "2024-01-17T09:00:00Z",
      },
      {
        id: 2,
        sender: "student",
        content: "Thank you! I'm very excited about this opportunity.",
        timestamp: "2024-01-17T09:15:00Z",
      },
      { id: 3, sender: "business", content: "Great! When can you start?", timestamp: "2024-01-17T10:30:00Z" },
    ],
  },
  {
    id: 2,
    company: "Brand Builders",
    jobTitle: "Marketing Intern",
    lastMessage: "Looking forward to working with you!",
    timestamp: "2024-01-16T14:20:00Z",
    unread: 0,
    messages: [
      {
        id: 1,
        sender: "business",
        content: "Congratulations! We'd like to offer you the position.",
        timestamp: "2024-01-16T13:00:00Z",
      },
      {
        id: 2,
        sender: "student",
        content: "Thank you so much! I accept the offer.",
        timestamp: "2024-01-16T13:30:00Z",
      },
      { id: 3, sender: "business", content: "Looking forward to working with you!", timestamp: "2024-01-16T14:20:00Z" },
    ],
  },
]

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("explore")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    portfolio: "",
    availability: "",
  })

  // Pagination states
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1)
  const [applicationsCurrentPage, setApplicationsCurrentPage] = useState(1)
  const jobsPerPage = 5
  const applicationsPerPage = 5

  // Chat states
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")

  // Filter jobs based on search term
  const filteredJobs = mockJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination logic for jobs
  const totalJobsPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const jobsStartIndex = (jobsCurrentPage - 1) * jobsPerPage
  const jobsEndIndex = jobsStartIndex + jobsPerPage
  const currentJobs = filteredJobs.slice(jobsStartIndex, jobsEndIndex)

  // Pagination logic for applications
  const totalApplicationsPages = Math.ceil(mockApplications.length / applicationsPerPage)
  const applicationsStartIndex = (applicationsCurrentPage - 1) * applicationsPerPage
  const applicationsEndIndex = applicationsStartIndex + applicationsPerPage
  const currentApplications = mockApplications.slice(applicationsStartIndex, applicationsEndIndex)

  const handleJobsPageChange = (page: number) => {
    setJobsCurrentPage(page)
  }

  const handleApplicationsPageChange = (page: number) => {
    setApplicationsCurrentPage(page)
  }

  const handleApplyToJob = (job: any) => {
    setSelectedJob(job)
    setApplicationForm({ coverLetter: "", portfolio: "", availability: "" })
  }

  const handleSubmitApplication = () => {
    // Here you would typically submit to your backend
    console.log("Submitting application:", { job: selectedJob, form: applicationForm })
    setSelectedJob(null)
    setApplicationForm({ coverLetter: "", portfolio: "", availability: "" })
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message = {
        id: selectedChat.messages.length + 1,
        sender: "student",
        content: newMessage,
        timestamp: new Date().toISOString(),
      }
      selectedChat.messages.push(message)
      setNewMessage("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock3 className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const acceptedConversations = mockChatConversations

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {/* <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900 font-sans">Student Portal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/professional-woman-diverse.png" alt="Student" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-900">Sarah Johnson</p>
              <p className="text-xs text-slate-500">Computer Science Student</p>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
            <TabsTrigger value="explore" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Explore Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>My Applications</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Explore Jobs Tab */}
          <TabsContent value="explore" className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {currentJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={job.companyLogo || "/placeholder.svg"} alt={job.company} />
                          <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900">{job.title}</CardTitle>
                          <CardDescription className="text-slate-600">{job.company}</CardDescription>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{job.title}</DialogTitle>
                              <DialogDescription>
                                {job.company} • {job.location}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Job Description</h4>
                                <p className="text-slate-600">{job.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Requirements</h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.requirements.map((req, index) => (
                                    <Badge key={index} variant="secondary">
                                      {req}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button onClick={() => handleApplyToJob(job)}>Apply Now</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button onClick={() => handleApplyToJob(job)}>Apply Now</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 4).map((req, index) => (
                        <Badge key={index} variant="secondary">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 4 && (
                        <Badge variant="secondary">+{job.requirements.length - 4} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Jobs Pagination */}
            {totalJobsPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJobsPageChange(jobsCurrentPage - 1)}
                  disabled={jobsCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalJobsPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === jobsCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleJobsPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJobsPageChange(jobsCurrentPage + 1)}
                  disabled={jobsCurrentPage === totalJobsPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-4">
              {currentApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
                        <CardDescription>{application.company}</CardDescription>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        Applied on {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Proposal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Application Proposal</DialogTitle>
                            <DialogDescription>
                              {application.jobTitle} at {application.company}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="font-semibold">Cover Letter</Label>
                              <p className="text-slate-600 mt-1">{application.proposal}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-500">Status:</span>
                              {getStatusBadge(application.status)}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Applications Pagination */}
            {totalApplicationsPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplicationsPageChange(applicationsCurrentPage - 1)}
                  disabled={applicationsCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalApplicationsPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === applicationsCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleApplicationsPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplicationsPageChange(applicationsCurrentPage + 1)}
                  disabled={applicationsCurrentPage === totalApplicationsPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Chat List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Messages</CardTitle>
                  <CardDescription>Chat with companies that accepted your applications</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {acceptedConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-slate-50 ${
                          selectedChat?.id === conversation.id ? "bg-indigo-50 border-indigo-200" : ""
                        }`}
                        onClick={() => setSelectedChat(conversation)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{conversation.company}</h4>
                          {conversation.unread > 0 && (
                            <Badge className="bg-indigo-600 text-white text-xs">{conversation.unread}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{conversation.jobTitle}</p>
                        <p className="text-sm text-slate-600 truncate">{conversation.lastMessage}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(conversation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="lg:col-span-2">
                {selectedChat ? (
                  <>
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg">{selectedChat.company}</CardTitle>
                      <CardDescription>{selectedChat.jobTitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-4">
                          {selectedChat.messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === "student" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                  message.sender === "student"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.sender === "student" ? "text-indigo-200" : "text-slate-500"
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Separator />
                      <div className="p-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          />
                          <Button onClick={handleSendMessage}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Select a conversation to start messaging</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Form Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply to {selectedJob.title}</DialogTitle>
              <DialogDescription>
                {selectedJob.company} • {selectedJob.location}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio/Resume Link</Label>
                <Input
                  id="portfolio"
                  placeholder="https://your-portfolio.com or link to resume"
                  value={applicationForm.portfolio}
                  onChange={(e) => setApplicationForm({ ...applicationForm, portfolio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="When can you start? (e.g., Immediately, After finals, etc.)"
                  value={applicationForm.availability}
                  onChange={(e) => setApplicationForm({ ...applicationForm, availability: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitApplication} disabled={!applicationForm.coverLetter.trim()}>
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
