// Import all models to ensure they are registered with Mongoose
// Import in dependency order to avoid circular references
import './User';        // No dependencies
import './Job';         // Depends on User
import './Proposal';    // Depends on User and Job
import './Contract';    // Depends on User, Job, and Proposal
import './ChatRoom';    // Depends on User
import './Message';     // Depends on User and ChatRoom

// Export models for convenience
export { default as User } from './User';
export { default as Job } from './Job';
export { default as Proposal } from './Proposal';
export { default as Contract } from './Contract';
export { default as ChatRoom } from './ChatRoom';
export { default as Message } from './Message';

console.log('All models registered successfully'); 