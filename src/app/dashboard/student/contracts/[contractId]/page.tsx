'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Notification } from '@/components/ui/notification';
import { useAuth } from '@/context/AuthContext';

interface ChangeRequest {
  _id: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

interface Contract {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'changes_requested';
  changeRequests?: ChangeRequest[];
  proposal: {
    jobId: {
      title: string;
      businessId: {
        name: string;
      };
    };
  };
}

export default function ContractDetailPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestMessage, setChangeRequestMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuth();
  const params = useParams();
  const contractId = params.contractId as string;
  const router = useRouter();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Contract not found');
          }
          throw new Error('Failed to fetch contract');
        }
        
        const data = await response.json();
        setContract(data.contract);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (token && contractId) {
      fetchContract();
    }
  }, [token, contractId]);

  const handleAcceptContract = async () => {
    if (!contract) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to accept contract');
      
      // Refresh contract data
      const data = await response.json();
      setContract(data.contract);
      
      setNotification({
        title: 'Contract Accepted',
        message: 'You have successfully accepted the contract.',
        type: 'success',
      });
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept contract');
      setNotification({
        title: 'Error',
        message: 'Failed to accept contract. Please try again.',
        type: 'error',
      });
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!contract || !changeRequestMessage.trim()) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/request-changes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: changeRequestMessage }),
      });
      
      if (!response.ok) throw new Error('Failed to request changes');
      
      // Close modal and reset
      setShowChangeRequestModal(false);
      setChangeRequestMessage('');
      
      // Refresh contract data
      const data = await response.json();
      setContract(data.contract);
      
      setNotification({
        title: 'Change Request Sent',
        message: 'Your change request has been sent to the business.',
        type: 'info',
      });
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send change request');
      setNotification({
        title: 'Error',
        message: 'Failed to send change request. Please try again.',
        type: 'error',
      });
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'pending': return <Badge variant="outline">Pending Signature</Badge>;
      case 'signed': return <Badge className="bg-green-500">Signed</Badge>;
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'changes_requested': return <Badge variant="destructive">Changes Requested</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading contract...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">⚠️</div>
      <h3 className="text-lg font-semibold mb-2">Error Loading Contract</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => router.back()} variant="outline">
        Go Back
      </Button>
    </div>
  );
  
  if (!contract) return (
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Contract not found</h3>
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
          <Notification
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{contract.title}</CardTitle>
              <p className="text-gray-600 mt-1">
                {contract.proposal.jobId.title} • {contract.proposal.jobId.businessId.name}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {getStatusBadge(contract.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none border rounded-lg p-6 bg-gray-50 my-6">
            <div dangerouslySetInnerHTML={{ __html: contract.content }} />
          </div>
          
          {/* Change Requests Section */}
          {contract.changeRequests && contract.changeRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Change Requests</h3>
              <div className="space-y-3">
                {contract.changeRequests.map((cr) => (
                  <div key={cr._id} className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-gray-700">{cr.message}</p>
                    <div className="flex justify-between mt-2">
                      <Badge variant="outline">{cr.status}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(cr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            Created: {new Date(contract.createdAt).toLocaleDateString()}
          </div>
          
          {/* Action Buttons */}
          {contract.status === 'pending' && (
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleAcceptContract}
                className="bg-green-600 hover:bg-green-700"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Accept Contract'}
              </Button>
              <Button 
                variant="outline"
                className="text-orange-600 border-orange-300"
                onClick={() => setShowChangeRequestModal(true)}
                disabled={actionLoading}
              >
                Request Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Change Request Modal */}
      <Dialog open={showChangeRequestModal} onOpenChange={setShowChangeRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe the changes you would like to request for this contract.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Please describe the changes you would like to request..."
            value={changeRequestMessage}
            onChange={(e) => setChangeRequestMessage(e.target.value)}
            rows={4}
            className="my-4"
          />
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowChangeRequestModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestChanges}
              disabled={!changeRequestMessage.trim() || actionLoading}
            >
              {actionLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}