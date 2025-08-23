'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  _id: string;
  title: string;
  status: "draft" | "pending" | "signed" | "completed" | "changes_requested" | "approved";
  paymentStatus?: "pending" | "paid";
}

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    milestones: Array<{
      title: string;
      amount: number;
      dueDate: string;
    }>;
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
  contractId?: string | Contract; // Can be either ID string or populated object
}

interface ProposalListProps {
  jobId?: string;
  status?: string;
}

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
}

export default function ProposalList({ jobId, status }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [createContractFor, setCreateContractFor] = useState<Proposal | null>(null);
  
  // Add these state variables at the top of the component
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [aiGeneratedTerms, setAiGeneratedTerms] = useState('');
  
  // Add this to your component
  const [contractStatus, setContractStatus] = useState(null);
  
  // Add to your component state
  const [requestedChanges, setRequestedChanges] = useState('');
  
  const { token, user } = useAuth();
  const { toast } = useToast();
  
  // Contract form state
  const [contractForm, setContractForm] = useState({
    title: '',
    description: '',
    milestones: [] as Milestone[],
    totalAmount: 0,
    startDate: new Date(),
    endDate: new Date(),
    terms: ''
  });

  // Function to fetch contract details
  const fetchContractDetails = async (contractId: string): Promise<Contract | null> => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.contract;
      }
      return null;
    } catch (error) {
      console.error('Error fetching contract details:', error);
      return null;
    }
  };

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
      const proposalsData = data.proposals || [];
      
      // Fetch contract details for proposals that have a contractId
      const proposalsWithContracts = await Promise.all(
        proposalsData.map(async (proposal: Proposal) => {
          if (proposal.contractId && typeof proposal.contractId === 'string') {
            const contractDetails = await fetchContractDetails(proposal.contractId);
            return { ...proposal, contractId: contractDetails };
          }
          return proposal;
        })
      );
      
      setProposals(proposalsWithContracts);
      setFilteredProposals(proposalsWithContracts);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  // Function to check contract status
  const checkContractStatus = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContractStatus(data.contract.status);
        
        // Handle different statuses
        if (data.contract.status === 'approved') {
          // Show payment options
        } else if (data.contract.status === 'changes_requested') {
          // Show requested changes
        }
      }
    } catch (error) {
      console.error('Error checking contract status:', error);
    }
  };

  // Function to fetch requested changes
  const fetchRequestedChanges = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/changes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequestedChanges(data.changes);
      }
    } catch (error) {
      console.error('Error fetching requested changes:', error);
    }
  };

  // Function to handle payment
  const handlePayment = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: 'Payment processed',
          description: 'Your payment has been processed successfully.',
        });
        fetchProposals();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Payment failed',
          description: errorData.error || 'Failed to process payment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Failed to process payment.',
        variant: 'destructive',
      });
    }
  };

  // Function to update contract with changes
  const handleUpdateContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...contractForm,
          status: 'pending' // Reset to pending for student review
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Contract updated',
          description: 'The updated contract has been sent to the student for review.',
        });
        
        // Close dialog and refresh data
        setCreateContractFor(null);
        fetchProposals();
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: 'Failed to update contract',
        description: error instanceof Error ? error.message : 'Failed to update contract.',
        variant: 'destructive',
      });
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

  // Initialize contract form when a proposal is selected for contract creation
  useEffect(() => {
    if (createContractFor) {
      // Check if milestones exists, otherwise use an empty array
      const jobMilestones = createContractFor.jobId.milestones || [];
      
      setContractForm({
        title: `${createContractFor.jobId.title} Contract`,
        description: createContractFor.jobId.description,
        milestones: jobMilestones.map(m => ({
          title: m.title,
          description: '', // Add empty description to match Milestone interface
          amount: m.amount,
          dueDate: new Date(m.dueDate)
        })),
        totalAmount: createContractFor.quoteAmount,
        startDate: new Date(),
        endDate: new Date(),
        terms: `This contract is between the business and ${createContractFor.studentId.name} for the completion of the project: ${createContractFor.jobId.title}.`
      });
    }
  }, [createContractFor]);

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

  const handleCreateContract = async () => {
    if (!createContractFor || !user) return;
    
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...contractForm,
          proposalId: createContractFor._id,
          jobId: createContractFor.jobId._id,
          businessId: user.id, // Use the user ID from auth context
          studentId: createContractFor.studentId._id
        }),
      });
      
      // First check if the response is OK
      if (!response.ok) {
        // Try to get the error text
        const errorText = await response.text();
        console.error('Server responded with:', response.status, errorText);
        
        // Try to parse as JSON if possible, otherwise use the text
        let errorMessage = 'Failed to create contract';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        toast({
          title: 'Failed to create contract',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      
      // If response is OK, try to parse the JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', await response.text());
        toast({
          title: 'Failed to create contract',
          description: 'Invalid response from server',
          variant: 'destructive',
        });
        return;
      }
      
      // If we got here, everything is successful
      toast({
        title: 'Contract created successfully',
        description: 'The contract has been sent to the student for review.',
      });
      setCreateContractFor(null);
      fetchProposals();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: 'Failed to create contract',
        description: error instanceof Error ? error.message : 'Failed to create contract.',
        variant: 'destructive',
      });
    }
  };

  // Add the AI generation function
  const handleGenerateContractWithAI = async () => {
    if (!createContractFor || !user) return;
    
    setIsGeneratingContract(true);
    
    try {
      const response = await fetch('/api/ai/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle: createContractFor.jobId.title,
          jobDescription: createContractFor.jobId.description,
          studentName: createContractFor.studentId.name,
          businessName: user.name,
          milestones: contractForm.milestones,
          totalAmount: contractForm.totalAmount,
          startDate: contractForm.startDate.toISOString().split('T')[0],
          endDate: contractForm.endDate.toISOString().split('T')[0],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate contract');
      }
      
      const data = await response.json();
      setAiGeneratedTerms(data.contract);
      
      // Update the contract form with the generated terms
      setContractForm({
        ...contractForm,
        terms: data.contract
      });
      
      toast({
        title: 'Contract generated successfully',
        description: 'Review the generated contract and make any necessary adjustments.',
      });
    } catch (error) {
      console.error('Error generating contract:', error);
      toast({
        title: 'Failed to generate contract',
        description: error instanceof Error ? error.message : 'Failed to generate contract.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingContract(false);
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number | Date | undefined) => {
    const newMilestones = [...contractForm.milestones];
    if (newMilestones[index] && value !== undefined) {
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      setContractForm({ ...contractForm, milestones: newMilestones });
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
                    
                    {/* Add this to your proposal card for accepted proposals with contracts */}
                    {proposal.status === 'accepted' && proposal.contractId && typeof proposal.contractId !== 'string' && (
                      <div className="mt-2">
                        <Badge variant={
                          proposal.contractId.status === 'approved' ? 'default' : 
                          proposal.contractId.status === 'changes_requested' ? 'destructive' :
                          proposal.contractId.status === 'signed' ? 'secondary' :
                          proposal.contractId.status === 'completed' ? 'outline' : 'secondary'
                        }>
                          Contract: {proposal.contractId.status}
                        </Badge>
                        
                        {/* Show payment button when contract is approved and payment is pending */}
                        {proposal.contractId.status === 'approved' && proposal.contractId.paymentStatus === 'pending' && (
                          <Button 
                            size="sm" 
                            className="ml-2"
                            onClick={() => handlePayment(proposal.contractId._id)}
                          >
                            Make Payment
                          </Button>
                        )}
                        
                        {/* Show payment status when payment is completed */}
                        {proposal.contractId.paymentStatus === 'paid' && (
                          <Badge variant="outline" className="ml-2">
                            Payment: Paid
                          </Badge>
                        )}
                        
                        {/* Show review changes button when student requests changes */}
                        {proposal.contractId.status === 'changes_requested' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="ml-2"
                            onClick={() => {
                              setCreateContractFor(proposal);
                              fetchRequestedChanges(proposal.contractId._id);
                            }}
                          >
                            Review Changes
                          </Button>
                        )}
                        
                        {/* Show project status when contract is signed or completed */}
                        {proposal.contractId.status === 'signed' && (
                          <Badge variant="secondary" className="ml-2">
                            Project: In Progress
                          </Badge>
                        )}
                        
                        {proposal.contractId.status === 'completed' && (
                          <Badge variant="outline" className="ml-2">
                            Project: Completed
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {proposal.status === 'accepted' && (!proposal.contractId || typeof proposal.contractId === 'string') && (
                      <Button 
                        size="sm"
                        onClick={() => setCreateContractFor(proposal)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Create Contract
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Contract Dialog */}
      {createContractFor && (
        <Dialog open={!!createContractFor} onOpenChange={() => setCreateContractFor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Contract</DialogTitle>
              <DialogDescription>
                Create a contract for {createContractFor.studentId.name} for the project: {createContractFor.jobId.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Add AI Generation Option */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-800">Generate Contract with AI</h3>
                    <p className="text-sm text-blue-600">Save time by generating a professional contract draft</p>
                  </div>
                  <Button 
                    onClick={handleGenerateContractWithAI}
                    disabled={isGeneratingContract}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingContract ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  value={contractForm.title}
                  onChange={(e) => setContractForm({...contractForm, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={contractForm.description}
                  onChange={(e) => setContractForm({...contractForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Milestones</Label>
                {contractForm.milestones.map((milestone, index) => (
                  <div key={index} className="border p-3 rounded mb-2">
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="my-2"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {milestone.dueDate ? format(milestone.dueDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={milestone.dueDate}
                            onSelect={(date) => updateMilestone(index, 'dueDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    value={contractForm.totalAmount}
                    onChange={(e) => setContractForm({...contractForm, totalAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contractForm.startDate ? format(contractForm.startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={contractForm.startDate}
                        onSelect={(date) => setContractForm({...contractForm, startDate: date || new Date()})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {contractForm.endDate ? format(contractForm.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={contractForm.endDate}
                      onSelect={(date) => setContractForm({...contractForm, endDate: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  value={contractForm.terms}
                  onChange={(e) => setContractForm({...contractForm, terms: e.target.value})}
                  rows={10}
                  placeholder={aiGeneratedTerms ? "Review and edit the AI-generated terms below" : "Enter contract terms and conditions"}
                />
                {aiGeneratedTerms && (
                  <div className="mt-2 text-sm text-gray-500">
                    AI-generated contract provided. Please review and edit as needed.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateContractFor(null)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContract}>
                  Create Contract
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}