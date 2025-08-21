'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleViewDetails = () => {
    if (user?.role === 'student') {
      router.push(`/dashboard/student/jobs/${job._id}`);
    } else if (user?.role === 'business') {
      router.push(`/dashboard/business/jobs/${job._id}`);
    }
  };

  const handleSubmitProposal = () => {
    router.push(`/dashboard/student/jobs/${job._id}?action=submit`);
  };

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
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Details
            </button>
            {user?.role === 'student' && (
              <button
                onClick={handleSubmitProposal}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
              >
                Submit Proposal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}