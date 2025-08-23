'use client';

import { useState } from 'react';
import ChatApp from '@/components/chat/ChatApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, FileText, Users, Zap } from 'lucide-react';

export default function ChatDemoPage() {
  const [userId, setUserId] = useState('user-1');
  const [userName, setUserName] = useState('John Doe');
  const [isStarted, setIsStarted] = useState(false);

  const handleStartChat = () => {
    if (userId.trim() && userName.trim()) {
      setIsStarted(true);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Chat Demo</CardTitle>
            <CardDescription>
              Experience real-time chat with file sharing using Firebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <Button 
              onClick={handleStartChat}
              disabled={!userId.trim() || !userName.trim()}
              className="w-full"
            >
              Start Chatting
            </Button>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Features:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Real-time messaging
                </li>
                <li className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  File sharing with progress
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Multiple chat rooms
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Firebase powered
                </li>
              </ul>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              <p>This demo uses Firebase in test mode</p>
              <p>No API keys required - runs with emulators</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatApp userId={userId} userName={userName} />
    </div>
  );
} 