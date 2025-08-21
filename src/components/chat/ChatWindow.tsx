'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket/client';
import { Message } from '@/types/chat';

export default function ChatWindow({ roomId, userId }: { roomId: string; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = getSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Join room
    socket.emit('joinRoom', roomId);

    // Load initial messages
    const fetchMessages = async () => {
      const response = await fetch(`/api/messages?roomId=${roomId}`);
      const data = await response.json();
      setMessages(data.messages);
    };

    fetchMessages();

    // Listen for new messages
    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [roomId, socket]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      roomId,
      senderId: userId,
      text: newMessage,
    };

    socket.emit('sendMessage', message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}