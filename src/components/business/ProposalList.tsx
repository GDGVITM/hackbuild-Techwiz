'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
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
        const data = await response.json();
        setProposals(data.proposals);
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProposals();
    }
  }, [token, jobId, status]);

  const handleUpdateStatus = async (proposalId: string, newStatus: 'accepted' | 'rejected') => {
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
        setProposals(proposals.map(p => 
          p._id === proposalId ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Failed to update proposal status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
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

  if (loading) return <div>Loading proposals...</div>;

  if (proposals.length === 0) {
    return <div className="text-center py-4 text-gray-500">No proposals found</div>;
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal._id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{proposal.jobId.title}</CardTitle>
                <CardDescription>
                  By {proposal.studentId.name} ({proposal.studentId.email})
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(proposal.status)}
                <span className="text-sm text-gray-500">
                  {new Date(proposal.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{proposal.coverLetter}</p>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Milestones:</h4>
              <ul className="space-y-1">
                {proposal.milestones.map((milestone, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span>{milestone.title}</span>
                    <span>${milestone.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total: ${proposal.quoteAmount}</span>
              
              {proposal.status === 'pending' && (
                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateStatus(proposal._id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateStatus(proposal._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}