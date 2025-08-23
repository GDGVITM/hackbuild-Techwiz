'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from "lucide-react";
import { Job } from '@/types/job';
import CreateJobForm from '@/app/dashboard/business/CreateJobForm';
import { useAuth } from '@/context/AuthContext';

type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

interface JobApplication {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  coverLetter: string;
  milestones: Array<{
    title: string;
    amount: number;
    dueDate: string;
  }>;
  quoteAmount: number;
  status: ApplicationStatus;
  submittedAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isFromBusiness: boolean;
}

interface ChatConversation {
  applicationId: string;
  applicantName: string;
  messages: ChatMessage[];
}

export default function BusinessDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [newMessage, setNewMessage] = useState("");
  // In your business dashboard component
  const [selectedProposal, setSelectedProposal] = useState<JobApplication | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newJobPost, setNewJobPost] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    budgetMin: "",
    budgetMax: "",
  });
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [jobPostsPage, setJobPostsPage] = useState(1);
  const applicationsPerPage = 5;
  const jobPostsPerPage = 5;

  // Check authentication and role
  // In BusinessDashboard.tsx

  // Update the authentication useEffect
  useEffect(() => {
    console.log('BusinessDashboard - Auth state:', { isAuthenticated, authLoading, user, hasToken: !!token });

    // Add timeout for authentication check
    const authTimeout = setTimeout(() => {
      if (authLoading) {
        console.log('BusinessDashboard - Authentication check timed out, checking localStorage');
        // Try to get auth data from localStorage as fallback
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('BusinessDashboard - Using stored auth data from localStorage');
            // Force the dashboard to render with stored data
            setAuthChecking(false);
          } catch (parseError) {
            console.error('BusinessDashboard - Error parsing stored user data:', parseError);
            router.push('/auth/login');
          }
        } else {
          console.log('BusinessDashboard - No stored auth data, redirecting to login');
          router.push('/auth/login');
        }
      }
    }, 10000); // 10 second timeout

    if (!authLoading) {
      clearTimeout(authTimeout);
      if (!isAuthenticated || !user) {
        console.log('BusinessDashboard - Not authenticated, redirecting to login');
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'business') {
        console.log('BusinessDashboard - Wrong role, redirecting to unauthorized');
        router.push('/unauthorized');
        return;
      }

      console.log('BusinessDashboard - Authentication check passed');
      setAuthChecking(false);
    }

    return () => clearTimeout(authTimeout);
  }, [isAuthenticated, authLoading, user, token, router]);

  // Update the data fetching useEffect
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get token from localStorage if not available in context
        const currentToken = token || localStorage.getItem('authToken');
        
        if (!currentToken) {
          console.log('BusinessDashboard - No token available for API calls');
          setError('Authentication token not available');
          setLoading(false);
          return;
        }

        // Add timeout for data fetching
        const fetchTimeout = setTimeout(() => {
          console.log('BusinessDashboard - Data fetch timeout');
          setError('Data loading timed out. Please try again.');
          setLoading(false);
        }, 15000); // 15 second timeout

        console.log('BusinessDashboard - Fetching jobs...');
        // Fetch jobs with authentication
        const jobsResponse = await fetch('/api/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          credentials: 'include',
        });

        console.log('BusinessDashboard - Jobs response status:', jobsResponse.status);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          console.log('BusinessDashboard - Jobs data:', jobsData);
          setJobs(jobsData.jobs || []);
        } else {
          const errorData = await jobsResponse.json();
          console.error('BusinessDashboard - Jobs fetch error:', errorData);
          setError(errorData.error || 'Failed to fetch jobs');
        }

        console.log('BusinessDashboard - Fetching proposals...');
        // Fetch proposals with authentication
        const proposalsResponse = await fetch('/api/proposals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          credentials: 'include',
        });

        console.log('BusinessDashboard - Proposals response status:', proposalsResponse.status);
        if (proposalsResponse.ok) {
          const proposalsData = await proposalsResponse.json();
          console.log('BusinessDashboard - Proposals data:', proposalsData);
          setProposals(proposalsData.proposals || []);
        } else {
          const errorData = await proposalsResponse.json();
          console.error('BusinessDashboard - Proposals fetch error:', errorData);
          // Don't set error for proposals if jobs loaded successfully
          if (!jobsResponse.ok) {
            setError(errorData.error || 'Failed to fetch proposals');
          }
        }

        clearTimeout(fetchTimeout);
      } catch (err) {
        console.error('BusinessDashboard - Fetch error:', err);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, user, token]);

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowCreateForm(false);
  };

  // In BusinessDashboard.tsx

  // Update handleStatusChange
  const handleStatusChange = async (proposalId: string, newStatus: ApplicationStatus) => {
    try {
      const currentToken = token || localStorage.getItem('authToken');
      if (!currentToken) {
        setError('Authentication token not available');
        return;
      }

      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal._id === proposalId ? { ...proposal, status: newStatus } : proposal
          )
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update proposal status');
      }
    } catch (error) {
      console.error('Failed to update proposal status:', error);
      setError('Failed to update proposal status');
    }
  };

  // Update handleCreateJobPost

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusCounts = () => {
    return proposals.reduce(
      (acc, proposal) => {
        acc[proposal.status] = (acc[proposal.status] || 0) + 1;
        return acc;
      },
      {} as Record<ApplicationStatus, number>,
    );
  };

  const statusCounts = getStatusCounts();

  const handleCreateJobPost = async () => {
    try {
      const jobData = {
        title: newJobPost.title,
        description: newJobPost.description,
        skillsRequired: newJobPost.skillsRequired.split(",").map((skill) => skill.trim()),
        budgetMin: Number(newJobPost.budgetMin),
        budgetMax: Number(newJobPost.budgetMax),
        milestones: [],
      };

      const currentToken = token || localStorage.getItem('authToken');
      if (!currentToken) {
        setError('Authentication token not available');
        return;
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs([data.job, ...jobs]);
        setNewJobPost({
          title: "",
          description: "",
          skillsRequired: "",
          budgetMin: "",
          budgetMax: "",
        });
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create job');
      }
    } catch (error) {
      console.error('Failed to create job:', error);
      setError('Failed to create job');
    }
  };

  const handleSendMessage = (applicationId: string) => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "business",
      senderName: "Business User",
      message: newMessage,
      timestamp: new Date().toISOString(),
      isFromBusiness: true,
    };

    setChatConversations((prev) => {
      const existingConv = prev.find(conv => conv.applicationId === applicationId);

      if (existingConv) {
        return prev.map(conv =>
          conv.applicationId === applicationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        );
      } else {
        return [
          ...prev,
          {
            applicationId,
            applicantName: proposals.find(p => p._id === applicationId)?.studentId.name || '',
            messages: [message]
          }
        ];
      }
    });

    setNewMessage("");
  };

  const getAcceptedApplications = () => {
    return proposals.filter((proposal) => proposal.status === "accepted");
  };

  const getPaginatedApplications = () => {
    const startIndex = (applicationsPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    return proposals.slice(startIndex, endIndex);
  };

  const getPaginatedJobPosts = () => {
    const startIndex = (jobPostsPage - 1) * jobPostsPerPage;
    const endIndex = startIndex + jobPostsPerPage;
    return jobs.slice(startIndex, endIndex);
  };

  const getTotalApplicationsPages = () => {
    return Math.max(1, Math.ceil(proposals.length / applicationsPerPage));
  };

  const getTotalJobPostsPages = () => {
    return Math.max(1, Math.ceil(jobs.length / jobPostsPerPage));
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

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
    );
  };

  if (authChecking) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
        <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching your jobs and proposals</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-sidebar-border bg-sidebar p-6">
          <nav className="space-y-2">
            <Link href="/dashboard/business">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/business/proposals">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Proposals
              </Button>
            </Link>
            <Link href="/dashboard/business/jobs">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Job Posts
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </nav>
        </aside>

        <Tabs defaultValue="proposals" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="jobs">Job Posts</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Job Proposals</h2>
              <p className="text-muted-foreground">Review and manage student proposals for your job postings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts.rejected || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Proposals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                      <p className="text-muted-foreground">When students apply to your job postings, their proposals will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Quote Amount</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPaginatedApplications().map((proposal) => (
                          <TableRow key={proposal._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={proposal.studentId.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {proposal.studentId.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{proposal.studentId.name}</div>
                                  <div className="text-sm text-muted-foreground">{proposal.studentId.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{proposal.jobId.title}</TableCell>
                            <TableCell>${proposal.quoteAmount}</TableCell>
                            <TableCell>{new Date(proposal.submittedAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedApplication(proposal)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Proposal Details</DialogTitle>
                                      <DialogDescription>
                                        Review the complete proposal from {selectedApplication?.studentId.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedApplication && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <Mail className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm">{selectedApplication.studentId.email}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">Cover Letter</h4>
                                          <p className="text-sm text-muted-foreground leading-relaxed">
                                            {selectedApplication.coverLetter}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">Milestones</h4>
                                          <div className="space-y-2">
                                            {selectedApplication.milestones.map((milestone, index) => (
                                              <div key={index} className="flex justify-between text-sm">
                                                <span>{milestone.title}</span>
                                                <span>${milestone.amount}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                {proposal.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChange(proposal._id, "accepted")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusChange(proposal._id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
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
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Job Posts</h2>
                <p className="text-muted-foreground">Manage your job postings and create new opportunities</p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Post
              </Button>
            </div>

            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Job Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateJobForm onJobCreated={handleJobCreated} />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
                          {jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="mb-4">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to your Business Dashboard!</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first job posting to attract talented students.</p>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Job Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
                getPaginatedJobPosts().map((job) => (
                  <Card key={job._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Budget: ${job.budgetMin} - ${job.budgetMax}
                          </p>
                        </div>
                        <Badge variant={job.status === "open" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Array.isArray(job.skillsRequired) ? job.skillsRequired.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        )) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {jobs.length > 0 && (
              <PaginationControls
                currentPage={jobPostsPage}
                totalPages={getTotalJobPostsPages()}
                onPageChange={setJobPostsPage}
              />
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Chat with Accepted Candidates</h2>
              <p className="text-muted-foreground">Communicate with students who have been accepted for positions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Chat List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Accepted Candidates</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {getAcceptedApplications().length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No accepted candidates
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {getAcceptedApplications().map((app) => (
                        <div
                          key={app._id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${selectedChat === app._id ? "bg-muted" : ""
                            }`}
                          onClick={() => setSelectedChat(app._id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={app.studentId.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {app.studentId.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{app.studentId.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{app.jobId.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="lg:col-span-2">
                {selectedChat ? (
                  <>
                    <CardHeader className="border-b">
                      <CardTitle>
                        {proposals.find((app) => app._id === selectedChat)?.studentId.name}
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
                                  className={`max-w-[70%] p-3 rounded-lg ${message.isFromBusiness ? "bg-primary text-primary-foreground" : "bg-muted"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}