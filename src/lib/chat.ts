import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  where
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Message, ChatRoom } from '@/types/chat';

// Chat rooms collection
const CHAT_ROOMS_COLLECTION = 'chatRooms';
const MESSAGES_COLLECTION = 'messages';

// Create a new chat room
export const createChatRoom = async (name: string, participants: string[]): Promise<string> => {
  try {
    const roomData: Omit<ChatRoom, 'id'> = {
      name,
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, CHAT_ROOMS_COLLECTION), roomData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Send a text message
export const sendTextMessage = async (
  roomId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<string> => {
  try {
    const messageData: Omit<Message, 'id'> = {
      roomId,
      senderId,
      senderName,
      text,
      timestamp: new Date(),
      type: 'text',
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    
    // Update room's last message and timestamp
    await updateDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId), {
      lastMessage: messageData,
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Upload file and send file message
export const sendFileMessage = async (
  roomId: string,
  senderId: string,
  senderName: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `chat-files/${roomId}/${Date.now()}-${file.name}`);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create message data
            const messageData: Omit<Message, 'id'> = {
              roomId,
              senderId,
              senderName,
              text: `Sent file: ${file.name}`,
              timestamp: new Date(),
              type: 'file',
              fileUrl: downloadURL,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            };

            // Add message to Firestore
            const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
            
            // Update room's last message and timestamp
            await updateDoc(doc(db, CHAT_ROOMS_COLLECTION, roomId), {
              lastMessage: messageData,
              updatedAt: new Date(),
            });

            resolve(docRef.id);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error sending file message:', error);
    throw error;
  }
};

// Subscribe to messages in a room
export const subscribeToMessages = (
  roomId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Message);
    });
    callback(messages);
  });
};

// Subscribe to chat rooms for a user
export const subscribeToUserChatRooms = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void
) => {
  const q = query(
    collection(db, CHAT_ROOMS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
        } : undefined,
      } as ChatRoom);
    });
    callback(rooms);
  });
};

// Delete a file message
export const deleteFileMessage = async (messageId: string, fileUrl: string) => {
  try {
    // Delete from storage
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    
    // Delete message from Firestore
    // Note: You might want to implement soft delete instead
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 