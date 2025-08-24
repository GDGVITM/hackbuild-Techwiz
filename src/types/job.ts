export interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];   // ✅ correct
  budgetMin: number;
  budgetMax: number;
  businessId: string;
  status: 'open' | 'closed';
  company?: string;
  companyLogo?: string;
  location?: string;
  duration?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    dueDate: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}


