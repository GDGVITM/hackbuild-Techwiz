import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'business', 'admin'], required: true },
  phone: { type: String, required: true },
  avatarUrl: { type: String },
  gstin: { type: String },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  // Additional fields for student profiles
  bio: { type: String },
  skills: [{ type: String }],
  experience: { type: String, enum: ['0-1', '1-3', '3-5', '5-10', '10+'] },
  portfolio: { type: String },
  availability: { type: String },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    url: String
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);