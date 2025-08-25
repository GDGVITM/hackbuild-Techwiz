import { Job } from '@/types/job';
import { StudentProfile } from '@/types/student';

export function calculateMatchScore(job: Job, student: StudentProfile): number {
  // Calculate skill overlap
  const skillOverlap = job.skills.filter(skill => 
    student.skills.includes(skill)
  ).length;
  
  const skillScore = job.skills.length > 0 ? skillOverlap / job.skills.length : 0;
  
  // Availability score (1 if available, 0 if not)
  const availabilityScore = student.availability.hoursPerWeek > 0 ? 1 : 0;
  
  // Rating score (normalize to 0-1)
  const ratingScore = student.ratingAvg ? student.ratingAvg / 5 : 0.5; // Default to 0.5 if no rating
  
  // Calculate weighted score
  return (skillScore * 0.6) + (availabilityScore * 0.2) + (ratingScore * 0.2);
}

export async function findMatchingStudents(jobId: string): Promise<any[]> {
  // Implementation would query database and return matching students
  return [];
}