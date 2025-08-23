import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  roomId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: { 
    type: String, 
    default: '' 
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  type: { 
    type: String, 
    enum: ['text', 'file'], 
    default: 'text' 
  },
  fileUrl: { 
    type: String 
  },
  fileName: { 
    type: String 
  },
  fileSize: { 
    type: Number 
  },
  fileType: { 
    type: String 
  }
}, { timestamps: true });

// Index for better query performance
messageSchema.index({ roomId: 1, timestamp: 1 });
messageSchema.index({ senderId: 1 });

// Pre-save middleware to set sender name if not provided
messageSchema.pre('save', async function(next) {
  if (!this.senderName && this.senderId) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.senderId).select('name');
      if (user) {
        this.senderName = user.name;
      }
    } catch (error) {
      console.error('Error setting sender name:', error);
    }
  }
  next();
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema); 