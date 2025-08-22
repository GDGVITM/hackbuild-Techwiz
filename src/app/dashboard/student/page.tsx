'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job } from '@/types/job';
import { useAuth } from '@/context/AuthContext';

interface Proposal {
  _id: string;
  jobId: string;
  status: string;
}

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const { token } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        if (response.ok) {
          setJobs(data.jobs);
          setFilteredJobs(data.jobs);
        } else {
          setError(data.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/proposals', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          setProposals(data.proposals);
        }
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      }
    };
    fetchProposals();
  }, [token]);

  // Filter and search jobs
  useEffect(() => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skillsRequired.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by skill
    if (skillFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.skillsRequired.includes(skillFilter)
      );
    }

    // Filter by budget
    if (budgetFilter !== 'all') {
      const [min, max] = budgetFilter.split('-').map(Number);
      filtered = filtered.filter(job => {
        const avgBudget = (job.budgetMin + job.budgetMax) / 2;
        return avgBudget >= min && avgBudget <= max;
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, skillFilter, budgetFilter]);

  // Create a set of job IDs that the student has already applied to
  const appliedJobIds = new Set(proposals.map(p => p.jobId));
  
  // Get the status of a proposal for a specific job
  const getProposalStatus = (jobId: string) => {
    const proposal = proposals.find(p => p.jobId === jobId);
    return proposal ? proposal.status : null;
  };

  // Get unique skills from all jobs
  const getAllSkills = () => {
    const skills = new Set<string>();
    jobs.forEach(job => {
      job.skillsRequired.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading available jobs...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">⚠️</div>
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const allSkills = getAllSkills();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Available Jobs</h1>
          <p className="text-gray-600 mt-1">Find and apply to jobs that match your skills</p>
        </div>
        <Link href="/dashboard/student/proposals">
          <Button variant="outline">
            My Proposals ({proposals.length})
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All skills</SelectItem>
                {allSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <Select value={budgetFilter} onValueChange={setBudgetFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All budgets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All budgets</SelectItem>
                <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="10000-50000">$10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSkillFilter('all');
                setBudgetFilter('all');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
          <p className="text-gray-500 mb-6">
            {searchTerm || skillFilter !== 'all' || budgetFilter !== 'all'
              ? 'Try adjusting your filters to see more jobs.'
              : 'No jobs are currently available. Check back later!'}
          </p>
          {(searchTerm || skillFilter !== 'all' || budgetFilter !== 'all') && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSkillFilter('all');
                setBudgetFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job._id);
            const proposalStatus = getProposalStatus(job._id);
            
            return (
              <Card key={job._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                    {hasApplied && (
                      <Badge 
                        variant={
                          proposalStatus === 'accepted' ? 'default' :
                          proposalStatus === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className={
                          proposalStatus === 'accepted' ? 'bg-green-500' : ''
                        }
                      >
                        {proposalStatus === 'accepted' ? 'Accepted' :
                         proposalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {job.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skillsRequired.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skillsRequired.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skillsRequired.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-green-600 font-semibold">
                      ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {job.milestones.length} milestone{job.milestones.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/dashboard/student/jobs/${job._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {!hasApplied ? (
                      <Link href={`/dashboard/student/jobs/${job._id}?action=submit`} className="flex-1">
                        <Button className="w-full">
                          Apply Now
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="flex-1" disabled>
                        Applied
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}