# Rugby Score Tracker - Backend API

This backend provides a RESTful API for the Rugby Score Tracker application with MongoDB integration.

## 🏗️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your MongoDB credentials:

   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/rugby-score-tracker?retryWrites=true&w=majority
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:4200
   ```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account/login
3. Create a new cluster
4. Create a database user with read/write permissions
5. Get your connection string and update `MONGODB_URI` in `.env`

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at: `http://localhost:3000`

## 📚 API Endpoints

### Games

- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get a single game
- `POST /api/games` - Create a new game
- `PUT /api/games/:id` - Update a game
- `DELETE /api/games/:id` - Delete a game
- `DELETE /api/games` - Delete all games

### Statistics

- `GET /api/games/stats` - Get game statistics

### Health Check

- `GET /health` - Server health check

## 📝 API Usage Examples

### Create a Game

```json
POST /api/games
{
  "homeTeam": {
    "name": "Lions",
    "score": 0
  },
  "awayTeam": {
    "name": "Tigers",
    "score": 0
  },
  "status": "active",
  "gameTime": "00:00",
  "scoreHistory": []
}
```

### Update a Game

```json
PUT /api/games/:id
{
  "homeTeam": {
    "name": "Lions",
    "score": 15
  },
  "awayTeam": {
    "name": "Tigers",
    "score": 10
  },
  "status": "completed",
  "gameTime": "80:00"
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `CLIENT_URL` | Angular app URL for CORS | <http://localhost:4200> |
| `JWT_SECRET` | JWT secret for authentication (future use) | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🛡️ Security Features

- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- Compression

## 🚀 Deployment

The backend is ready for deployment to services like:

- Heroku
- Vercel
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

Make sure to:

1. Set environment variables in your hosting platform
2. Update `CLIENT_URL` to your production Angular app URL
3. Use a production MongoDB connection string

## 📊 Data Schema

### Game Schema

```typescript
{
  homeTeam: {
    name: string,
    score: number
  },
  awayTeam: {
    name: string,
    score: number
  },
  status: 'active' | 'completed' | 'paused',
  gameTime: string,
  scoreHistory: [{
    team: 'home' | 'away',
    points: number,
    type: 'Try' | 'Conversion' | 'Penalty' | 'Drop Goal' | 'Penalty Try',
    timestamp: Date,
    gameTime: string
  }],
  createdAt: Date,
  updatedAt: Date
}
```
