import mongoose, { Schema } from 'mongoose';

const chatRoomSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Index for better query performance
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

// Pre-save middleware to update the updatedAt field
chatRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add participant
chatRoomSchema.methods.addParticipant = function(userId: string) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
  }
  return this.save();
};

// Method to remove participant
chatRoomSchema.methods.removeParticipant = function(userId: string) {
  this.participants = this.participants.filter(id => id.toString() !== userId);
  return this.save();
};

// Static method to find rooms by participant
chatRoomSchema.statics.findByParticipant = function(userId: string) {
  return this.find({ participants: userId })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
};

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema); 