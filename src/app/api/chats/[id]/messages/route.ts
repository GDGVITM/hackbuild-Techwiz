import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import { Message, ChatRoom } from '@/lib/models';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const { id: chatId } = await context.params;
    
    // Verify user is participant in this chat
    const chatRoom = await ChatRoom.findById(chatId);
    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    if (!chatRoom.participants.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized to access this chat' }, { status: 403 });
    }
    
    // Get messages for this chat
    const messages = await Message.find({ roomId: chatId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 })
      .limit(100);
    
    // Transform messages to match the expected format
    const transformedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      sender: msg.senderId?.name || 'Unknown User',
      content: msg.text,
      timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
    }));
    
    return NextResponse.json({ 
      messages: transformedMessages,
      success: true 
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const { id: chatId } = await context.params;
    const { text, type = 'text', fileUrl, fileName, fileSize, fileType } = await request.json();
    
    // Verify user is participant in this chat
    const chatRoom = await ChatRoom.findById(chatId);
    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    if (!chatRoom.participants.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized to access this chat' }, { status: 403 });
    }
    
    // Create new message
    const newMessage = new Message({
      roomId: chatId,
      senderId: userId,
      senderName: '', // Will be populated when fetched
      text: text || `Sent file: ${fileName}`,
      timestamp: new Date(),
      type,
      fileUrl,
      fileName,
      fileSize,
      fileType
    });
    
    await newMessage.save();
    
    // Update chat room's last message and timestamp
    await ChatRoom.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });
    
    // Populate the sender information
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name email');
    
    return NextResponse.json({ 
      message: populatedMessage,
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ 
      error: 'Failed to create message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 