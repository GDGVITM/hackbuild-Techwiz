import mongoose, { Schema } from 'mongoose';

const jobSchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    milestones: [{
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date, required: true }
    }],
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

// Text index for search
jobSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Job || mongoose.model('Job', jobSchema);