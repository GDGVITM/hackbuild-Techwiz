'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { sendTextMessage, sendFileMessage, subscribeToMessages } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Paperclip, Download, Send } from 'lucide-react';

interface ChatWindowProps {
  roomId: string;
  userId: string;
  userName: string;
}

export default function ChatWindow({ roomId, userId, userName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Subscribe to messages
    const unsubscribe = subscribeToMessages(roomId, (messages) => {
      setMessages(messages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isLoading) return;

    setIsLoading(true);
    try {
      await sendTextMessage(roomId, userId, userName, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileId = `${Date.now()}-${file.name}`;

    setIsLoading(true);
    setUploadingFiles(prev => ({ ...prev, [fileId]: 0 }));

    try {
      await sendFileMessage(
        roomId,
        userId,
        userName,
        file,
        (progress) => {
          setUploadingFiles(prev => ({ ...prev, [fileId]: progress }));
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
      setUploadingFiles(prev => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Chat Room</h3>
        <p className="text-sm text-gray-500">Room ID: {roomId}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs md:max-w-md ${message.senderId === userId ? 'order-2' : 'order-1'}`}>
              <div className="text-xs text-gray-500 mb-1">
                {message.senderName} • {formatTime(message.timestamp)}
              </div>
              
              <Card className={`p-3 ${
                message.senderId === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
              }`}>
                {message.type === 'file' ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="font-medium">{message.fileName}</span>
                    </div>
                    <div className="text-sm opacity-80">
                      {message.fileSize && formatFileSize(message.fileSize)}
                    </div>
                    {message.fileUrl && (
                      <Button
                        size="sm"
                        variant={message.senderId === userId ? "secondary" : "default"}
                        onClick={() => handleDownloadFile(message.fileUrl!, message.fileName!)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}
              </Card>
            </div>
          </div>
        ))}
        
        {/* Upload progress indicators */}
        {Object.entries(uploadingFiles).map(([fileId, progress]) => (
          <div key={fileId} className="flex justify-end">
            <Card className="p-3 bg-blue-100 border-blue-200 max-w-xs">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">Uploading...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-blue-600 mt-1">{Math.round(progress)}%</span>
            </Card>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || newMessage.trim() === ''}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="*/*"
        />
      </div>
    </div>
  );
}