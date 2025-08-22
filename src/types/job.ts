export interface Job {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  budgetMin: number;
  budgetMax: number;
  businessId: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
