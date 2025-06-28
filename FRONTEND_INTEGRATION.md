# Frontend-Backend Integration Guide

## 🎯 Overview

Your smart construction monitoring system now has a complete frontend-backend integration! The Next.js frontend (running on port 4028) communicates seamlessly with the Node.js backend (running on port 3000) through RESTful APIs and real-time WebSocket connections.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32-CAM     │    │   Backend API   │    │  Next.js        │
│   Helmets       │───▶│   (Port 3000)   │───▶│  Frontend       │
│                 │    │                 │    │  (Port 4028)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       └─────────────────┘
```

## 🚀 Quick Start

### 1. Start Both Servers (Recommended)
```bash
# From the root directory (ashu/)
npm run dev
```

This will start both backend and frontend servers simultaneously.

### 2. Start Servers Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 📡 API Integration

### Frontend API Client
The frontend uses a centralized API client (`src/utils/api.js`) that handles:

- **Authentication**: JWT token management
- **API Requests**: All backend communication
- **Error Handling**: Automatic error responses
- **Token Storage**: Local storage for persistence

### Key API Endpoints

#### Dashboard Data
```javascript
// Get dashboard metrics
const dashboardData = await apiClient.getDashboardData();

// Get real-time data
const realtimeData = await apiClient.getRealtimeData();
```

#### Helmet Management
```javascript
// Get all helmets
const helmets = await apiClient.getHelmets();

// Search available helmets
const availableHelmets = await apiClient.getAvailableHelmets('HLM-001');

// Assign helmet to worker
await apiClient.assignHelmet('HLM-001', 'W-001');

// Deassign helmet
await apiClient.deassignHelmet('HLM-001');
```

#### Worker Management
```javascript
// Get all workers
const workers = await apiClient.getWorkers();

// Search workers
const searchResults = await apiClient.searchWorkers('John');

// Add new worker
const newWorker = await apiClient.addWorker({
  name: 'John Doe',
  role: 'Excavator',
  department: 'Construction'
});
```

#### Project Management
```javascript
// Get all projects
const projects = await apiClient.getProjects();

// Add new project
const newProject = await apiClient.addProject({
  name: 'Building A',
  description: 'Office building construction',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

## 🔄 Real-time Communication

### Socket.IO Integration
The frontend uses Socket.IO client (`src/utils/socket.js`) for real-time updates:

```javascript
import socketClient from '@/utils/socket';

// Subscribe to dashboard updates
socketClient.subscribeToDashboard((data) => {
  // Update dashboard with real-time data
  updateDashboard(data);
});

// Subscribe to helmet updates
socketClient.subscribeToHelmets((data) => {
  // Update helmet status in real-time
  updateHelmetStatus(data);
});

// Join helmet video stream
socketClient.joinHelmetStream('HLM-001', (videoData) => {
  // Display live video feed
  displayVideoFeed(videoData);
});
```

### Real-time Events

#### Backend → Frontend
- `dashboard-update`: Dashboard metrics updates
- `helmet-update`: Helmet status changes
- `video-feed`: Live video stream from ESP32-CAM
- `safety-alert`: Safety alerts and incidents
- `metrics-update`: Real-time performance metrics

#### Frontend → Backend
- `subscribe-dashboard`: Subscribe to dashboard updates
- `subscribe-helmets`: Subscribe to helmet updates
- `join-helmet-stream`: Join specific helmet video stream
- `video-stream`: Send video data from ESP32-CAM

## 🎨 Frontend Pages & Features

### 1. Dashboard (`/dashboard`)
- **Real-time Metrics**: Projects, workers, helmets, sessions
- **Live Charts**: Helmet status, project performance
- **Activity Feed**: Recent worker activities
- **Quick Actions**: Assign helmets, view projects

### 2. Helmet Management (`/helmet`)
- **Helmet List**: All helmets with status and battery
- **Assign Helmets**: Search and assign helmets to workers
- **Deassign Helmets**: Remove helmet assignments
- **Status Monitoring**: Real-time battery and connection status

### 3. Projects (`/projects`)
- **Project List**: All construction projects
- **Add Projects**: Create new projects
- **Project Details**: Progress tracking and analytics
- **Session History**: Work sessions per project

### 4. Reports & Analytics (`/reportsanalytics`)
- **Performance Metrics**: Worker efficiency analysis
- **Safety Reports**: Incident tracking and alerts
- **Video Analytics**: Upload trends and AI analysis results
- **Export Features**: Generate reports in various formats

## 🔧 Development Workflow

### Adding New Features

#### 1. Backend API
```javascript
// Add new route in routes/api.js
router.get('/new-feature', auth, async (req, res) => {
  // Implementation
});

// Add to API client
async getNewFeature() {
  return await this.request('/new-feature');
}
```

#### 2. Frontend Integration
```javascript
// Use in React component
const [data, setData] = useState(null);

useEffect(() => {
  const loadData = async () => {
    const result = await apiClient.getNewFeature();
    setData(result);
  };
  loadData();
}, []);
```

#### 3. Real-time Updates
```javascript
// Backend: Emit event
io.emit('new-feature-update', data);

// Frontend: Listen for updates
socketClient.subscribeToNewFeature((data) => {
  // Handle real-time update
});
```

## 🛠️ Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=construction_monitoring
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Frontend Configuration
FRONTEND_URL=http://localhost:4028
SOCKET_CORS_ORIGIN=http://localhost:4028

# Storage
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads/videos
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## 🔍 Testing the Integration

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. API Endpoints
```bash
# Test dashboard API
curl http://localhost:3000/api/dashboard

# Test helmet API
curl http://localhost:3000/api/helmets
```

### 3. Frontend-Backend Communication
1. Open http://localhost:4028
2. Check browser console for API calls
3. Verify real-time updates work
4. Test helmet assignment functionality

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Check that frontend is running on port 4028

#### 2. Socket.IO Connection Issues
- Verify `NEXT_PUBLIC_SOCKET_URL` is set in frontend
- Check that backend Socket.IO server is running

#### 3. API 401 Errors
- Check JWT token in localStorage
- Verify authentication middleware is working

#### 4. Database Connection
- Ensure PostgreSQL is running
- Check database credentials in `.env`

### Debug Mode
```bash
# Backend with debug logging
DEBUG=* npm run dev:backend

# Frontend with detailed logging
cd frontend/Smaretsite-frontend
NODE_ENV=development npm run dev
```

## 📊 Data Flow Examples

### 1. Helmet Assignment Flow
```
Frontend → API → Backend → Database
    ↓
Real-time Update → Socket.IO → Frontend
    ↓
UI Update → User sees assignment
```

### 2. Video Stream Flow
```
ESP32-CAM → Socket.IO → Backend → Storage
    ↓
Real-time Feed → Socket.IO → Frontend
    ↓
Video Display → User sees live feed
```

### 3. Dashboard Update Flow
```
Database Change → Backend → Socket.IO → Frontend
    ↓
State Update → React Re-render → UI Update
```

## 🚀 Production Deployment

### Backend Deployment
1. Set up VPS with Node.js and PostgreSQL
2. Configure environment variables
3. Run database migrations
4. Start with PM2: `pm2 start server.js`

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel/Netlify/VPS
3. Update API endpoints to production URLs

### Environment Configuration
```env
# Production
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

## 📚 Next Steps

1. **Add Authentication**: Implement login/register pages
2. **Enhance Real-time Features**: Add more live updates
3. **Video Processing**: Implement AI analysis integration
4. **Mobile App**: Create React Native app for field workers
5. **Advanced Analytics**: Add machine learning insights
6. **Notifications**: Implement email/SMS alerts

---

**Your smart construction monitoring system is now fully integrated and ready for development! 🎉** 