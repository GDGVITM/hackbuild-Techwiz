// components/business/ContractForm.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
}

interface ContractFormProps {
  proposal: any;
  onSuccess: () => void;
}

export default function ContractForm({ proposal, onSuccess }: ContractFormProps) {
  const [formData, setFormData] = useState({
    title: `${proposal.jobId.title} Contract`,
    description: proposal.jobId.description,
    milestones: proposal.jobId.milestones || [],
    totalAmount: proposal.jobId.budgetMax,
    startDate: new Date(),
    endDate: new Date(),
    terms: `This contract is between ${proposal.businessId.name} and the student for the completion of the project: ${proposal.jobId.title}.`
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          proposalId: proposal._id,
          jobId: proposal.jobId._id,
          studentId: proposal.studentId
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Contract</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Contract Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Milestones</Label>
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="border p-3 rounded mb-2">
                <Input
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index].title = e.target.value;
                    setFormData({ ...formData, milestones: newMilestones });
                  }}
                />
                <Textarea
                  placeholder="Milestone description"
                  value={milestone.description}
                  onChange={(e) => {
                    const newMilestones = [...formData.milestones];
                    newMilestones[index].description = e.target.value;
                    setFormData({ ...formData, milestones: newMilestones });
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={milestone.amount}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones];
                      newMilestones[index].amount = Number(e.target.value);
                      setFormData({ ...formData, milestones: newMilestones });
                    }}
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
                        onSelect={(date) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index].dueDate = date;
                          setFormData({ ...formData, milestones: newMilestones });
                        }}
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
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
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
                  {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => setFormData({ ...formData, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={6}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Contract'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}