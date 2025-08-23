'use client';

import { useEffect, useState } from 'react';
import { ChatRoom } from '@/types/chat';
import { subscribeToUserChatRooms, createChatRoom } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MessageCircle, Users } from 'lucide-react';

interface ChatRoomListProps {
  userId: string;
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
}

export default function ChatRoomList({ userId, onRoomSelect, selectedRoomId }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Subscribe to user's chat rooms
    const unsubscribe = subscribeToUserChatRooms(userId, (rooms) => {
      setRooms(rooms);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const roomId = await createChatRoom(newRoomName.trim(), [userId]);
      setNewRoomName('');
      setIsCreateDialogOpen(false);
      onRoomSelect(roomId);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatLastMessage = (message?: ChatRoom['lastMessage']) => {
    if (!message) return 'No messages yet';
    
    if (message.type === 'file') {
      return `📎 ${message.fileName}`;
    }
    
    return message.text.length > 30 
      ? message.text.substring(0, 30) + '...' 
      : message.text;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat Rooms</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
                <Button 
                  onClick={handleCreateRoom} 
                  disabled={!newRoomName.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No chat rooms yet</p>
            <p className="text-sm">Create a room to start chatting</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedRoomId === room.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onRoomSelect(room.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {formatLastMessage(room.lastMessage)}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{room.participants.length} participants</span>
                      {room.lastMessage && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{formatTime(room.lastMessage.timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 