import mongoose from 'mongoose';

// Import all model schemas
import User from './User';
import Job from './Job';
import Proposal from './Proposal';
import Contract from './Contract';
import ChatRoom from './ChatRoom';
import Message from './Message';

// Function to ensure all models are registered
export function ensureModelsRegistered() {
  try {
    // Check if models are already registered
    const registeredModels = Object.keys(mongoose.connection.models);
    console.log('Currently registered models:', registeredModels);
    
    // Force model registration if not already present
    if (!mongoose.models.User) {
      console.log('Registering User model...');
      mongoose.model('User', User.schema);
    }
    
    if (!mongoose.models.Job) {
      console.log('Registering Job model...');
      mongoose.model('Job', Job.schema);
    }
    
    if (!mongoose.models.Proposal) {
      console.log('Registering Proposal model...');
      mongoose.model('Proposal', Proposal.schema);
    }
    
    if (!mongoose.models.Contract) {
      console.log('Registering Contract model...');
      mongoose.model('Contract', Contract.schema);
    }
    
    if (!mongoose.models.ChatRoom) {
      console.log('Registering ChatRoom model...');
      mongoose.model('ChatRoom', ChatRoom.schema);
    }
    
    if (!mongoose.models.Message) {
      console.log('Registering Message model...');
      mongoose.model('Message', Message.schema);
    }
    
    const finalModels = Object.keys(mongoose.connection.models);
    console.log('Final registered models:', finalModels);
    
    return true;
  } catch (error) {
    console.error('Error registering models:', error);
    return false;
  }
}

// Export the function
export default ensureModelsRegistered; 