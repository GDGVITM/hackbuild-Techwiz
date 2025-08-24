'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {job.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2">
              {job.description}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getStatusColor(job.status)}`}>
            {job.status === 'open' ? 'Active' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Job Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-600">
              ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{job.milestones.length} milestone{job.milestones.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Latest Milestone Due Date */}
        {job.milestones.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span>Latest due: {formatDate(job.milestones[job.milestones.length - 1].dueDate)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewDetails}
            className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          >
            View Details
          </Button>
          {user?.role === 'student' && (
            <Button 
              size="sm" 
              onClick={handleSubmitProposal}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}