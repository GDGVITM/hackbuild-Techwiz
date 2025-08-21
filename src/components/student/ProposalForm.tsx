'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';

interface Milestone {
  title: string;
  amount: number;
  dueDate: string;
}

interface ProposalFormProps {
  jobId: string;
  onProposalSubmitted?: () => void;
}

export default function ProposalForm({ jobId, onProposalSubmitted }: ProposalFormProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', amount: 0, dueDate: '' }
  ]);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setMilestones(updatedMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', amount: 0, dueDate: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token) {
        setError('You must be logged in to submit a proposal');
        return;
      }

      const proposalData = {
        jobId,
        coverLetter,
        milestones: milestones.map(m => ({
          ...m,
          amount: Number(m.amount),
          dueDate: new Date(m.dueDate),
        })),
        quoteAmount: Number(quoteAmount),
      };

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(proposalData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onProposalSubmitted) {
          onProposalSubmitted();
        }
      } else {
        setError(data.error || 'Failed to submit proposal');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Submit Proposal</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="coverLetter">Cover Letter</Label>
          <Textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Explain why you're the best fit for this job..."
            required
          />
        </div>
        
        <div>
          <Label htmlFor="quoteAmount">Total Quote Amount ($)</Label>
          <Input
            id="quoteAmount"
            type="number"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Milestones</Label>
            <Button type="button" variant="outline" onClick={addMilestone}>
              + Add Milestone
            </Button>
          </div>
          
          {milestones.map((milestone, index) => (
            <div key={index} className="border rounded-md p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Milestone {index + 1}</h4>
                {milestones.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`milestone-title-${index}`}>Title</Label>
                  <Input
                    id={`milestone-title-${index}`}
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor={`milestone-amount-${index}`}>Amount ($)</Label>
                  <Input
                    id={`milestone-amount-${index}`}
                    type="number"
                    value={milestone.amount}
                    onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor={`milestone-date-${index}`}>Due Date</Label>
                  <Input
                    id={`milestone-date-${index}`}
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </Button>
      </form>
    </div>
  );
}