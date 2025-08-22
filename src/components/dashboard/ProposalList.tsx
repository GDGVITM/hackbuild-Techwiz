'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
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

interface ProposalListProps {
  jobId?: string;
  status?: string;
}

export default function ProposalList({ jobId, status }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/proposals';
      const params = new URLSearchParams();
      
      if (jobId) params.append('jobId', jobId);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch proposals' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProposals(data.proposals || []);
      setFilteredProposals(data.proposals || []);
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
  }, [token, jobId, status]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        fetchProposals();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [token, jobId, status]);

  // Filter and sort proposals
  useEffect(() => {
    let filtered = proposals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case 'studentName':
          return a.studentId.name.localeCompare(b.studentId.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProposals(filtered);
  }, [proposals, searchTerm, sortBy]);

  const getStatusCounts = () => {
    const counts = { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    proposals.forEach(proposal => {
      counts[proposal.status as keyof typeof counts]++;
    });
    return counts;
  };

  const handleStatusUpdate = async (proposalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh the proposals list
        await fetchProposals();
        toast({
          title: `Proposal status updated to ${newStatus}`,
          description: `Proposal ${proposalId} status updated to ${newStatus}.`,
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to update proposal status:', errorData.error);
        toast({
          title: 'Failed to update proposal status',
          description: errorData.error || 'Failed to update proposal status.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: 'Failed to update proposal status',
        description: error instanceof Error ? error.message : 'Failed to update proposal status.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading proposals...</p>
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

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, job title, or cover letter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedAt">Date Submitted</SelectItem>
                  <SelectItem value="quoteAmount">Quote Amount</SelectItem>
                  <SelectItem value="studentName">Student Name</SelectItem>
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

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No proposals match your search criteria.' : 'No proposals have been submitted for this job yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{proposal.studentId.name}</CardTitle>
                    <CardDescription>{proposal.studentId.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        proposal.status === 'accepted' ? 'default' :
                        proposal.status === 'rejected' ? 'destructive' :
                        proposal.status === 'withdrawn' ? 'outline' : 'secondary'
                      }
                    >
                      {proposal.status === 'pending' ? 'Pending Review' : proposal.status}
                    </Badge>
                    <span className="text-lg font-semibold text-green-600">
                      ${proposal.quoteAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {proposal.coverLetter}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Proposal Details</DialogTitle>
                          <DialogDescription>
                            From {proposal.studentId.name} for {proposal.jobId.title}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Cover Letter</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{proposal.coverLetter}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Proposed Milestones</h4>
                            <div className="space-y-2">
                              {proposal.milestones.map((milestone, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span>{milestone.title}</span>
                                  <span className="font-semibold">${milestone.amount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total Amount:</span>
                              <span className="text-lg font-bold text-green-600">
                                ${proposal.quoteAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {proposal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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