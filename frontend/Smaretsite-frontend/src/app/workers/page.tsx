'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import { Plus, Search, User, HardHat, Building, Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '@/utils/api';

interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  helmetAssigned: string;
  helmetStatus?: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [addingWorker, setAddingWorker] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getWorkers();
      // Map API response to expected Worker interface
      const workers = (response.data?.workers || response.workers || response).map((w: any) => ({
        id: w.id,
        name: [w.first_name, w.last_name].filter(Boolean).join(' '),
        role: w.position || w.role || '',
        department: w.department || '',
        helmetAssigned: w.assigned_helmet_name || w.helmetAssigned || '',
        helmetStatus: w.helmet_status || w.helmetStatus || '',
      }));
      setWorkers(workers);
    } catch (err: any) {
      console.error('Error loading workers:', err);
      setError(err?.message || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkers();
    setRefreshing(false);
  };

  const handleAddWorker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setAddingWorker(true);
      const workerData = {
        employeeId: formData.get('employeeId'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
        department: formData.get('department'),
        hourlyRate: formData.get('hourlyRate'),
      };
      const newWorker = await apiClient.addWorker(workerData);
      setWorkers(prev => [...prev, newWorker]);
      if (e.currentTarget && typeof e.currentTarget.reset === 'function') {
        e.currentTarget.reset();
      }
      setShowAddWorkerModal(false);
    } catch (err: any) {
      console.error('Error adding worker:', err);
      setError(err?.message || 'Failed to add worker. Please try again.');
    } finally {
      setAddingWorker(false);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!window.confirm('Are you sure you want to delete this worker? This action cannot be undone.')) return;
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteWorker(workerId);
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    } catch (err: any) {
      console.error('Error deleting worker:', err);
      setError(err?.message || 'Failed to delete worker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter workers based on search term and department
  const filteredWorkers = workers.filter(worker => {
    const name = worker.name || '';
    const id = worker.id || '';
    const role = worker.role || '';
    const department = worker.department || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || department.toLowerCase() === filterDepartment.toLowerCase();
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department?: string) => {
    switch ((department || '').toLowerCase()) {
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'electrical':
        return 'bg-blue-100 text-blue-800';
      case 'plumbing':
        return 'bg-green-100 text-green-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'management':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHelmetStatusColor = (status: string) => {
    if (status === 'None' || !status) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading workers...</p>
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
              <h1 className="text-2xl font-bold text-[#05004e]">Worker Management</h1>
              <p className="text-gray-600">Manage construction workers and their assignments</p>
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
              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
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
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workers</p>
                  <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HardHat className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Helmets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workers.filter(w => w.helmetAssigned !== 'None' && w.helmetAssigned).length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Construction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workers.filter(w => w.department === 'Construction').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workers.filter(w => w.helmetStatus === 'assigned' || w.helmetStatus === 'streaming').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search workers by name, ID, or role..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Departments</option>
                <option value="construction">Construction</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="safety">Safety</option>
                <option value="management">Management</option>
              </select>
            </div>
          </Card>

          {/* Workers Table */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Worker ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Helmet Assigned</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || filterDepartment !== 'all' 
                          ? 'No workers found matching your criteria'
                          : 'No workers available'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{worker.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-900">{worker.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {worker.role}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(worker.department)}`}>
                            {worker.department}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {worker.helmetAssigned !== 'None' && worker.helmetAssigned ? (
                            <div className="flex items-center">
                              <HardHat className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="text-gray-900">{worker.helmetAssigned}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No helmet assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHelmetStatusColor(worker.helmetStatus || 'None')}`}>
                            {worker.helmetStatus || 'No Helmet'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {worker.helmetAssigned === 'None' || !worker.helmetAssigned ? (
                              <Link
                                href={`/helmet/assign-helmet?worker=${worker.id}`}
                                className="flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                              >
                                <HardHat className="w-4 h-4 mr-1" />
                                Assign Helmet
                              </Link>
                            ) : (
                              <Link
                                href={`/helmet/deassign-helmet?helmet=${worker.helmetAssigned}`}
                                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                Deassign Helmet
                              </Link>
                            )}
                            <Link
                              href={`/workers/${worker.id}`}
                              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDeleteWorker(worker.id)}
                              className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-white hover:bg-red-600 rounded transition-colors border border-red-200"
                              title="Delete worker"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#05004e]">Add New Worker</h2>
            <form onSubmit={handleAddWorker}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter first name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter last name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter email (optional)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter phone (optional)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="position"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select role</option>
                  <option value="Excavator">Excavator</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Laborer">Laborer</option>
                  <option value="Mason">Mason</option>
                  <option value="Welder">Welder</option>
                  <option value="Painter">Painter</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select department</option>
                  <option value="Construction">Construction</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Safety">Safety</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter hourly rate (optional)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingWorker}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {addingWorker ? 'Adding...' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 