"use client";
import Proposal from "@/lib/models/Proposal";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import JobDetailsPage from "../../app/dashboard/student/jobs/[id]/page";
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
} from "lucide-react";

interface ChatConversation {
  id: string;
  company: string;
  jobTitle: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UI State
  const [activeTab, setActiveTab] = useState("explore");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    portfolio: "",
    availability: "",
  });
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1);
  const [applicationsCurrentPage, setApplicationsCurrentPage] = useState(1);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Filter states
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  
  const jobsPerPage = 5;
  const applicationsPerPage = 5;

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs);
        } else {
          setError(data.error || "Failed to fetch jobs");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch proposals
  useEffect(() => {
    const fetchProposals = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/proposals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProposals(data.proposals);
        }
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
      }
    };
    fetchProposals();
  }, [token]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setChats(data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    fetchChats();
  }, [token]);

  // Filter and search jobs
  const filteredJobs = jobs.filter((job) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skillsRequired.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Filter by skill
    const matchesSkill =
      skillFilter === "all" || job.skillsRequired.includes(skillFilter);
    
    // Filter by budget
    let matchesBudget = true;
    if (budgetFilter !== "all") {
      const [min, max] = budgetFilter.split("-").map(Number);
      const avgBudget = (job.budgetMin + job.budgetMax) / 2;
      matchesBudget = avgBudget >= min && avgBudget <= max;
    }
    
    return matchesSearch && matchesSkill && matchesBudget;
  });

  // Pagination logic for jobs
  const totalJobsPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const jobsStartIndex = (jobsCurrentPage - 1) * jobsPerPage;
  const jobsEndIndex = jobsStartIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(jobsStartIndex, jobsEndIndex);

  // Pagination logic for applications
  const totalApplicationsPages = Math.ceil(proposals.length / applicationsPerPage);
  const applicationsStartIndex = (applicationsCurrentPage - 1) * applicationsPerPage;
  const applicationsEndIndex = applicationsStartIndex + applicationsPerPage;
  const currentApplications = proposals.slice(applicationsStartIndex, applicationsEndIndex);

  // Get unique skills from all jobs
  const getAllSkills = () => {
    const skills = new Set<string>();
    jobs.forEach((job) => {
      job.skillsRequired.forEach((skill) => skills.add(skill));
    });
    return Array.from(skills).sort();
  };

  // Get job details for proposals
  const getJobDetails = (jobId: string) => {
    return jobs.find((job) => job._id === jobId);
  };

  // Create a set of job IDs that the student has already applied to
  const appliedJobIds = useMemo(() => 
    new Set(proposals.map((p) => p.jobId)), 
    [proposals]
  );

  // Get the status of a proposal for a specific job
  const getProposalStatus = (jobId: string) => {
    const proposal = proposals.find((p) => p.jobId === jobId);
    return proposal ? proposal.status : null;
  };

  // Handle job application
  const handleApplyToJob = (job: Job) => {
    router.push(`/dashboard/student/jobs/${job._id}?action=submit`);
  };

  // Handle viewing contract
  const handleViewContract = (jobId: string) => {
    const proposal = proposals.find(p => p.jobId === jobId);
    if (proposal) {
      router.push(`/dashboard/student/proposals/${proposal._id}`);
    }
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!selectedJob || !token) return;
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          coverLetter: applicationForm.coverLetter,
          portfolio: applicationForm.portfolio,
          availability: applicationForm.availability,
        }),
      });
      if (response.ok) {
        // Refresh proposals
        const proposalsResponse = await fetch("/api/proposals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const proposalsData = await proposalsResponse.json();
        if (proposalsResponse.ok) {
          setProposals(proposalsData.proposals);
        }
        setSelectedJob(null);
        setApplicationForm({
          coverLetter: "",
          portfolio: "",
          availability: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit application");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !token) return;
    try {
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });
      if (response.ok) {
        // Update the selectedChat with the new message
        const updatedMessages = [
          ...selectedChat.messages,
          {
            id: selectedChat.messages.length + 1,
            sender: "student",
            content: newMessage,
            timestamp: new Date().toISOString(),
          },
        ];
        setSelectedChat({
          ...selectedChat,
          messages: updatedMessages,
          lastMessage: newMessage,
          timestamp: new Date().toISOString(),
        });
        // Update the chat in the chats list
        setChats(
          chats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: newMessage,
                  timestamp: new Date().toISOString(),
                }
              : chat
          )
        );
        setNewMessage("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send message");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock3 className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const allSkills = getAllSkills();

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">⚠️</div>
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
            <TabsTrigger
              value="explore"
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Explore Jobs</span>
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center space-x-2"
            >
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
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All skills</SelectItem>
                      {allSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All budgets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All budgets</SelectItem>
                      <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">
                        $5,000 - $10,000
                      </SelectItem>
                      <SelectItem value="10000-50000">$10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSkillFilter("all");
                      setBudgetFilter("all");
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} jobs
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            
            <div className="grid gap-6">
              {currentJobs.map((job) => {
                const hasApplied = appliedJobIds.has(job._id);
                const proposalStatus = getProposalStatus(job._id);
                return (
                  <Card
                    key={job._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={job.companyLogo || "/placeholder.svg"}
                              alt={job.company}
                            />
                            <AvatarFallback>
                              {job.company?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">
                              {job.title || "Job Title"}
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                              {job.company || "Company Name"}
                            </CardDescription>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location || "Remote"}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  ${job.budgetMin.toLocaleString()} - $
                                  {job.budgetMax.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{job.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {hasApplied && (
                            <Badge
                              variant={
                                proposalStatus === "accepted"
                                  ? "default"
                                  : proposalStatus === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                proposalStatus === "accepted"
                                  ? "bg-green-500"
                                  : ""
                              }
                            >
                              {proposalStatus === "accepted"
                                ? "Accepted"
                                : proposalStatus === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </Badge>
                          )}
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
                                  <h4 className="font-semibold mb-2">
                                    Job Description
                                  </h4>
                                  <p className="text-slate-600">
                                    {job.description}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Skills Required
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {job.skillsRequired.map((skill, index) => (
                                      <Badge key={index} variant="secondary">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  {!hasApplied ? (
                                    <Button
                                      onClick={() => handleApplyToJob(job)}
                                    >
                                      Apply Now
                                    </Button>
                                  ) : proposalStatus === 'accepted' ? (
                                    <Button
                                      onClick={() => handleViewContract(job._id)}
                                    >
                                      View Contract
                                    </Button>
                                  ) : (
                                    <Button variant="outline" disabled>
                                      Applied
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {!hasApplied ? (
                            <Button onClick={() => handleApplyToJob(job)}>
                              Apply Now
                            </Button>
                          ) : proposalStatus === 'accepted' ? (
                            <Button
                              onClick={() => handleViewContract(job._id)}
                            >
                              View Contract
                            </Button>
                          ) : (
                            <Button variant="outline" disabled>
                              Applied
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {job.skillsRequired.length > 4 && (
                          <Badge variant="secondary">
                            +{job.skillsRequired.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Jobs Pagination */}
            {totalJobsPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJobsCurrentPage(jobsCurrentPage - 1)}
                  disabled={jobsCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalJobsPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={
                          page === jobsCurrentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setJobsCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJobsCurrentPage(jobsCurrentPage + 1)}
                  disabled={jobsCurrentPage === totalJobsPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-gray-600 mt-1">
                  Track your job applications and their status
                </p>
              </div>
              <Link href="/dashboard/student/proposals">
                <Button variant="outline">
                  View All Proposals 
                </Button>
              </Link>
            </div>
            
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {proposals.filter((p) => p.status === "pending").length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {proposals.filter((p) => p.status === "accepted").length}
                    </div>
                    <div className="text-sm text-gray-600">Accepted</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {proposals.filter((p) => p.status === "rejected").length}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {proposals.filter((p) => p.status === "withdrawn").length}
                    </div>
                    <div className="text-sm text-gray-600">Withdrawn</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Proposals List */}
            {currentApplications.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-xl font-semibold mb-2">
                  No applications yet
                </h2>
                <p className="text-gray-500 mb-6">
                  Start applying to jobs to see your applications here
                </p>
                <Link href="/dashboard/student">
                  <Button>Browse Available Jobs</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {currentApplications.map((application) => {
                  const job = getJobDetails(application.jobId);
                  if (!job) return null;
                  return (
                    <Card
                      key={application._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              <Link
                                href={`/dashboard/student/jobs/${application.jobId}`}
                                className="hover:text-blue-600"
                              >
                                {job.title}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              {job.company} • Submitted on{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-gray-700 line-clamp-2">
                          {application.coverLetter}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-lg">
                            ${job.budgetMin.toLocaleString()} - $
                            {job.budgetMax.toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/student/proposals/${application._id}`}
                            >
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            {application.status === 'accepted' && (
                              <Link href={`/dashboard/student/proposals/${application._id}`}>
                                <Button variant="outline" size="sm">
                                  View Contract
                                </Button>
                              </Link>
                            )}
                            <Link
                              href={`/dashboard/student/jobs/${application.jobId}`}
                            >
                              <Button variant="outline" size="sm">
                                View Job
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* Applications Pagination */}
            {totalApplicationsPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApplicationsCurrentPage(applicationsCurrentPage - 1)
                  }
                  disabled={applicationsCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: totalApplicationsPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={
                        page === applicationsCurrentPage ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setApplicationsCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApplicationsCurrentPage(applicationsCurrentPage + 1)
                  }
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
                  <CardDescription>
                    Chat with companies that accepted your applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {chats.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-slate-50 ${
                          selectedChat?.id === conversation.id
                            ? "bg-indigo-50 border-indigo-200"
                            : ""
                        }`}
                        onClick={() => setSelectedChat(conversation)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {conversation.company}
                          </h4>
                          {conversation.unread > 0 && (
                            <Badge className="bg-indigo-600 text-white text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">
                          {conversation.jobTitle}
                        </p>
                        <p className="text-sm text-slate-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(
                            conversation.timestamp
                          ).toLocaleDateString()}
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
                      <CardTitle className="text-lg">
                        {selectedChat.company}
                      </CardTitle>
                      <CardDescription>{selectedChat.jobTitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-4">
                          {selectedChat.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender === "student"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
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
                                    message.sender === "student"
                                      ? "text-indigo-200"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString()}
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
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
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
                      <p className="text-slate-500">
                        Select a conversation to start messaging
                      </p>
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
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      coverLetter: e.target.value,
                    })
                  }
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio/Resume Link</Label>
                <Input
                  id="portfolio"
                  placeholder="https://your-portfolio.com or link to resume"
                  value={applicationForm.portfolio}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      portfolio: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="When can you start? (e.g., Immediately, After finals, etc.)"
                  value={applicationForm.availability}
                  onChange={(e) =>
                    setApplicationForm({
                      ...applicationForm,
                      availability: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitApplication}
                  disabled={!applicationForm.coverLetter.trim()}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}