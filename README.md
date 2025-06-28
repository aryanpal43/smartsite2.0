# Smart Construction Monitoring System

A comprehensive IoT-based construction monitoring system that uses ESP32-CAM enabled helmets to stream and record video footage of workers. The system analyzes videos with AI/ML models to measure work quality, attendance, and efficiency.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32-CAM     │    │   Backend API   │    │  Next.js        │
│   Helmets       │───▶│   (Node.js)     │───▶│  Frontend       │
│                 │    │                 │    │  (Port 4028)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       └─────────────────┘
```

## 🚀 Features

### Backend Features
- **Real-time Video Streaming**: Socket.IO for live video feeds from ESP32-CAM helmets
- **Video Storage**: Local file system storage for video files
- **AI Analysis**: Automated video analysis for safety and efficiency monitoring
- **Worker Management**: Assign/deassign helmets to workers
- **Project Tracking**: Monitor multiple construction projects
- **Analytics**: Comprehensive dashboard with charts and metrics
- **Authentication**: JWT-based user authentication
- **API**: RESTful API endpoints for frontend integration

### Frontend Features
- **Dashboard**: Real-time overview with metrics and charts
- **Helmet Management**: Assign/deassign helmets to workers
- **Project Management**: Create and track construction projects
- **Worker Management**: Add and manage workers
- **Reports & Analytics**: Data visualization and insights
- **Real-time Updates**: Live data updates via WebSocket
- **Responsive Design**: Modern UI with Tailwind CSS

## 📁 Project Structure

```
ashu/
├── frontend/
│   └── Smaretsite-frontend/          # Next.js frontend (Port 4028)
│       ├── src/
│       │   ├── app/                  # Next.js app router
│       │   │   ├── dashboard/        # Dashboard pages
│       │   │   ├── helmet/           # Helmet management
│       │   │   ├── projects/         # Project management
│       │   │   ├── reportsanalytics/ # Analytics & reports
│       │   │   └── (auth)/           # Authentication pages
│       │   ├── components/           # React components
│       │   └── styles/               # CSS styles
│       └── package.json
├── routes/                           # API routes
│   ├── api.js                        # Main API endpoints
│   ├── auth.js                       # Authentication
│   ├── helmets.js                    # Helmet management
│   ├── workers.js                    # Worker management
│   ├── projects.js                   # Project management
│   ├── sessions.js                   # Session tracking
│   ├── videos.js                     # Video management
│   └── analytics.js                  # Analytics data
├── services/                         # Business logic
│   ├── videoStorage.js               # Video storage service (Local only)
│   └── aiAnalysis.js                 # AI analysis service
├── middleware/                       # Express middleware
├── config/                           # Configuration files
├── uploads/                          # Video storage (Local)
└── server.js                         # Main server file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd ashu

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
nano .env
```

#### Environment Configuration (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=construction_monitoring
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Storage Configuration (Local Only)
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads/videos

# Frontend Configuration
FRONTEND_URL=http://localhost:4028
SOCKET_CORS_ORIGIN=http://localhost:4028

# File Upload Limits
MAX_FILE_SIZE=100mb
MAX_VIDEO_DURATION=300

# Video Storage Configuration
MAX_VIDEO_SIZE=100MB
VIDEO_RETENTION_DAYS=30
```

#### Database Setup
```bash
# Create database
createdb construction_monitoring

# Run database setup script
node setup-database.js
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/Smaretsite-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:4028

## 💾 Storage Configuration

This system uses **local file system storage only** for video files. Videos are stored in the `./uploads/videos` directory organized by session ID.

### Storage Features:
- **Local Storage**: All videos stored on the server's file system
- **Automatic Cleanup**: Old videos are automatically deleted based on retention policy
- **Session Organization**: Videos organized by session ID for easy management
- **File Compression**: Videos are compressed to save storage space
- **Streaming Support**: Videos can be streamed directly from local storage

### Storage Path Structure:
```
uploads/
└── videos/
    ├── session_1/
    │   ├── video_1.mp4
    │   └── video_2.mp4
    ├── session_2/
    │   └── video_1.mp4
    └── ...
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics
- `GET /api/realtime` - Get real-time data

### Helmet Management
- `GET /api/helmets` - Get all helmets
- `GET /api/helmets/available` - Get available helmets
- `POST /api/helmets/assign` - Assign helmet to worker
- `POST /api/helmets/deassign` - Deassign helmet from worker
- `GET /api/helmets/status-chart` - Get helmet status for charts

### Worker Management
- `GET /api/workers` - Get all workers
- `GET /api/workers/search` - Search workers
- `POST /api/workers` - Add new worker

### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Add new project

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/helmet-status` - Helmet status analytics
- `GET /api/analytics/project-performance` - Project performance
- `GET /api/analytics/worker-efficiency` - Worker efficiency
- `GET /api/analytics/video-analytics` - Video analytics
- `GET /api/analytics/safety-alerts` - Safety alerts

## 🔄 Real-time Communication

The system uses Socket.IO for real-time communication:

### Frontend Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true
});

// Subscribe to dashboard updates
socket.emit('subscribe-dashboard');

// Subscribe to helmet updates
socket.emit('subscribe-helmets');

// Listen for real-time updates
socket.on('dashboard-update', (data) => {
  // Update dashboard data
});

socket.on('helmet-update', (data) => {
  // Update helmet status
});
```

### ESP32-CAM Integration
```javascript
// ESP32-CAM sends video stream
socket.emit('video-stream', {
  helmetId: 'HLM-001',
  videoData: base64VideoData
});

// Frontend receives video feed
socket.on('video-feed', (videoData) => {
  // Display video feed
});
```

## 📊 Database Schema

### Core Tables
- **users** - System users
- **workers** - Construction workers
- **helmets** - IoT helmets with cameras
- **projects** - Construction projects
- **sessions** - Work sessions
- **videos** - Recorded video files
- **analytics** - Analysis results

## 🎯 Usage Examples

### 1. Assign Helmet to Worker
```javascript
// Frontend API call
const response = await fetch('/api/helmets/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    helmetId: 'HLM-001',
    workerId: 'W-001'
  })
});
```

### 2. Get Dashboard Data
```javascript
// Frontend API call
const response = await fetch('/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboardData = await response.json();
// {
//   metrics: {
//     totalProjects: 5,
//     activeProjects: 3,
//     totalWorkers: 12,
//     assignedWorkers: 8,
//     totalHelmets: 15,
//     availableHelmets: 7,
//     todaySessions: 24,
//     totalVideos: 156,
//     todayVideos: 12
//   }
// }
```

### 3. Real-time Helmet Status
```javascript
// Subscribe to helmet updates
socket.emit('subscribe-helmets');

// Listen for updates
socket.on('helmet-update', (helmetData) => {
  // Update helmet status in UI
  updateHelmetStatus(helmetData);
});
```

## 🔧 Development

### Adding New Features

1. **Backend API**: Add new routes in `routes/` directory
2. **Database**: Update schema in `scripts/migrate.js`
3. **Frontend**: Add new pages in `frontend/src/app/`
4. **Real-time**: Add Socket.IO events in `server.js`

### Testing
```bash
# Backend tests
npm test

# Frontend tests
cd frontend/Smaretsite-frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (VPS)
1. Set up PostgreSQL on VPS
2. Configure environment variables
3. Run database migrations
4. Start server with PM2: `pm2 start server.js`

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or VPS
3. Update API endpoints to production URLs

## 📈 Monitoring & Analytics

The system provides comprehensive analytics:
- **Worker Efficiency**: Session duration, video count, helmet usage
- **Project Performance**: Progress tracking, session analytics
- **Helmet Status**: Battery levels, availability, assignment rates
- **Safety Metrics**: Incident detection, alert monitoring
- **Video Analytics**: Upload trends, storage usage, AI analysis results

## 🔒 Security Features

- JWT-based authentication
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- File upload security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for smart construction monitoring** 