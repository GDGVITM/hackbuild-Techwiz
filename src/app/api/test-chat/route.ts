import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { ChatRoom, Message } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Create a test chat room if none exists
    let testChat = await ChatRoom.findOne({ name: 'Test Chat' });
    
    if (!testChat) {
      // Create a test chat room with valid ObjectId references
      // We'll use a dummy ObjectId format that MongoDB accepts
      const testUserId1 = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const testUserId2 = '507f1f77bcf86cd799439012'; // Valid ObjectId format
      
      testChat = new ChatRoom({
        name: 'Test Chat',
        participants: [testUserId1, testUserId2],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testChat.save();
      console.log('Created test chat room:', testChat._id);
    }
    
    // Create a test message if none exists
    let testMessage = await Message.findOne({ roomId: testChat._id });
    
    if (!testMessage) {
      testMessage = new Message({
        roomId: testChat._id,
        senderId: '507f1f77bcf86cd799439011', // Use the same test user ID
        senderName: 'Test User',
        text: 'Hello! This is a test message.',
        timestamp: new Date(),
        type: 'text'
      });
      await testMessage.save();
      console.log('Created test message:', testMessage._id);
    }
    
    // Update chat room with last message
    await ChatRoom.findByIdAndUpdate(testChat._id, {
      lastMessage: testMessage._id,
      updatedAt: new Date()
    });
    
    // Get all chat rooms
    const allChats = await ChatRoom.find()
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    console.log('All chats found:', allChats.length);
    console.log('Test chat ID:', testChat._id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Test chat created successfully',
      testChat: testChat,
      testMessage: testMessage,
      allChats: allChats,
      chatCount: allChats.length
    });
  } catch (error) {
    console.error('Test chat creation failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Test chat creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Add a POST method to create test chats without authentication
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    const { name = 'Test Chat' } = await request.json();
    
    // Create a test chat room with valid ObjectId references
    const testUserId1 = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    const testUserId2 = '507f1f77bcf86cd799439012'; // Valid ObjectId format
    
    const testChat = new ChatRoom({
      name,
      participants: [testUserId1, testUserId2],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await testChat.save();
    console.log('Created test chat room via POST:', testChat._id);
    
    // Create a test message
    const testMessage = new Message({
      roomId: testChat._id,
      senderId: testUserId1,
      senderName: 'Test User',
      text: 'Hello! This is a test message.',
      timestamp: new Date(),
      type: 'text'
    });
    await testMessage.save();
    console.log('Created test message via POST:', testMessage._id);
    
    // Update chat room with last message
    await ChatRoom.findByIdAndUpdate(testChat._id, {
      lastMessage: testMessage._id,
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Test chat created successfully via POST',
      testChat: testChat,
      testMessage: testMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Test chat creation via POST failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Test chat creation via POST failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 