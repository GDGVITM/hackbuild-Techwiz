'use client';

import { useState } from 'react';
import { Job } from '@/types/job';

export default function JobCard({ job }: { job: Job }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
        <p className="text-gray-600 mb-2">{job.description.substring(0, 100)}...</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skillsRequired.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-medium">
            ${job.budgetMin} - ${job.budgetMax}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div className="px-4 pb-4 border-t">
          <h4 className="font-medium mt-3 mb-2">Milestones:</h4>
          <ul className="space-y-2">
            {job.milestones.map((milestone, index) => (
              <li key={index} className="flex justify-between">
                <span>{milestone.title}</span>
                <span>${milestone.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}