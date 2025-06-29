'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import { Plus, Search, Battery, User, AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import apiClient from '@/utils/api';
import socketClient from '@/utils/socket';

interface Helmet {
  id?: string;
  helmet_id?: string;
  status?: string;
  battery?: string;
  battery_level?: string;
  lastUsed?: string;
  last_used?: string;
  condition?: string;
  assignedWorker?: string;
  assignedWorkerId?: string;
  assigned_to?: string;
}

export default function HelmetPage() {
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [showAddHelmetModal, setShowAddHelmetModal] = useState(false);
  const [addingHelmet, setAddingHelmet] = useState(false);
  const [addHelmetError, setAddHelmetError] = useState<string | null>(null);
  const [addHelmetSuccess, setAddHelmetSuccess] = useState(false);

  useEffect(() => {
    loadHelmets();
    
    // Subscribe to real-time helmet updates
    socketClient.subscribeToHelmets((data: any) => {
      // Update helmet status in real-time
      setHelmets(prevHelmets => 
        prevHelmets.map(helmet => 
          helmet.id === data.helmetId 
            ? { ...helmet, ...data }
            : helmet
        )
      );
    });

    return () => {
      socketClient.removeListener('helmet-update');
    };
  }, []);

  const loadHelmets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getHelmets();
      setHelmets(response);
    } catch (err: any) {
      console.error('Error loading helmets:', err);
      setError(err?.message || 'Failed to load helmets');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHelmets();
    setRefreshing(false);
  };

  const handleDeassign = async (helmetId: string) => {
    try {
      await apiClient.deassignHelmet(helmetId);
      // Refresh the helmet list
      await loadHelmets();
    } catch (err: any) {
      console.error('Error deassigning helmet:', err);
      setError(err?.message || 'Failed to deassign helmet');
    }
  };

  // Filter helmets based on search term and status
  const filteredHelmets = helmets.filter(helmet => {
    const matchesSearch = (helmet.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (helmet.assignedWorker || helmet.assigned_to || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (helmet.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | undefined) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'streaming':
        return 'bg-purple-100 text-purple-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (battery: string) => {
    const level = parseInt(battery || '100');
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryIcon = (battery: string) => {
    const level = parseInt(battery || '100');
    if (level > 80) return <Battery className="w-4 h-4" />;
    if (level > 50) return <Battery className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  // Stats
  const totalHelmets = helmets.length;
  const available = helmets.filter(h => h.status && h.status.toLowerCase() === 'available').length;
  const assigned = helmets.filter(h => h.status && h.status.toLowerCase() === 'assigned').length;
  const lowBattery = helmets.filter(h => parseInt(h.battery_level || h.battery || '100') < 20).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading helmets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#05004e]">Helmet Management</h1>
              <p className="text-gray-600">Manage and monitor all construction helmets</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/helmet/assign-helmet"
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Helmet
              </Link>
              <button
                onClick={() => setShowAddHelmetModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Helmet
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center p-4 bg-red-100 text-red-700 rounded-lg shadow">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Battery className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Helmets</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHelmets}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{available}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">{assigned}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Battery</p>
                  <p className="text-2xl font-bold text-gray-900">{lowBattery}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Helmet Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search helmets by ID or worker..."
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 ml-2"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helmet ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHelmets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">No helmets available</td>
                    </tr>
                  ) : (
                    filteredHelmets.map(helmet => (
                      <tr key={helmet.id}>
                        <td className="px-4 py-2 font-medium text-gray-900">{helmet.helmet_id || helmet.id}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(helmet.status)}`}>{helmet.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={getBatteryColor(helmet.battery_level || helmet.battery || '100')}>{helmet.battery_level || helmet.battery || '100'}%</span>
                        </td>
                        <td className="px-4 py-2">{helmet.condition || '-'}</td>
                        <td className="px-4 py-2">{helmet.assigned_to || '-'}</td>
                        <td className="px-4 py-2">{helmet.last_used || helmet.lastUsed || '-'}</td>
                        <td className="px-4 py-2">
                          {helmet.status && helmet.status.toLowerCase() === 'assigned' ? (
                            <button
                              onClick={() => handleDeassign(helmet.helmet_id || helmet.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              Deassign
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}