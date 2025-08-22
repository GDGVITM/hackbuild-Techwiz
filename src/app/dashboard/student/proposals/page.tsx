'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Notification } from '@/components/ui/notification';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    businessId: {
      _id: string;
      name: string;
    };
  };
  coverLetter: string;
  milestones: Array<{
    title: string;
    amount: number;
    dueDate: string;
  }>;
  quoteAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
}

export default function StudentProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [previousProposals, setPreviousProposals] = useState<Proposal[]>([]);
  const { token } = useAuth();
  const router = useRouter();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proposals', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch proposals' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const newProposals = data.proposals || [];
      
      // Check for status changes
      if (previousProposals.length > 0) {
        newProposals.forEach((newProposal: Proposal) => {
          const oldProposal = previousProposals.find(p => p._id === newProposal._id);
          if (oldProposal && oldProposal.status !== newProposal.status) {
            // Status changed - show notification
            let notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';
            let title = 'Proposal Status Updated';
            let message = `Your proposal for "${newProposal.jobId.title}" status changed from ${oldProposal.status} to ${newProposal.status}.`;
            
            if (newProposal.status === 'accepted') {
              notificationType = 'success';
              title = '🎉 Proposal Accepted!';
              message = `Congratulations! Your proposal for "${newProposal.jobId.title}" has been accepted!`;
            } else if (newProposal.status === 'rejected') {
              notificationType = 'warning';
              title = 'Proposal Not Selected';
              message = `Your proposal for "${newProposal.jobId.title}" was not selected. Don't worry, there are many other opportunities!`;
            }
            
            setNotification({
              title,
              message,
              type: notificationType
            });
            
            // Auto-hide notification after 10 seconds
            setTimeout(() => {
              setNotification(null);
            }, 10000);
          }
        });
      }
      
      setPreviousProposals(newProposals);
      setProposals(newProposals);
      setFilteredProposals(newProposals);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProposals();
    }
  }, [token]);

  // Auto-refresh every 30 seconds to check for status updates
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchProposals();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [token]);

  // Filter and sort proposals
  useEffect(() => {
    let filtered = proposals;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.jobId.businessId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.coverLetter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort proposals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'submittedAt':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'quoteAmount':
          return b.quoteAmount - a.quoteAmount;
        case 'jobTitle':
          return a.jobId.title.localeCompare(b.jobId.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProposals(filtered);
  }, [proposals, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = { all: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    proposals.forEach(proposal => {
      counts.all++;
      counts[proposal.status as keyof typeof counts]++;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your proposals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Proposals</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProposals} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  if (proposals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Proposals</h1>
        <div className="text-center py-16">
          <div className="mb-4">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
            <p className="text-gray-500 mb-6">Start applying to jobs to see your proposals here</p>
          </div>
          <Link href="/dashboard/student">
            <Button>Browse Available Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Proposals</h1>
      
      {/* Status Change Notification */}
      {notification && (
        <div className="mb-6">
          <Notification
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by job title or cover letter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedAt">Date Submitted</SelectItem>
                  <SelectItem value="quoteAmount">Quote Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchProposals} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.withdrawn}</div>
              <div className="text-sm text-gray-600">Withdrawn</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || statusFilter !== 'all' 
            ? 'No proposals match your filters.' 
            : 'No proposals found'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      <Link href={`/dashboard/student/proposals/${proposal._id}`} className="hover:text-blue-600">
                        {proposal.jobId.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {proposal.jobId.businessId.name} • Submitted on {new Date(proposal.submittedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700 line-clamp-2">{proposal.coverLetter}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Milestones:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {proposal.milestones.slice(0, 2).map((milestone, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="truncate">{milestone.title}</span>
                        <span className="font-medium">${milestone.amount}</span>
                      </div>
                    ))}
                    {proposal.milestones.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{proposal.milestones.length - 2} more milestones
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Total: ${proposal.quoteAmount}</span>
                  
                  <div className="flex gap-2">
                    <Link href={`/dashboard/student/proposals/${proposal._id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/student/jobs/${proposal.jobId._id}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}