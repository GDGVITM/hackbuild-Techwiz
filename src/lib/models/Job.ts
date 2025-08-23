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
    company?: string; // Added for company name
    companyLogo?: string; // Added for company logo
    location?: string; // Added for job location
    duration?: string; // Added for job duration
}

const jobSchema = new Schema<IJob>(
    {
        businessId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        skillsRequired: [{
            type: String
        }],
        budgetMin: {
            type: Number,
            required: true
        },
        budgetMax: {
            type: Number,
            required: true
        },
        milestones: [
            {
                title: {
                    type: String,
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                },
                dueDate: {
                    type: Date,
                    required: true
                },
            },
        ],
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open'
        },
        // Additional fields for better job representation
        company: {
            type: String,
            required: false
        },
        companyLogo: {
            type: String,
            required: false
        },
        location: {
            type: String,
            required: false,
            default: "Remote"
        },
        duration: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Virtual field to populate business details
jobSchema.virtual('businessDetails', {
    ref: 'User',
    localField: 'businessId',
    foreignField: '_id',
    justOne: true
});

// Text index for search functionality
jobSchema.index({
    title: 'text',
    description: 'text',
    skillsRequired: 'text',
    company: 'text',
    location: 'text'
});

// Compound index for businessId and status for efficient queries
jobSchema.index({ businessId: 1, status: 1 });

// Middleware to populate business details when querying
jobSchema.pre(/^find/, function () {
    this.populate('businessDetails');
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);