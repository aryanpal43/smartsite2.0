'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Image from 'next/image';
import { Search, ArrowLeft, AlertCircle, CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import apiClient from '@/utils/api';

interface Helmet {
  id: string;
  status: string;
  battery: string;
  lastUsed: string;
  condition: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  helmetAssigned: string;
  helmetStatus?: string;
}

export default function AssignHelmet() {
  const router = useRouter();
  const [selectedHelmet, setSelectedHelmet] = useState<Helmet | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [helmetSearchTerm, setHelmetSearchTerm] = useState('');
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [showHelmetNotFoundAlert, setShowHelmetNotFoundAlert] = useState(false);
  const [showWorkerNotFoundAlert, setShowWorkerNotFoundAlert] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [helmetResults, setHelmetResults] = useState<Helmet[]>([]);
  const [workerResults, setWorkerResults] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddHelmetModal, setShowAddHelmetModal] = useState(false);
  const [addingHelmet, setAddingHelmet] = useState(false);
  const [addHelmetError, setAddHelmetError] = useState<string | null>(null);
  const [addHelmetSuccess, setAddHelmetSuccess] = useState(false);

  // Load available helmets and workers on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [helmetsResponse, workersResponse] = await Promise.all([
        apiClient.getAvailableHelmets(),
        apiClient.getWorkers()
      ]);
      
      // Filter workers who don't have helmets assigned
      const availableWorkers = workersResponse.filter((worker: Worker) => 
        worker.helmetAssigned === 'None' || !worker.helmetAssigned
      );
      
      setHelmetResults(helmetsResponse);
      setWorkerResults(availableWorkers);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError(err?.message || 'Failed to load helmets and workers');
    } finally {
      setLoading(false);
    }
  };

  // Real-time helmet search suggestions
  const handleHelmetSearch = async () => {
    if (!helmetSearchTerm.trim()) {
      setHelmetResults([]);
      return;
    }
    
    try {
      const results = await apiClient.getAvailableHelmets(helmetSearchTerm);
      setHelmetResults(results);
      
      if (results.length === 0) {
        setShowHelmetNotFoundAlert(true);
        setTimeout(() => setShowHelmetNotFoundAlert(false), 3000);
      } else {
        setSelectedHelmet(results[0]);
      }
    } catch (err: any) {
      console.error('Error searching helmets:', err);
      setShowHelmetNotFoundAlert(true);
      setTimeout(() => setShowHelmetNotFoundAlert(false), 3000);
    }
  };

  // Auto-suggest for helmet search as user types
  useEffect(() => {
    const searchHelmets = async () => {
      if (helmetSearchTerm.trim().length >= 1) {
        try {
          const results = await apiClient.getAvailableHelmets(helmetSearchTerm);
          setHelmetResults(results);
        } catch (err: any) {
          console.error('Error in helmet auto-suggest:', err);
        }
      } else {
        setHelmetResults([]);
      }
    };

    const debounceTimer = setTimeout(searchHelmets, 300);
    return () => clearTimeout(debounceTimer);
  }, [helmetSearchTerm]);

  // Real-time worker search suggestions
  const handleWorkerSearch = async () => {
    if (!workerSearchTerm.trim()) {
      setWorkerResults([]);
      return;
    }
    
    try {
      const results = await apiClient.searchWorkers(workerSearchTerm);
      // Filter workers who don't have helmets assigned
      const availableWorkers = results.filter((worker: Worker) => 
        worker.helmetAssigned === 'None' || !worker.helmetAssigned
      );
      
      setWorkerResults(availableWorkers);
      
      if (availableWorkers.length === 0) {
        setShowWorkerNotFoundAlert(true);
        setTimeout(() => setShowWorkerNotFoundAlert(false), 3000);
      } else {
        setSelectedWorker(availableWorkers[0]);
      }
    } catch (err: any) {
      console.error('Error searching workers:', err);
      setShowWorkerNotFoundAlert(true);
      setTimeout(() => setShowWorkerNotFoundAlert(false), 3000);
    }
  };

  // Auto-suggest for worker search as user types
  useEffect(() => {
    const searchWorkers = async () => {
      if (workerSearchTerm.trim().length >= 1) {
        try {
          const results = await apiClient.searchWorkers(workerSearchTerm);
          // Filter workers who don't have helmets assigned
          const availableWorkers = results.filter((worker: Worker) => 
            worker.helmetAssigned === 'None' || !worker.helmetAssigned
          );
          setWorkerResults(availableWorkers);
        } catch (err: any) {
          console.error('Error in worker auto-suggest:', err);
        }
      } else {
        setWorkerResults([]);
      }
    };

    const debounceTimer = setTimeout(searchWorkers, 300);
    return () => clearTimeout(debounceTimer);
  }, [workerSearchTerm]);

  // Handle assignment
  const handleAssign = async () => {
    if (selectedHelmet && selectedWorker) {
      try {
        setAssigning(true);
        setError(null);
        
        await apiClient.assignHelmet(selectedHelmet.id, selectedWorker.id);
        
        setAssignmentSuccess(true);
        
        // Refresh the data
        await loadInitialData();
        
        setTimeout(() => {
          setAssignmentSuccess(false);
          router.push('/helmet');
        }, 2000);
      } catch (err: any) {
        console.error('Error assigning helmet:', err);
        setError(err?.message || 'Failed to assign helmet. Please try again.');
      } finally {
        setAssigning(false);
      }
    }
  };

  // Monitor for Enter key presses in search fields
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement?.id === 'helmet-search') {
        handleHelmetSearch();
      } else if (e.key === 'Enter' && document.activeElement?.id === 'worker-search') {
        handleWorkerSearch();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [helmetSearchTerm, workerSearchTerm]);

  // Navigate back to helmet page
  const handleBack = () => {
    router.push('/helmet');
  };

  // Show modal to add a new worker
  const openAddWorkerModal = () => {
    setShowAddWorkerModal(true);
  };
  
  // Add new worker
  const handleAddWorker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const newWorker = await apiClient.addWorker({
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        department: formData.get('department') as string
      });
      
      setShowAddWorkerModal(false);
      setSelectedWorker(newWorker);
      setWorkerResults([newWorker]);
      setWorkerSearchTerm(newWorker.name);
      
      // Clear form
      e.currentTarget.reset();
    } catch (err: any) {
      console.error('Error adding worker:', err);
      setError(err?.message || 'Failed to add worker. Please try again.');
    }
  };

  // Add new helmet
  const handleAddHelmet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingHelmet(true);
    setAddHelmetError(null);
    setAddHelmetSuccess(false);
    const formData = new FormData(e.currentTarget);
    const helmetData = {
      helmetId: formData.get('id') as string,
      name: `Helmet ${formData.get('helmetNumber') as string}`,
      model: 'Safety Pro 2024'
    };
    try {
      await apiClient.addHelmet(helmetData);
      setAddHelmetSuccess(true);
      setTimeout(() => setShowAddHelmetModal(false), 1000);
      await loadInitialData();
    } catch (err: any) {
      setAddHelmetError(err?.message || 'Failed to add helmet. Please try again.');
    } finally {
      setAddingHelmet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading helmets and workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-1 overflow-y-auto p-0">
        <Card className="p-6 mb-6">
          {/* Page header with back button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={handleBack}
                className="flex items-center mr-4 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="mr-2" size={20} />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#05004e]">Assign Helmet</h1>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center p-4 bg-red-100 text-red-700 rounded-lg shadow animate-fadeIn">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {/* Notification Alerts */}
          {showHelmetNotFoundAlert && (
            <div className="mb-4 flex items-center p-4 bg-red-100 text-red-700 rounded-lg shadow animate-fadeIn">
              <AlertCircle className="mr-2" size={20} />
              Helmet not found! Please check the ID and try again.
            </div>
          )}
          
          {showWorkerNotFoundAlert && (
            <div className="mb-4 flex items-center p-4 bg-red-100 text-red-700 rounded-lg shadow animate-fadeIn">
              <AlertCircle className="mr-2" size={20} />
              Worker not found! Would you like to add a new worker?
            </div>
          )}
          
          {assignmentSuccess && (
            <div className="mb-4 flex items-center p-4 bg-green-100 text-green-700 rounded-lg shadow animate-fadeIn">
              <CheckCircle className="mr-2" size={20} />
              Helmet successfully assigned! Redirecting...
            </div>
          )}

          {/* Helmet Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-6 rounded-full shadow-md border border-purple-100">
              <Image 
                src="/images/img_vector.svg" 
                alt="Helmet Icon" 
                width={100} 
                height={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Helmet Search Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#05004e]">Select Helmet</h2>
              
              <div className="mb-4 relative">
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      id="helmet-search"
                      type="text"
                      placeholder="Search helmet by ID..."
                      className="pl-9 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={helmetSearchTerm}
                      onChange={(e) => setHelmetSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  <button
                    onClick={handleHelmetSearch}
                    className="ml-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Helmet Results */}
              {helmetResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-gray-700">Available Helmets</h3>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {helmetResults.map(helmet => (
                      <div 
                        key={helmet.id}
                        className={`p-4 cursor-pointer hover:bg-purple-50 transition-colors flex justify-between items-center ${selectedHelmet?.id === helmet.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
                        onClick={() => {
                          setSelectedHelmet(helmet);
                          setHelmetSearchTerm(helmet.id);
                        }}
                      >
                        <div>
                          <p className="font-medium text-gray-800">{helmet.id}</p>
                          <div className="flex text-sm text-gray-600">
                            <span className={`mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              helmet.condition === 'Excellent' ? 'bg-green-100 text-green-800' : 
                              helmet.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {helmet.condition}
                            </span>
                            <span className="inline-flex items-center">
                              <span className={`w-2 h-2 mr-1 rounded-full ${
                                parseInt(helmet.battery) > 90 ? 'bg-green-500' : 
                                parseInt(helmet.battery) > 70 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}></span>
                              {helmet.battery}
                            </span>
                          </div>
                        </div>
                        {selectedHelmet?.id === helmet.id && (
                          <CheckCircle className="text-purple-500" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Helmet Details */}
              {selectedHelmet && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-md font-medium mb-3 text-gray-700">Selected Helmet Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <p className="text-gray-500">ID:</p>
                      <p className="font-medium">{selectedHelmet.id}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Status:</p>
                      <p className="font-medium">{selectedHelmet.status}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Battery:</p>
                      <p className="font-medium">{selectedHelmet.battery}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Condition:</p>
                      <p className="font-medium">{selectedHelmet.condition}</p>
                    </div>
                    <div className="text-sm col-span-2">
                      <p className="text-gray-500">Last Used:</p>
                      <p className="font-medium">{selectedHelmet.lastUsed}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Worker Search Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#05004e]">Select Worker</h2>
              
              <div className="mb-4">
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      id="worker-search"
                      type="text"
                      placeholder="Search worker by name or ID..."
                      className="pl-9 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  <button
                    onClick={handleWorkerSearch}
                    className="ml-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                  <button
                    onClick={openAddWorkerModal}
                    className="ml-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Add New Worker"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
              </div>

              {/* Worker Results */}
              {workerResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-gray-700">Available Workers</h3>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {workerResults.map(worker => (
                      <div 
                        key={worker.id}
                        className={`p-4 cursor-pointer hover:bg-purple-50 transition-colors flex justify-between items-center ${selectedWorker?.id === worker.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
                        onClick={() => {
                          setSelectedWorker(worker);
                          setWorkerSearchTerm(worker.name);
                        }}
                      >
                        <div>
                          <p className="font-medium text-gray-800">{worker.name}</p>
                          <div className="flex text-sm text-gray-600">
                            <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {worker.id}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              worker.department === 'Construction' ? 'bg-orange-100 text-orange-800' : 
                              worker.department === 'Electrical' ? 'bg-blue-100 text-blue-800' : 
                              worker.department === 'Safety' ? 'bg-green-100 text-green-800' : 
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {worker.department}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{worker.role}</p>
                        </div>
                        {selectedWorker?.id === worker.id && (
                          <CheckCircle className="text-purple-500" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Worker Details */}
              {selectedWorker && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-md font-medium mb-3 text-gray-700">Selected Worker Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <p className="text-gray-500">ID:</p>
                      <p className="font-medium">{selectedWorker.id}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Name:</p>
                      <p className="font-medium">{selectedWorker.name}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Role:</p>
                      <p className="font-medium">{selectedWorker.role}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Department:</p>
                      <p className="font-medium">{selectedWorker.department}</p>
                    </div>
                    <div className="text-sm col-span-2">
                      <p className="text-gray-500">Current Helmet:</p>
                      <p className="font-medium">{selectedWorker.helmetAssigned}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleAssign}
              disabled={!selectedHelmet || !selectedWorker || assigning}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                selectedHelmet && selectedWorker && !assigning
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {assigning ? (
                <>
                  <Loader2 className="inline animate-spin mr-2" size={16} />
                  Assigning...
                </>
              ) : (
                'Assign Helmet'
              )}
            </button>
          </div>
        </Card>
      </div>

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#05004e]">Add New Worker</h2>
            <form onSubmit={handleAddWorker}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter worker name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
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
                </select>
              </div>
              <div className="mb-6">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Helmet Modal */}
      {showAddHelmetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#05004e]">Add New Helmet</h2>
            <form onSubmit={handleAddHelmet}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Helmet ID
                </label>
                <input
                  type="text"
                  name="id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter helmet ID"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Helmet Number
                </label>
                <input
                  type="text"
                  name="helmetNumber"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter helmet number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  defaultValue="not_assigned"
                >
                  <option value="not_assigned">Not Assigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {addHelmetError && (
                <div className="mb-2 text-red-600 text-sm">{addHelmetError}</div>
              )}
              {addHelmetSuccess && (
                <div className="mb-2 text-green-600 text-sm">Helmet added successfully!</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddHelmetModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingHelmet}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {addingHelmet ? 'Adding...' : 'Add Helmet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}