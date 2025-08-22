import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    businessId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    skillsRequired: string[];
    budgetMin: number;
    budgetMax: number;
    milestones: { title: string; amount: number; dueDate: Date }[];
    status: 'open' | 'closed';
}

const jobSchema = new Schema<IJob>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 👈 reference to User
        title: { type: String, required: true },
        description: { type: String, required: true },
        skillsRequired: [{ type: String }],
        budgetMin: { type: Number, required: true },
        budgetMax: { type: Number, required: true },
        milestones: [
            {
                title: { type: String, required: true },
                amount: { type: Number, required: true },
                dueDate: { type: Date, required: true },
            },
        ],
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
    },
    { timestamps: true }
);

// Text index for search
jobSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
