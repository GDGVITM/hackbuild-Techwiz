'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
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
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals', {
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
  }, [token]);

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
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Proposals</h1>
        <div className="text-center py-10">
          <p className="text-gray-500">You haven't submitted any proposals yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Proposals</h1>
      
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/dashboard/student/proposals/${proposal._id}`} className="hover:text-blue-600">
                      {proposal.jobId.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Submitted on {new Date(proposal.submittedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{proposal.coverLetter.substring(0, 150)}...</p>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total: ${proposal.quoteAmount}</span>
                <Link href={`/dashboard/student/proposals/${proposal._id}`}>
                  <button className="text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}