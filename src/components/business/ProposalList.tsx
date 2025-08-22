'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, Clock3 } from 'lucide-react';

interface Proposal {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  coverLetter: string;
  quoteAmount: number;
  status: 'pending' | 'accepted' | 'declined';
  submittedAt: string;
  milestones?: Array<{
    title: string;
    amount: number;
    dueDate: string;
  }>;
}

interface ProposalListProps {
  jobId: string;
}

export default function ProposalList({ jobId }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/proposals?jobId=${jobId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProposals(data.proposals || []);
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch proposals');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchProposals();
    }
  }, [jobId]);

  const handleStatusChange = async (proposalId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        console.error('Failed to update proposal status:', errorData.error);
      }
    } catch (error) {
      console.error('Failed to update proposal status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">📝</div>
        <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
        <p className="text-gray-600">This job hasn't received any proposals yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proposals ({proposals.length})</h3>
        <div className="text-sm text-gray-600">
          {proposals.filter(p => p.status === 'pending').length} pending
        </div>
      </div>
      
      {proposals.map((proposal) => (
        <Card key={proposal._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={proposal.studentId.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {proposal.studentId.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{proposal.studentId.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {proposal.studentId.email}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted {formatDate(proposal.submittedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${proposal.quoteAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(proposal.status)}
                {proposal.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(proposal._id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(proposal._id, 'declined')}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Cover Letter</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {proposal.coverLetter}
                </p>
              </div>
              
              {proposal.milestones && proposal.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Proposed Milestones</h4>
                  <div className="space-y-2">
                    {proposal.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <p className="text-xs text-gray-600">
                            Due: {formatDate(milestone.dueDate)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${milestone.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
