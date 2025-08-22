'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface ChangeRequest {
  _id: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
}

interface Contract {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  status: "draft" | "pending" | "signed" | "completed" | "changes_requested";
  changeRequests?: ChangeRequest[];
}

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    businessId: {
      _id: string;
      name: string;
      email: string;
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
  attachments?: string[];
  contract?: Contract;
}

export default function ProposalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/proposals/${proposalId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProposal(data.proposal);
      } catch (error) {
        console.error('Failed to fetch proposal:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch proposal');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProposal();
    }
  }, [proposalId, token]);

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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your proposal is currently under review by the business. You will be notified once they make a decision.';
      case 'accepted':
        return 'Congratulations! Your proposal has been accepted. The business will contact you soon to discuss next steps.';
      case 'rejected':
        return 'Your proposal was not selected for this job. Don\'t worry, there are many other opportunities available.';
      case 'withdrawn':
        return 'You have withdrawn your proposal for this job.';
      default:
        return '';
    }
  };

  if (loading) return <div className="text-center py-10">Loading proposal details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!proposal) return <div className="text-center py-10">Proposal not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Proposals
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{proposal.jobId.title}</CardTitle>
                  <CardDescription>
                    Posted by {proposal.jobId.businessId.name}
                  </CardDescription>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{proposal.jobId.description}</p>
              <div className="text-sm text-gray-500">
                Submitted on {new Date(proposal.submittedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Status Message */}
          <Card>
            <CardContent className="pt-6">
              <div className={`p-4 rounded-lg ${
                proposal.status === 'accepted' ? 'bg-green-50 border border-green-200' :
                proposal.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                proposal.status === 'withdrawn' ? 'bg-gray-50 border border-gray-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`${
                  proposal.status === 'accepted' ? 'text-green-800' :
                  proposal.status === 'rejected' ? 'text-red-800' :
                  proposal.status === 'withdrawn' ? 'text-gray-800' :
                  'text-blue-800'
                }`}>
                  {getStatusMessage(proposal.status)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle>Your Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{proposal.coverLetter}</p>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Proposed Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposal.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600">${milestone.amount}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">${proposal.quoteAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {proposal.attachments && proposal.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposal.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-blue-600 hover:text-blue-800">
                        📎 Attachment {index + 1}
                      </span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Information */}
          {proposal.contract && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Contract Status:</span>
                    <Badge 
                      variant={
                        proposal.contract.status === 'signed' ? 'default' :
                        proposal.contract.status === 'pending' ? 'secondary' :
                        proposal.contract.status === 'changes_requested' ? 'destructive' :
                        'outline'
                      }
                      className={
                        proposal.contract.status === 'signed' ? 'bg-green-500' :
                        proposal.contract.status === 'changes_requested' ? 'bg-orange-500' :
                        ''
                      }
                    >
                      {proposal.contract.status.charAt(0).toUpperCase() + proposal.contract.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Contract Title:</p>
                    <p className="text-gray-700">{proposal.contract.title}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Created:</p>
                    <p className="text-gray-700">
                      {new Date(proposal.contract.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {proposal.contract.status === 'changes_requested' && proposal.contract.changeRequests && (
                    <div>
                      <p className="font-medium mb-2 text-orange-600">Change Requests:</p>
                      <div className="space-y-2">
                        {proposal.contract.changeRequests.map((request, index) => (
                          <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-orange-800">{request.message}</p>
                            <p className="text-sm text-orange-600 mt-1">
                              Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/student/contracts/${proposal.contract?._id}`)}
                  >
                    View Contract Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/dashboard/student/jobs/${proposal.jobId._id}`)}
              >
                View Job Details
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/dashboard/student/proposals')}
              >
                All My Proposals
              </Button>
            </CardContent>
          </Card>

          {/* Business Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Business Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{proposal.jobId.businessId.name}</p>
                <p className="text-sm text-gray-600">{proposal.jobId.businessId.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
