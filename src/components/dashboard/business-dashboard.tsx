'use client';
import { useEffect, useState } from 'react';
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
import { useRouter } from 'next/navigation';

// ... keep your existing interfaces (JobApplication, ChatMessage, ChatConversation)

export default function BusinessDashboard() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [newMessage, setNewMessage] = useState("");
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          setError('');
          
          // Fetch jobs
          const jobsResponse = await fetch('/api/jobs', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setJobs(jobsData.jobs);
          } else {
            setError('Failed to fetch jobs');
          }
          
          // Fetch proposals
          const proposalsResponse = await fetch('/api/proposals', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (proposalsResponse.ok) {
            const proposalsData = await proposalsResponse.json();
            setProposals(proposalsData.proposals);
          } else {
            setError('Failed to fetch proposals');
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('An error occurred. Please try again.');
        } finally {
          setDataLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isAuthenticated, token]);

  // ... keep your existing functions (handleJobCreated, handleStatusChange, etc.)

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
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
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">FreelanceHub</h2>
            <p className="text-sm text-gray-300">Business Dashboard</p>
          </div>
          
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/business-user.png" />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start mt-3 text-gray-300 hover:text-white"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard/business">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                <Building2 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/business/proposals">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                <Users className="mr-2 h-4 w-4" />
                Proposals
              </Button>
            </Link>
            <Link href="/dashboard/business/jobs">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                <Building2 className="mr-2 h-4 w-4" />
                Job Posts
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <Clock className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
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
                    <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'pending').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'accepted').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Declined</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'declined').length}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Proposals Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Proposals</CardTitle>
                </CardHeader>
                <CardContent>
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
                      {proposals.slice(0, 5).map((proposal) => (
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
                                    onClick={() => handleStatusChange(proposal._id, "declined")}
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
                {jobs.map((job) => (
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
                        {job.skillsRequired.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    <div className="space-y-1">
                      {proposals.filter(p => p.status === 'accepted').map((app) => (
                        <div
                          key={app._id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                            selectedChat === app._id ? "bg-muted" : ""
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
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}