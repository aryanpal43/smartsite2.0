"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, HardHat, User } from 'lucide-react';
import apiClient from '@/utils/api';

interface Helmet {
  id: string;
  status: string;
  battery: string;
  lastUsed: string;
  condition: string;
  assignedWorker: string;
  assignedWorkerId?: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  helmetAssigned: string;
}

export default function DeassignHelmet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const helmetId = searchParams.get('helmet');
  
  const [helmet, setHelmet] = useState<Helmet | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [deassigning, setDeassigning] = useState(false);
  const [deassignSuccess, setDeassignSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (helmetId) {
      loadHelmetData();
    }
  }, [helmetId]);
  
  const loadHelmetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all helmets and find the specific one
      const helmets = await apiClient.getHelmets();
      const targetHelmet = helmets.find((h: Helmet) => h.id === helmetId);
      
      if (!targetHelmet) {
        setError('Helmet not found');
        return;
      }

      setHelmet(targetHelmet);

      // If helmet is assigned, get worker details
      if (targetHelmet.assignedWorkerId) {
        const workers = await apiClient.getWorkers();
        const assignedWorker = workers.find((w: Worker) => w.id === targetHelmet.assignedWorkerId);
        setWorker(assignedWorker || null);
      }
    } catch (err: any) {
      console.error('Error loading helmet data:', err);
      setError(err?.message || 'Failed to load helmet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeassign = async () => {
    if (!helmet) return;

    try {
      setDeassigning(true);
      setError(null);
      
      await apiClient.deassignHelmet(helmet.id);
      
    setDeassignSuccess(true);
    
    setTimeout(() => {
      setDeassignSuccess(false);
        router.push('/helmet');
      }, 2000);
    } catch (err: any) {
      console.error('Error deassigning helmet:', err);
      setError(err?.message || 'Failed to deassign helmet. Please try again.');
    } finally {
      setDeassigning(false);
    }
  };

  const handleBack = () => {
    router.push('/helmet');
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading helmet data...</p>
        </div>
          </div>
    );
  }

  if (error && !helmet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
            <button 
            onClick={handleBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
            Go Back
            </button>
          </div>
        </div>
    );
  }

  if (!helmet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Helmet Not Found</h2>
          <p className="text-gray-600 mb-4">The specified helmet could not be found.</p>
            <button 
            onClick={handleBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
            Go Back
            </button>
        </div>
      </div>
    );
  }

  if (helmet.status !== 'Assigned' && helmet.assignedWorker === 'None') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold text-green-600 mb-4">Helmet Already Available</h2>
          <p className="text-gray-600 mb-4">This helmet is not currently assigned to any worker.</p>
                  <button 
            onClick={handleBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
            Go Back
                    </button>
                </div>
              </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
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
                <h1 className="text-2xl font-bold text-[#05004e]">Deassign Helmet</h1>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-center p-4 bg-red-100 text-red-700 rounded-lg shadow animate-fadeIn">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
            )}
            
            {deassignSuccess && (
              <div className="mb-4 flex items-center p-4 bg-green-100 text-green-700 rounded-lg shadow animate-fadeIn">
                <CheckCircle className="mr-2" size={20} />
                Helmet successfully deassigned! Redirecting...
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
              {/* Helmet Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#05004e] flex items-center">
                  <HardHat className="mr-2" size={24} />
                  Helmet Details
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Helmet ID:</span>
                    <span className="font-medium">{helmet.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      helmet.status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 
                      helmet.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {helmet.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery Level:</span>
                    <span className={`font-medium ${
                      parseInt(helmet.battery) > 80 ? 'text-green-600' : 
                      parseInt(helmet.battery) > 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {helmet.battery}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      helmet.condition === 'Excellent' ? 'bg-green-100 text-green-800' : 
                      helmet.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {helmet.condition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Used:</span>
                    <span className="font-medium">
                      {helmet.lastUsed !== 'Never' ? 
                        new Date(helmet.lastUsed).toLocaleDateString() : 
                        'Never'
                      }
                    </span>
                    </div>
                    </div>
                    </div>

              {/* Worker Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#05004e] flex items-center">
                  <User className="mr-2" size={24} />
                  Assigned Worker
                </h2>
                
                {worker ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Worker ID:</span>
                      <span className="font-medium">{worker.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{worker.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium">{worker.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        worker.department === 'Construction' ? 'bg-orange-100 text-orange-800' : 
                        worker.department === 'Electrical' ? 'bg-blue-100 text-blue-800' : 
                        worker.department === 'Safety' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {worker.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Helmet:</span>
                      <span className="font-medium text-blue-600">{helmet.id}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                    <p className="text-gray-600">Worker information not available</p>
                  </div>
                )}
          </div>
        </div>

            {/* Confirmation Message */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Confirm Deassignment
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Are you sure you want to deassign helmet <strong>{helmet.id}</strong> from {worker?.name || 'the worker'}? 
                    This will make the helmet available for assignment to other workers.
                  </p>
              </div>
                </div>
              </div>
              
            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
                <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeassign}
                disabled={deassigning}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  deassigning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deassigning ? (
                  <>
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                    Deassigning...
                  </>
                ) : (
                  'Deassign Helmet'
                )}
                </button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}