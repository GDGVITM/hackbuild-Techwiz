"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Plus,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type ApplicationStatus = "pending" | "accepted" | "declined"

interface JobApplication {
  id: string
  applicantName: string
  email: string
  phone: string
  position: string
  university: string
  gpa: string
  skills: string[]
  coverLetter: string
  appliedDate: string
  status: ApplicationStatus
  avatar?: string
}

interface JobPost {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  postedDate: string
  status: "active" | "closed"
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  isFromBusiness: boolean
}

interface ChatConversation {
  applicationId: string
  applicantName: string
  messages: ChatMessage[]
}

const mockApplications: JobApplication[] = [
  {
    id: "1",
    applicantName: "Sarah Johnson",
    email: "sarah.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    position: "Frontend Developer Intern",
    university: "Stanford University",
    gpa: "3.8",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    coverLetter:
      "I am excited to apply for the Frontend Developer Intern position. With my strong background in React and TypeScript, I believe I can contribute effectively to your team.",
    appliedDate: "2024-01-15",
    status: "pending",
    avatar: "/professional-woman-diverse.png",
  },
  {
    id: "2",
    applicantName: "Michael Chen",
    email: "m.chen@tech.edu",
    phone: "+1 (555) 987-6543",
    position: "Backend Developer Intern",
    university: "MIT",
    gpa: "3.9",
    skills: ["Node.js", "Python", "PostgreSQL", "AWS"],
    coverLetter:
      "As a computer science student with experience in backend technologies, I am eager to contribute to your development team and learn from industry professionals.",
    appliedDate: "2024-01-14",
    status: "accepted",
    avatar: "/professional-man.png",
  },
  {
    id: "3",
    applicantName: "Emily Rodriguez",
    email: "emily.r@design.edu",
    phone: "+1 (555) 456-7890",
    position: "UX Designer Intern",
    university: "UC Berkeley",
    gpa: "3.7",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    coverLetter:
      "I am passionate about creating user-centered designs and would love to bring my creative skills and fresh perspective to your design team.",
    appliedDate: "2024-01-13",
    status: "declined",
    avatar: "/professional-woman-designer.png",
  },
  {
    id: "4",
    applicantName: "David Kim",
    email: "david.kim@cs.edu",
    phone: "+1 (555) 321-0987",
    position: "Full Stack Developer Intern",
    university: "Carnegie Mellon",
    gpa: "3.85",
    skills: ["React", "Node.js", "MongoDB", "Docker"],
    coverLetter:
      "With experience in both frontend and backend development, I am excited about the opportunity to work on full-stack projects and contribute to your engineering team.",
    appliedDate: "2024-01-12",
    status: "pending",
    avatar: "/professional-man-developer.png",
  },
  {
    id: "5",
    applicantName: "Jessica Wang",
    email: "j.wang@data.edu",
    phone: "+1 (555) 654-3210",
    position: "Data Science Intern",
    university: "Harvard University",
    gpa: "3.95",
    skills: ["Python", "R", "Machine Learning", "SQL"],
    coverLetter:
      "As a data science student with strong analytical skills, I am eager to apply my knowledge to real-world problems and contribute to data-driven decision making.",
    appliedDate: "2024-01-11",
    status: "pending",
    avatar: "/professional-woman-scientist.png",
  },
]

const mockJobPosts: JobPost[] = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Internship",
    description: "Join our frontend team to build amazing user experiences using React and TypeScript.",
    requirements: ["React", "TypeScript", "CSS", "Git"],
    postedDate: "2024-01-10",
    status: "active",
  },
  {
    id: "2",
    title: "Backend Developer Intern",
    department: "Engineering",
    location: "Remote",
    type: "Internship",
    description: "Work on scalable backend systems using Node.js and cloud technologies.",
    requirements: ["Node.js", "Python", "AWS", "Database"],
    postedDate: "2024-01-08",
    status: "active",
  },
]

const mockChatConversations: ChatConversation[] = [
  {
    applicationId: "2",
    applicantName: "Michael Chen",
    messages: [
      {
        id: "1",
        senderId: "business",
        senderName: "Business User",
        message:
          "Hi Michael! Congratulations on being accepted for the Backend Developer Intern position. We're excited to have you join our team!",
        timestamp: "2024-01-16T10:00:00Z",
        isFromBusiness: true,
      },
      {
        id: "2",
        senderId: "2",
        senderName: "Michael Chen",
        message:
          "Thank you so much! I'm thrilled about this opportunity. When would be a good time to discuss the next steps?",
        timestamp: "2024-01-16T10:15:00Z",
        isFromBusiness: false,
      },
      {
        id: "3",
        senderId: "business",
        senderName: "Business User",
        message:
          "Great! Let's schedule a call for tomorrow at 2 PM to go over the onboarding process and answer any questions you might have.",
        timestamp: "2024-01-16T10:30:00Z",
        isFromBusiness: true,
      },
    ],
  },
]

export default function BusinessDashboard() {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [activeTab, setActiveTab] = useState("applications")
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts)
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(mockChatConversations)
  const [newMessage, setNewMessage] = useState("")
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [showJobPostForm, setShowJobPostForm] = useState(false)
  const [newJobPost, setNewJobPost] = useState({
    title: "",
    department: "",
    location: "",
    type: "Internship",
    description: "",
    requirements: "",
  })

  const [applicationsPage, setApplicationsPage] = useState(1)
  const [jobPostsPage, setJobPostsPage] = useState(1)
  const applicationsPerPage = 5
  const jobPostsPerPage = 5

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusCounts = () => {
    return applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<ApplicationStatus, number>,
    )
  }

  const statusCounts = getStatusCounts()

  const handleCreateJobPost = () => {
    const jobPost: JobPost = {
      id: Date.now().toString(),
      title: newJobPost.title,
      department: newJobPost.department,
      location: newJobPost.location,
      type: newJobPost.type,
      description: newJobPost.description,
      requirements: newJobPost.requirements.split(",").map((req) => req.trim()),
      postedDate: new Date().toISOString().split("T")[0],
      status: "active",
    }
    setJobPosts([jobPost, ...jobPosts])
    setNewJobPost({
      title: "",
      department: "",
      location: "",
      type: "Internship",
      description: "",
      requirements: "",
    })
    setShowJobPostForm(false)
  }

  const handleSendMessage = (applicationId: string) => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "business",
      senderName: "Business User",
      message: newMessage,
      timestamp: new Date().toISOString(),
      isFromBusiness: true,
    }

    setChatConversations((prev) =>
      prev.map((conv) =>
        conv.applicationId === applicationId ? { ...conv, messages: [...conv.messages, message] } : conv,
      ),
    )
    setNewMessage("")
  }

  const getAcceptedApplications = () => {
    return applications.filter((app) => app.status === "accepted")
  }

  const getPaginatedApplications = () => {
    const startIndex = (applicationsPage - 1) * applicationsPerPage
    const endIndex = startIndex + applicationsPerPage
    return applications.slice(startIndex, endIndex)
  }

  const getPaginatedJobPosts = () => {
    const startIndex = (jobPostsPage - 1) * jobPostsPerPage
    const endIndex = startIndex + jobPostsPerPage
    return jobPosts.slice(startIndex, endIndex)
  }

  const getTotalApplicationsPages = () => {
    return Math.ceil(applications.length / applicationsPerPage)
  }

  const getTotalJobPostsPages = () => {
    return Math.ceil(jobPosts.length / jobPostsPerPage)
  }

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-sans font-bold text-foreground">FreelanceHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/business-user.png" />
              <AvatarFallback>BU</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Business User</span>
          </div>
        </div>
      </header> */}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-sidebar-border bg-sidebar p-6">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "applications" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("applications")}
            >
              <Users className="mr-2 h-4 w-4" />
              Applications
            </Button>
            <Button
              variant={activeTab === "jobposts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("jobposts")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Job Posts
            </Button>
            <Button
              variant={activeTab === "chat" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("chat")}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "applications" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-2">Job Applications</h2>
                <p className="text-muted-foreground">Review and manage student applications for your job postings</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.pending || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.accepted || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Declined</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.declined || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Applications Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedApplications().map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={application.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {application.applicantName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{application.applicantName}</div>
                                <div className="text-sm text-muted-foreground">{application.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{application.position}</TableCell>
                          <TableCell>{application.university}</TableCell>
                          <TableCell>{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedApplication(application)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="font-sans">Application Details</DialogTitle>
                                    <DialogDescription>
                                      Review the complete application from {selectedApplication?.applicantName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedApplication && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{selectedApplication.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{selectedApplication.phone}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                              {selectedApplication.university} (GPA: {selectedApplication.gpa})
                                            </span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <h4 className="font-medium mb-1">Skills</h4>
                                            <div className="flex flex-wrap gap-1">
                                              {selectedApplication.skills.map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                  {skill}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Cover Letter</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                          {selectedApplication.coverLetter}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              {application.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, "accepted")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusChange(application.id, "declined")}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls
                    currentPage={applicationsPage}
                    totalPages={getTotalApplicationsPages()}
                    onPageChange={setApplicationsPage}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "jobposts" && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-sans font-bold text-foreground mb-2">Job Posts</h2>
                  <p className="text-muted-foreground">Manage your job postings and create new opportunities</p>
                </div>
                <Button onClick={() => setShowJobPostForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Post
                </Button>
              </div>

              <div className="grid gap-4">
                {getPaginatedJobPosts().map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-sans">{job.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.department} • {job.location} • {job.type}
                          </p>
                        </div>
                        <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requirements.map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <PaginationControls
                currentPage={jobPostsPage}
                totalPages={getTotalJobPostsPages()}
                onPageChange={setJobPostsPage}
              />

              {/* Job Post Creation Dialog */}
              <Dialog open={showJobPostForm} onOpenChange={setShowJobPostForm}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-sans">Create New Job Post</DialogTitle>
                    <DialogDescription>Fill out the details for your new job posting</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={newJobPost.title}
                          onChange={(e) => setNewJobPost({ ...newJobPost, title: e.target.value })}
                          placeholder="e.g. Frontend Developer Intern"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={newJobPost.department}
                          onChange={(e) => setNewJobPost({ ...newJobPost, department: e.target.value })}
                          placeholder="e.g. Engineering"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newJobPost.location}
                          onChange={(e) => setNewJobPost({ ...newJobPost, location: e.target.value })}
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Job Type</Label>
                        <Input
                          id="type"
                          value={newJobPost.type}
                          onChange={(e) => setNewJobPost({ ...newJobPost, type: e.target.value })}
                          placeholder="e.g. Internship"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newJobPost.description}
                        onChange={(e) => setNewJobPost({ ...newJobPost, description: e.target.value })}
                        placeholder="Describe the role and responsibilities..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                      <Input
                        id="requirements"
                        value={newJobPost.requirements}
                        onChange={(e) => setNewJobPost({ ...newJobPost, requirements: e.target.value })}
                        placeholder="e.g. React, TypeScript, CSS, Git"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowJobPostForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateJobPost}>Create Job Post</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {activeTab === "chat" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-2">Chat with Accepted Candidates</h2>
                <p className="text-muted-foreground">Communicate with students who have been accepted for positions</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Chat List */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="font-sans text-lg">Accepted Candidates</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {getAcceptedApplications().map((app) => (
                        <div
                          key={app.id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                            selectedChat === app.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedChat(app.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={app.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {app.applicantName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{app.applicantName}</p>
                              <p className="text-xs text-muted-foreground truncate">{app.position}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Window */}
                <Card className="lg:col-span-2">
                  {selectedChat ? (
                    <>
                      <CardHeader className="border-b">
                        <CardTitle className="font-sans text-lg">
                          {applications.find((app) => app.id === selectedChat)?.applicantName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex flex-col h-[500px]">
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {chatConversations
                              .find((conv) => conv.applicationId === selectedChat)
                              ?.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.isFromBusiness ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      message.isFromBusiness ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                        <div className="border-t p-4">
                          <div className="flex gap-2">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message..."
                              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(selectedChat)}
                            />
                            <Button onClick={() => handleSendMessage(selectedChat)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a candidate to start chatting</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
