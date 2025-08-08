# 🏉 Rugby Score Tracker - Database Setup Guide

This guide will help you set up MongoDB database integration for your Rugby Score Tracker application.

## 📋 Overview

The application now includes:

- **Frontend**: Angular 19 application with Material UI
- **Backend**: Node.js/Express API with MongoDB integration
- **Database**: MongoDB Atlas (cloud) or local MongoDB
- **Hybrid Storage**: Automatic fallback from API to localStorage

## 🚀 Quick Start

### 1. Install All Dependencies

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
npm run backend:install
```

### 2. Set Up MongoDB Database

#### Option A: MongoDB Atlas (Recommended - Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose "Password" authentication
   - Set username and password
   - Grant "Read and write to any database" role
5. Whitelist your IP:
   - Go to Network Access
   - Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development
6. Get your connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

#### Option B: Local MongoDB

```bash
# Install MongoDB locally (varies by OS)
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow MongoDB installation guide
```

### 3. Configure Environment Variables

Navigate to the backend directory and set up your environment:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` file with your MongoDB credentials:

```env
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/rugby-score-tracker?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# Your Angular app URL for CORS
CLIENT_URL=http://localhost:4200
```

### 4. Start the Application

#### Option A: Start Both Frontend and Backend Together

```bash
npm run dev:full
```

#### Option B: Start Separately

```bash
# Terminal 1 - Backend API
npm run backend:dev

# Terminal 2 - Frontend (in new terminal)
npm start
```

### 5. Verify Setup

1. **Backend API**: Visit <http://localhost:3000/health>
   - Should show API status
2. **Frontend**: Visit <http://localhost:4200>
   - Should load the Rugby Score Tracker app
3. **Database Connection**: Check backend terminal logs
   - Should show "MongoDB Connected" message

## 🔧 How It Works

### Hybrid Storage System

The application uses a smart hybrid approach:

1. **Primary**: MongoDB API (when available)
2. **Fallback**: localStorage (if API fails)
3. **Backward Compatible**: Existing localStorage data is preserved

### Data Flow

1. User creates/updates game scores
2. App tries to save to MongoDB via API
3. If API fails, automatically falls back to localStorage
4. Game history loads from API first, then localStorage if needed

## 📊 Features

### Available in Both Storage Modes

- ✅ Create and track rugby games
- ✅ Real-time score updates
- ✅ Game history with filtering
- ✅ Statistics dashboard
- ✅ Export/import functionality
- ✅ Mobile-first responsive design

### Additional MongoDB Features

- 🌐 Cloud synchronization across devices
- 📊 Advanced analytics (future)
- 👥 Multi-user support (future)
- 🔄 Automatic backups
- 📈 Scalable data storage

## 🛠️ API Endpoints

Once your backend is running, these endpoints are available:

### Games

- `GET /api/games` - Get all games
- `POST /api/games` - Create a new game
- `PUT /api/games/:id` - Update a game
- `DELETE /api/games/:id` - Delete a game

### Statistics

- `GET /api/games/stats` - Get game statistics

### Health

- `GET /health` - Check API status

## 🔍 Troubleshooting

### Common Issues

#### 1. "Failed to load games from API"

- Check if backend is running on <http://localhost:3000>
- Verify MongoDB connection string in `backend/.env`
- Check backend terminal logs for errors

#### 2. "CORS Error"

- Ensure `CLIENT_URL` in `backend/.env` matches your Angular app URL
- Default should be `http://localhost:4200`

#### 3. "MongoDB connection failed"

- Verify your MongoDB URI is correct
- Check network access settings in MongoDB Atlas
- Ensure database user has proper permissions

#### 4. Backend won't start

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (Windows)
taskkill /PID <process-id> /F

# Try different port in backend/.env
PORT=3001
```

#### 5. App still uses localStorage only

- Check browser console for API errors
- Verify backend health: <http://localhost:3000/health>
- Check network tab in browser dev tools

## 🔄 Switching Between Storage Modes

The app automatically detects API availability, but you can also:

### Force localStorage Only

In `game-storage-hybrid.service.ts`, set:

```typescript
private useApi = false;
```

### Force API Only (No Fallback)

```typescript
private fallbackToLocal = false;
```

## 📱 Production Deployment

### Backend Deployment

The backend is ready for deployment to:

- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

### Frontend Deployment

Update `src/environments/environment.prod.ts`:

```typescript
apiUrl: 'https://your-production-api.com/api'
```

## 🆘 Need Help?

1. Check backend logs for MongoDB connection status
2. Test API endpoints directly: <http://localhost:3000/api/games>
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas IP whitelist includes your IP

Your Rugby Score Tracker is now powered by MongoDB! 🎉

## 📚 Next Steps

- [ ] Create your first game and watch it sync to the cloud
- [ ] Test the offline fallback by stopping the backend
- [ ] Explore the game statistics dashboard
- [ ] Set up production deployment
