// src/lib/models/Proposal.ts
import mongoose, { Schema } from 'mongoose';

const milestoneSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true }
});

const proposalSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  milestones: [milestoneSchema],
  quoteAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  attachments: [{ type: String }], // URLs to uploaded files
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for better query performance
proposalSchema.index({ jobId: 1, status: 1 });
proposalSchema.index({ studentId: 1, status: 1 });

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);