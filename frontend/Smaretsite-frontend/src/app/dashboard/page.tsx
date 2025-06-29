'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MetricsSection from './MetricsSection';
import ChartsSection from './ChartsSection';
import ProjectsTable from './ProjectsTable';
import HelmetStatusChart from './HelmetStatusChart';
import Card from '@/components/common/Card';
import apiClient from '@/utils/api';
import socketClient from '@/utils/socket';

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalWorkers: number;
  assignedWorkers: number;
  totalHelmets: number;
  availableHelmets: number;
  todaySessions: number;
  totalVideos: number;
  todayVideos: number;
}

interface DashboardData {
  metrics: DashboardMetrics;
}

interface RealtimeData {
  activeSessions: number;
  activeHelmets: number;
  recentActivity: Array<{
    type: string;
    id: string;
    workerName: string;
    projectName: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial dashboard data
    loadDashboardData();
    
    // Subscribe to real-time updates
    socketClient.subscribeToDashboard((data: Partial<DashboardData>) => {
      setDashboardData(prev => prev ? { ...prev, ...data } : null);
    });

    socketClient.subscribeToMetrics((data: RealtimeData) => {
      setRealtimeData(data);
    });

    // Cleanup on unmount
    return () => {
      socketClient.removeListener('dashboard-update');
      socketClient.removeListener('metrics-update');
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, realtimeResponse] = await Promise.all([
        apiClient.getDashboardData(),
        apiClient.getRealtimeData()
      ]);
      
      setDashboardData(dashboardResponse);
      setRealtimeData(realtimeResponse);
      setError(null);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isActive = true; // You can make this dynamic based on real data

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="p-6 mb-6 flex flex-col gap-6 relative">
        {/* Header inside Card */}
        <div className="flex justify-between items-start mb-4">
          {/* Left Side: Separate links for Project ID and Title */}
          <div className="flex flex-col gap-1">
            <Link href="/projects/Project_ID_A1" passHref legacyBehavior>
              <a
                className="text-sm font-semibold text-[#a4a4ad] cursor-pointer transition-transform duration-200 hover:text-blue-600 hover:scale-110 inline-block"
                aria-label="Go to Project ID A1"
              >
                Project_ID_A1
              </a>
            </Link>

            <Link href="/sales/today" passHref legacyBehavior>
              <a
                className="text-2xl font-semibold text-[#05004e] cursor-pointer transition-transform duration-200 hover:text-blue-600 hover:scale-105 inline-block"
                aria-label="Go to Today's Sales"
              >
                Today's Sales
              </a>
            </Link>
          </div>

          {/* Right Side: Status */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
              color: isActive ? '#065f46' : '#991b1b',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isActive ? '#10b981' : '#ef4444' }}
            />
            {isActive ? 'Active' : 'Deactive'}
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          <MetricsSection />
          <HelmetStatusChart />
        </div>
      </Card>

      <ChartsSection />
      <ProjectsTable />
    </>
  );
}
