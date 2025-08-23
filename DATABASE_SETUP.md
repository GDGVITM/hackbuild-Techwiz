# Database Setup Guide

## Issue: "Failed to fetch job" Error

The error you're experiencing is likely due to a missing database connection. Here's how to fix it:

## 🔧 Quick Fix

### 1. Create Environment File
Create a `.env.local` file in your project root with the following content:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/hackbuild-techwiz

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Configuration (for chat feature)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 2. Install MongoDB (if not already installed)

#### Option A: Local MongoDB
```bash
# On Windows (using Chocolatey)
choco install mongodb

# On macOS (using Homebrew)
brew install mongodb-community

# On Ubuntu/Debian
sudo apt-get install mongodb
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace the DATABASE_URL in `.env.local` with your Atlas connection string

### 3. Start MongoDB (Local Installation)
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### 4. Test Database Connection
Visit: `http://localhost:3000/api/test-db`

You should see a JSON response indicating successful connection.

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB not running**
   - Check if MongoDB is installed and running
   - Try: `mongod --version`

2. **Wrong connection string**
   - For local MongoDB: `mongodb://localhost:27017/hackbuild-techwiz`
   - For Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hackbuild-techwiz`

3. **Port conflicts**
   - MongoDB default port is 27017
   - Check if another service is using this port

4. **Permission issues**
   - Make sure MongoDB has write permissions to its data directory

### Debug Steps:

1. **Check console logs** in your browser's developer tools
2. **Test the API directly**: Visit `/api/test-db`
3. **Check server logs** in your terminal where you ran `npm run dev`

## 🔄 Alternative Solutions

### Option 1: Use MongoDB Atlas (Recommended)
1. Sign up for free MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `.env.local`

### Option 2: Use Docker
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Your DATABASE_URL remains the same
DATABASE_URL=mongodb://localhost:27017/hackbuild-techwiz
```

### Option 3: Use SQLite (Temporary)
If you want to test without MongoDB, you can temporarily modify the models to use a different database.

## ✅ Verification

After setup, you should be able to:
1. Visit `/api/test-db` and see success response
2. Access job details without the "Failed to fetch job" error
3. See proper error messages if something goes wrong

## 🚀 Next Steps

Once the database is working:
1. Create some test jobs through the business dashboard
2. Test the student dashboard job viewing
3. Test proposal submission functionality

## 📞 Support

If you're still having issues:
1. Check the browser console for specific error messages
2. Check the server logs in your terminal
3. Verify MongoDB is running and accessible
4. Test the database connection using the `/api/test-db` endpoint 