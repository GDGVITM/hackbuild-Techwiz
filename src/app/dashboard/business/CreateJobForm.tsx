'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Milestone {
  title: string;
  amount: number;
  dueDate: string;
}

export default function CreateJobForm({ onJobCreated }: { onJobCreated: (job: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    budgetMin: '',
    budgetMax: '',
  });
  
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', amount: 0, dueDate: '' }
  ]);
  
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
    
    try {
      if (!token) {
        setError('You must be logged in to post a job');
        return;
      }

      const skillsArray = formData.skillsRequired
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const jobData = {
        ...formData,
        skillsRequired: skillsArray,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        milestones: milestones.map(m => ({
          ...m,
          amount: Number(m.amount),
          dueDate: new Date(m.dueDate),
        })),
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (response.ok) {
        onJobCreated(data.job);
        setFormData({
          title: '',
          description: '',
          skillsRequired: '',
          budgetMin: '',
          budgetMax: '',
        });
        setMilestones([{ title: '', amount: 0, dueDate: '' }]);
      } else {
        setError(data.error || 'Failed to create job');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="skillsRequired" className="block text-gray-700 mb-2">Skills Required (comma separated)</label>
          <input
            type="text"
            id="skillsRequired"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., React, Node.js, MongoDB"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="budgetMin" className="block text-gray-700 mb-2">Minimum Budget ($)</label>
            <input
              type="number"
              id="budgetMin"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="budgetMax" className="block text-gray-700 mb-2">Maximum Budget ($)</label>
            <input
              type="number"
              id="budgetMax"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Milestones</h3>
            <button
              type="button"
              onClick={addMilestone}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Milestone
            </button>
          </div>
          
          {milestones.map((milestone, index) => (
            <div key={index} className="border rounded-md p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Milestone {index + 1}</h4>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={milestone.amount}
                    onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Post Job
        </button>
      </form>
    </div>
  );
}