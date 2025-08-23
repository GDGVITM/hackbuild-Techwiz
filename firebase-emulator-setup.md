# Firebase Emulator Setup for Chat Demo

This guide will help you set up Firebase emulators to run the chat functionality in test mode without requiring any API keys.

## Prerequisites

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Install the required dependencies:
```bash
npm install
```

## Setup Steps

### 1. Initialize Firebase (if not already done)
```bash
firebase init
```

When prompted:
- Select "Firestore" and "Storage"
- Choose "Use an existing project" or create a new one
- Accept the default file locations

### 2. Start Firebase Emulators
```bash
firebase emulators:start
```

This will start:
- Firestore emulator on port 8080
- Storage emulator on port 9199
- Auth emulator on port 9099

### 3. Run the Development Server
In a new terminal:
```bash
npm run dev
```

### 4. Access the Chat Demo
Navigate to: `http://localhost:3000/chat-demo`

## Features Available

✅ **Real-time messaging** - Messages appear instantly across browser tabs
✅ **File sharing** - Upload and share files with progress indicators
✅ **Multiple chat rooms** - Create and switch between different rooms
✅ **No API keys required** - Everything runs locally with emulators

## Testing the Chat

1. Open the chat demo in multiple browser tabs
2. Use different user IDs and names for each tab
3. Create chat rooms and start messaging
4. Try uploading files to see the progress indicators
5. Test real-time updates across tabs

## Emulator UI

Access the Firebase Emulator UI at: `http://localhost:4000`

This provides:
- Firestore data viewer
- Storage file manager
- Authentication user management
- Real-time database monitoring

## Troubleshooting

### Emulators not starting
- Make sure ports 8080, 9199, and 9099 are available
- Check if Firebase CLI is properly installed
- Try running `firebase login` first

### Connection errors
- Ensure emulators are running before starting the dev server
- Check browser console for connection errors
- Verify the Firebase configuration in `src/lib/firebase.ts`

### File upload issues
- Check if Storage emulator is running on port 9199
- Verify file size limits (default is 5MB)
- Check browser console for upload errors

## Production Deployment

When ready for production:
1. Replace the demo Firebase config with real project credentials
2. Remove emulator connections from `src/lib/firebase.ts`
3. Set up proper Firebase project with Firestore and Storage enabled
4. Configure security rules for Firestore and Storage

## Security Rules (for production)

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