import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to Socket.IO server
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup event listeners
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Re-subscribe to previous subscriptions
      this.resubscribe();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Subscribe to dashboard updates
  subscribeToDashboard(callback) {
    this.connect();
    this.socket.emit('subscribe-dashboard');
    
    this.socket.on('dashboard-update', (data) => {
      callback(data);
    });

    // Store callback for reconnection
    this.listeners.set('dashboard-update', callback);
  }

  // Subscribe to helmet updates
  subscribeToHelmets(callback) {
    this.connect();
    this.socket.emit('subscribe-helmets');
    
    this.socket.on('helmet-update', (data) => {
      callback(data);
    });

    // Store callback for reconnection
    this.listeners.set('helmet-update', callback);
  }

  // Join helmet video stream
  joinHelmetStream(helmetId, callback) {
    this.connect();
    this.socket.emit('join-helmet-stream', helmetId);
    
    this.socket.on('video-feed', (videoData) => {
      callback(videoData);
    });

    // Store callback for reconnection
    this.listeners.set(`video-feed-${helmetId}`, callback);
  }

  // Leave helmet video stream
  leaveHelmetStream(helmetId) {
    if (this.socket) {
      this.socket.off('video-feed');
      this.listeners.delete(`video-feed-${helmetId}`);
    }
  }

  // Subscribe to real-time metrics
  subscribeToMetrics(callback) {
    this.connect();
    
    this.socket.on('metrics-update', (data) => {
      callback(data);
    });

    // Store callback for reconnection
    this.listeners.set('metrics-update', callback);
  }

  // Subscribe to safety alerts
  subscribeToSafetyAlerts(callback) {
    this.connect();
    
    this.socket.on('safety-alert', (alert) => {
      callback(alert);
    });

    // Store callback for reconnection
    this.listeners.set('safety-alert', callback);
  }

  // Subscribe to project updates
  subscribeToProjectUpdates(projectId, callback) {
    this.connect();
    this.socket.emit('subscribe-project', projectId);
    
    this.socket.on('project-update', (data) => {
      if (data.projectId === projectId) {
        callback(data);
      }
    });

    // Store callback for reconnection
    this.listeners.set(`project-update-${projectId}`, callback);
  }

  // Subscribe to worker updates
  subscribeToWorkerUpdates(workerId, callback) {
    this.connect();
    this.socket.emit('subscribe-worker', workerId);
    
    this.socket.on('worker-update', (data) => {
      if (data.workerId === workerId) {
        callback(data);
      }
    });

    // Store callback for reconnection
    this.listeners.set(`worker-update-${workerId}`, callback);
  }

  // Send video stream data (for ESP32-CAM)
  sendVideoStream(helmetId, videoData) {
    this.connect();
    this.socket.emit('video-stream', {
      helmetId,
      videoData
    });
  }

  // Send helmet status update
  sendHelmetStatus(helmetId, status) {
    this.connect();
    this.socket.emit('helmet-status', {
      helmetId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Send session start
  sendSessionStart(sessionData) {
    this.connect();
    this.socket.emit('session-start', {
      ...sessionData,
      timestamp: new Date().toISOString()
    });
  }

  // Send session end
  sendSessionEnd(sessionId) {
    this.connect();
    this.socket.emit('session-end', {
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Re-subscribe to previous subscriptions after reconnection
  resubscribe() {
    // Re-subscribe to dashboard if listener exists
    if (this.listeners.has('dashboard-update')) {
      this.socket.emit('subscribe-dashboard');
    }

    // Re-subscribe to helmets if listener exists
    if (this.listeners.has('helmet-update')) {
      this.socket.emit('subscribe-helmets');
    }

    // Re-subscribe to projects
    this.listeners.forEach((callback, key) => {
      if (key.startsWith('project-update-')) {
        const projectId = key.replace('project-update-', '');
        this.socket.emit('subscribe-project', projectId);
      }
    });

    // Re-subscribe to workers
    this.listeners.forEach((callback, key) => {
      if (key.startsWith('worker-update-')) {
        const workerId = key.replace('worker-update-', '');
        this.socket.emit('subscribe-worker', workerId);
      }
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Remove specific listener
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient; 