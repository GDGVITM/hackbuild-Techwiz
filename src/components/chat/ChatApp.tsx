'use client';

import { useState } from 'react';
import ChatRoomList from './ChatRoomList';
import ChatWindow from './ChatWindow';

interface ChatAppProps {
  userId: string;
  userName: string;
}

export default function ChatApp({ userId, userName }: ChatAppProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatRoomList
        userId={userId}
        onRoomSelect={setSelectedRoomId}
        selectedRoomId={selectedRoomId}
      />
      
      <div className="flex-1">
        {selectedRoomId ? (
          <ChatWindow
            roomId={selectedRoomId}
            userId={userId}
            userName={userName}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Select a chat room</h3>
              <p className="text-sm">Choose a room from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 