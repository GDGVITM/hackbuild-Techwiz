import mongoose, { Schema } from 'mongoose';

const proposalSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  milestones: [{
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true }
  }],
  quoteAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);