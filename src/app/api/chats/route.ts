import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/mongoose';
import { ChatRoom } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = verifyToken(token);
    
    // Get chat rooms for the user
    const chatRooms = await ChatRoom.find({
      participants: userId
    })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .limit(50);

    // Transform data to match the expected ChatConversation format
    const transformedChats = chatRooms.map(room => {
      // For test chats, handle the case where participants might be strings or ObjectIds
      const otherParticipant = room.participants.find(p => {
        if (typeof p === 'string') {
          return p !== userId;
        }
        return p._id.toString() !== userId;
      });
      
      let companyName = 'Unknown Company';
      if (typeof otherParticipant === 'string') {
        // This is a test chat with string participant IDs
        companyName = 'Test Company';
      } else if (otherParticipant?.name) {
        companyName = otherParticipant.name;
      }
      
      return {
        id: room._id.toString(),
        company: companyName,
        jobTitle: room.name || 'General Chat',
        lastMessage: room.lastMessage?.text || 'No messages yet',
        timestamp: room.updatedAt?.toISOString() || new Date().toISOString(),
        unread: 0, // TODO: Implement unread count logic
        messages: [] // Messages will be fetched separately when chat is opened
      };
    });

    return NextResponse.json({ 
      chats: transformedChats,
      success: true 
    });
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch chats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = verifyToken(token);
    const { name, participants } = await request.json();

    // Validate input
    if (!name || !participants || !Array.isArray(participants)) {
      return NextResponse.json({ 
        error: 'Invalid input. Name and participants array are required.' 
      }, { status: 400 });
    }

    // Ensure the current user is included in participants
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    // Create new chat room
    const newChatRoom = new ChatRoom({
      name,
      participants,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newChatRoom.save();

    // Populate the created chat room
    const populatedChatRoom = await ChatRoom.findById(newChatRoom._id)
      .populate('participants', 'name email');

    return NextResponse.json({ 
      chat: populatedChatRoom,
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create chat:', error);
    return NextResponse.json({ 
      error: 'Failed to create chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 