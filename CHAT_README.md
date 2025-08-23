# Chat with File Sharing Feature

A real-time chat application with file sharing capabilities built using Next.js, Firebase, and TypeScript.

## 🚀 Features

### Core Chat Features
- **Real-time messaging** - Instant message delivery using Firebase Firestore
- **File sharing** - Upload and share files with progress indicators
- **Multiple chat rooms** - Create and manage multiple conversation spaces
- **User-friendly interface** - Modern UI with responsive design

### File Sharing Capabilities
- **Progress tracking** - Real-time upload progress indicators
- **File information** - Display file name, size, and type
- **Download functionality** - Easy file downloads for recipients
- **Multiple file types** - Support for all file types

### Technical Features
- **Firebase integration** - Uses Firestore for messages and Storage for files
- **Test mode support** - Runs with Firebase emulators (no API keys required)
- **TypeScript** - Full type safety throughout the application
- **Real-time subscriptions** - Live updates using Firestore listeners

## 📁 Project Structure

```
src/
├── components/chat/
│   ├── ChatApp.tsx          # Main chat application component
│   ├── ChatWindow.tsx       # Individual chat window
│   └── ChatRoomList.tsx     # Chat room sidebar
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   └── chat.ts              # Chat service functions
├── types/
│   └── chat.ts              # TypeScript interfaces
└── app/chat-demo/
    └── page.tsx             # Demo page
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 3. Start Firebase Emulators
```bash
firebase emulators:start
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Demo
Navigate to: `http://localhost:3000/chat-demo`

## 🧪 Testing the Chat

### Multi-User Testing
1. Open the chat demo in multiple browser tabs
2. Use different user IDs and names for each tab
3. Create chat rooms and start messaging
4. Test file uploads and downloads

### Features to Test
- ✅ Create new chat rooms
- ✅ Send text messages
- ✅ Upload files with progress tracking
- ✅ Download shared files
- ✅ Real-time message updates
- ✅ Room switching
- ✅ File size and type display

## 🔧 Configuration

### Firebase Setup
The application is configured to work with Firebase emulators by default:

```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

### Emulator Ports
- **Firestore**: `localhost:8080`
- **Storage**: `localhost:9199`
- **Auth**: `localhost:9099`
- **Emulator UI**: `localhost:4000`

## 📊 Data Models

### Message Interface
```typescript
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}
```

### Chat Room Interface
```typescript
interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 API Functions

### Chat Service (`src/lib/chat.ts`)

#### Message Functions
- `sendTextMessage()` - Send text messages
- `sendFileMessage()` - Upload and send file messages
- `subscribeToMessages()` - Real-time message subscription

#### Room Functions
- `createChatRoom()` - Create new chat rooms
- `subscribeToUserChatRooms()` - Get user's chat rooms

#### File Functions
- `deleteFileMessage()` - Delete file messages and storage files

## 🎨 UI Components

### ChatApp
Main container component that combines room list and chat window.

### ChatWindow
Individual chat interface with:
- Message display with sender info and timestamps
- File upload with progress indicators
- File download functionality
- Real-time message updates

### ChatRoomList
Sidebar component showing:
- List of user's chat rooms
- Room creation dialog
- Last message preview
- Participant count

## 🔒 Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatRooms/{roomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chatRooms/$(resource.data.roomId)).data.participants;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat-files/{roomId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Production Deployment

### 1. Firebase Project Setup
1. Create a Firebase project
2. Enable Firestore and Storage
3. Configure security rules
4. Get project credentials

### 2. Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Update Firebase Config
Replace the demo configuration in `src/lib/firebase.ts` with real credentials.

### 4. Remove Emulator Connections
Comment out or remove the emulator connection code for production.

## 🐛 Troubleshooting

### Common Issues

#### Emulators Not Starting
- Check if ports are available
- Verify Firebase CLI installation
- Try `firebase login` first

#### Connection Errors
- Ensure emulators are running
- Check browser console for errors
- Verify Firebase configuration

#### File Upload Issues
- Check Storage emulator status
- Verify file size limits
- Check browser console for errors

### Debug Tips
- Use Firebase Emulator UI at `localhost:4000`
- Check browser developer tools
- Monitor Firestore and Storage in emulator UI

## 📈 Performance Considerations

### Optimization Tips
- Implement message pagination for large chats
- Add file size limits and type restrictions
- Use image compression for media files
- Implement message caching

### Scalability
- Consider using Firebase Functions for heavy operations
- Implement proper indexing for Firestore queries
- Use CDN for file storage in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Open an issue on GitHub 