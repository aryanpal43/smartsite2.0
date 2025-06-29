// API Client for Smart Construction Monitoring System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Get stored token
  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Get headers for API requests
  getHeaders() {
    let token = this.getToken();
    
    // If no token exists, try to create a test token for development
    if (!token && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('No authentication token found, creating test token for development');
      // Create a simple test token for development
      const testUser = { id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' };
      token = btoa(JSON.stringify(testUser)); // Simple base64 encoding for testing
      this.setToken(token);
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Authentication required');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return await response.json();
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  // Dashboard endpoints
  async getDashboardData() {
    return await this.request('/dashboard');
  }

  async getRealtimeData() {
    return await this.request('/realtime');
  }

  // Helmet endpoints
  async getHelmets() {
    try {
      const response = await fetch(`${this.baseURL}/helmets`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await this.handleResponse(response);
      return data.helmets || [];
    } catch (error) {
      console.error('Error fetching helmets:', error);
      throw error;
    }
  }

  async getAvailableHelmets(searchTerm = '') {
    try {
      const url = searchTerm 
        ? `${this.baseURL}/helmets/available?search=${encodeURIComponent(searchTerm)}`
        : `${this.baseURL}/helmets/available`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching available helmets:', error);
      throw error;
    }
  }

  async assignHelmet(helmetId, workerId) {
    try {
      const response = await fetch(`${this.baseURL}/helmets/${helmetId}/assign`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ workerId }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error assigning helmet:', error);
      throw error;
    }
  }

  async deassignHelmet(helmetId) {
    try {
      const response = await fetch(`${this.baseURL}/helmets/${helmetId}/deassign`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deassigning helmet:', error);
      throw error;
    }
  }

  async getHelmetStatusChart() {
    return await this.request('/helmets/status-chart');
  }

  // Worker endpoints
  async getWorkers() {
    try {
      const response = await fetch(`${this.baseURL}/workers`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw error;
    }
  }

  async searchWorkers(searchTerm) {
    try {
      const response = await fetch(`${this.baseURL}/workers/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error searching workers:', error);
      throw error;
    }
  }

  async addWorker(workerData) {
    try {
      const response = await fetch(`${this.baseURL}/workers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(workerData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error adding worker:', error);
      throw error;
    }
  }

  async updateWorker(workerId, workerData) {
    try {
      const response = await fetch(`${this.baseURL}/workers/${workerId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(workerData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error;
    }
  }

  async deleteWorker(workerId) {
    try {
      const response = await fetch(`${this.baseURL}/workers/${workerId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting worker:', error);
      throw error;
    }
  }

  // Project endpoints
  async getProjects() {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async addProject(projectData) {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  async updateProject(projectId, projectData) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Analytics endpoints
  async getAnalytics(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return await this.request(`/analytics${url}`);
  }

  async getHelmetStatusAnalytics() {
    return await this.request('/analytics/helmet-status');
  }

  async getProjectPerformanceAnalytics() {
    return await this.request('/analytics/project-performance');
  }

  async getWorkerEfficiencyAnalytics() {
    return await this.request('/analytics/worker-efficiency');
  }

  async getVideoAnalytics(period = '7d') {
    return await this.request(`/analytics/video-analytics?period=${period}`);
  }

  async getSafetyAlerts() {
    return await this.request('/analytics/safety-alerts');
  }

  async addHelmet(helmetData) {
    try {
      console.log('Adding helmet with data:', helmetData);
      console.log('API URL:', `${this.baseURL}/helmets`);
      console.log('Headers:', this.getHeaders());
      
      const response = await fetch(`${this.baseURL}/helmets`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(helmetData),
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error adding helmet:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient; 