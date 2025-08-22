'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  _id: string;
  coverLetter: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  jobId: {
    _id: string;
    title: string;
    description: string;
    businessId: {
      _id: string;
      name: string;
    };
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  quoteAmount: number;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }>;
}

interface Contract {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'changes_requested';
  changeRequests?: Array<{
    _id: string;
    message: string;
    status: 'pending' | 'resolved';
    createdAt: string;
  }>;
}

export default function ProposalDetailPage() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const { token } = useAuth();
  const params = useParams();
  const proposalId = params.id as string;
  const router = useRouter();

  // Fetch proposal details
  useEffect(() => {
    const fetchProposal = async () => {
      if (!token || !proposalId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/proposals/${proposalId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Proposal not found');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch proposal');
        }
        
        const data = await response.json();
        setProposal(data.proposal);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setNotification({
          title: 'Error',
          message: errorMessage,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [token, proposalId]);

  // Fetch contract details if proposal is accepted
  useEffect(() => {
    const fetchContract = async () => {
      if (!proposal || proposal.status !== 'accepted' || !token) {
        return;
      }
      
      try {
        // Fetch contracts that reference this proposal
        const response = await fetch(`/api/contracts?proposalId=${proposal._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          // If we can't fetch contracts, it's not a critical error
          console.error('Failed to fetch contract');
          return;
        }
        
        const data = await response.json();
        // Find the contract associated with this proposal
        const proposalContract = data.contracts?.find((c: Contract) => 
          c.proposalId === proposal._id || 
          (c as any).proposal === proposal._id
        );
        
        if (proposalContract) {
          setContract(proposalContract);
        }
      } catch (err) {
        console.error('Error fetching contract:', err);
      }
    };
    
    if (proposal) {
      fetchContract();
    }
  }, [proposal, token]);

  const handleViewContract = () => {
    if (contract) {
      router.push(`/dashboard/student/contracts/${contract._id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted': 
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected': 
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn': 
        return <Badge variant="secondary">Withdrawn</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Auto-hide notification after 10 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading proposal...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">⚠️</div>
      <h3 className="text-lg font-semibold mb-2">Error Loading Proposal</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => router.back()} variant="outline">
        Go Back
      </Button>
    </div>
  );
  
  if (!proposal) return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Proposal not found</h3>
      <Button onClick={() => router.back()} variant="outline">
        Go Back
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className="mb-6">
          <Alert className={notification.type === 'error' ? 'border-red-500' : ''}>
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{proposal.jobId.title}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {proposal.jobId.businessId.name}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {getStatusBadge(proposal.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Job Description</h3>
                <p className="text-gray-700">{proposal.jobId.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Cover Letter</h3>
                <p className="text-gray-700">{proposal.coverLetter}</p>
              </div>
              
              {proposal.milestones && proposal.milestones.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Milestones</h3>
                  <div className="space-y-3">
                    {proposal.milestones.map((milestone, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${milestone.amount.toLocaleString()}</p>
                            <p className="text-gray-500 text-sm">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-sm text-gray-500">
                Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contract & Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              {proposal.status === 'accepted' ? (
                contract ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Contract Status</h3>
                      <Badge 
                        className={
                          contract.status === 'signed' ? 'bg-green-500' : 
                          contract.status === 'pending' ? 'bg-yellow-500' : 
                          contract.status === 'changes_requested' ? 'bg-red-500' : ''
                        }
                      >
                        {contract.status === 'draft' && 'Draft'}
                        {contract.status === 'pending' && 'Pending Signature'}
                        {contract.status === 'signed' && 'Signed'}
                        {contract.status === 'completed' && 'Completed'}
                        {contract.status === 'changes_requested' && 'Changes Requested'}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Contract Created</h3>
                      <p className="text-gray-600">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleViewContract}
                      className="w-full"
                    >
                      View Contract Details
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Contract is being prepared. Please check back later.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Contract Not Available
                    </Button>
                  </div>
                )
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    {proposal.status === 'pending' && 'Your proposal is under review.'}
                    {proposal.status === 'rejected' && 'Your proposal was not accepted.'}
                    {proposal.status === 'withdrawn' && 'You have withdrawn this proposal.'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    No Contract Available
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/student/jobs/${proposal.jobId._id}`)}
                >
                  View Job Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Back to Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}