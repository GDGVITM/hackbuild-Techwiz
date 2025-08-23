// src/lib/models/Proposal.ts
import mongoose, { Schema } from 'mongoose';

const milestoneSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String }, // Optional description for each milestone
  status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' }
});

const statusHistorySchema = new Schema({
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'] },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // who changed the status
  reason: { type: String } // reason for status change
});

const proposalSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  milestones: [milestoneSchema],
  quoteAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  attachments: [{ type: String }], // URLs to uploaded files
  submittedAt: { type: Date, default: Date.now },
  
  // Additional fields for better tracking
  estimatedDuration: { type: Number }, // in days
  startDate: { type: Date }, // when work will start
  completionDate: { type: Date }, // expected completion date
  
  // Communication and feedback
  businessFeedback: { type: String }, // feedback from business when rejecting/accepting
  studentNotes: { type: String }, // notes from student
  
  // Timestamps for status changes
  statusHistory: [statusHistorySchema],
  
  // Contract details (when accepted)
  contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },
  
  // Analytics
  viewCount: { type: Number, default: 0 }, // how many times viewed by business
  lastViewedAt: { type: Date }
}, { timestamps: true });

// Create indexes for better query performance
proposalSchema.index({ jobId: 1, status: 1 });
proposalSchema.index({ studentId: 1, status: 1 });
proposalSchema.index({ submittedAt: -1 });
proposalSchema.index({ quoteAmount: 1 });
proposalSchema.index({ 'statusHistory.changedAt': -1 });
proposalSchema.index({ contractId: 1 }); // Add index for contractId

// Pre-save middleware to track status changes
proposalSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Mongoose will handle the array initialization automatically
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      reason: this.status === 'rejected' ? this.businessFeedback : undefined
    });
  }
  next();
});

// Virtual for total milestone amount
proposalSchema.virtual('totalMilestoneAmount').get(function() {
  return this.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
});

// Method to check if proposal is within budget
proposalSchema.methods.isWithinBudget = function(jobBudgetMin: number, jobBudgetMax: number) {
  return this.quoteAmount >= jobBudgetMin && this.quoteAmount <= jobBudgetMax;
};

// Method to update contract ID when contract is created
proposalSchema.methods.updateContractId = function(contractId: Schema.Types.ObjectId) {
  this.contractId = contractId;
  return this.save();
};

// Static method to get proposals by status
proposalSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

// Static method to get proposals for a specific job
proposalSchema.statics.findByJob = function(jobId: string) {
  return this.find({ jobId }).populate('studentId', 'name email');
};

// Static method to get proposals with contracts
proposalSchema.statics.findWithContracts = function() {
  return this.find({ contractId: { $exists: true, $ne: null } })
    .populate('contractId')
    .populate('studentId', 'name email')
    .populate('jobId');
};

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);
