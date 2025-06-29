'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';

const AddProjectPage = () => {
  // Mock router for navigation
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use router.push(path)
  };
  
  // State for form data
  const [formData, setFormData] = useState({
    projectName: '',
    projectId: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generated ID
    clientName: '',
    address: '',
    googleMapsLink: '',
    startDate: '',
    endDate: '',
    projectStatus: 'Ongoing',
    projectType: 'Commercial',
    projectDescription: '',
    teamsInvolved: [],
    totalBudget: '',
    completionPercentage: 0,
    workers: []
  });
  
  // State for file uploads
  const [blueprints, setBlueprints] = useState([]);
  const [bills, setBills] = useState([]);
  
  // State for worker input
  const [workerInput, setWorkerInput] = useState({
    name: '',
    role: '',
    helmetId: '',
    contact: ''
  });
  
  // Available teams for multi-select
  const availableTeams = [
    'Electrical', 'Plumbing', 'Civil', 'Carpentry', 
    'HVAC', 'Finishing', 'Safety', 'Planning', 'Management'
  ];
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle teams selection
  const handleTeamToggle = (team) => {
    setFormData(prev => {
      if (prev.teamsInvolved.includes(team)) {
        return {
          ...prev,
          teamsInvolved: prev.teamsInvolved.filter(t => t !== team)
        };
      } else {
        return {
          ...prev,
          teamsInvolved: [...prev.teamsInvolved, team]
        };
      }
    });
  };
  
  // Handle blueprint file uploads
  const handleBlueprintUpload = (e) => {
    const files = Array.from(e.target.files);
    setBlueprints(prev => [...prev, ...files]);
  };
  
  // Handle bill file uploads
  const handleBillUpload = (e) => {
    const files = Array.from(e.target.files);
    setBills(prev => [...prev, ...files]);
  };
  
  // Handle worker input changes
  const handleWorkerInputChange = (e) => {
    const { name, value } = e.target;
    setWorkerInput({
      ...workerInput,
      [name]: value
    });
  };
  
  // Add worker to project
  const addWorker = () => {
    if (workerInput.name && workerInput.role) {
      setFormData({
        ...formData,
        workers: [...formData.workers, { ...workerInput, id: Date.now() }]
      });
      setWorkerInput({
        name: '',
        role: '',
        helmetId: '',
        contact: ''
      });
    }
  };
  
  // Remove worker from project
  const removeWorker = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.filter(worker => worker.id !== workerId)
    });
  };
  
  // Remove uploaded file
  const removeFile = (fileIndex, fileType) => {
    if (fileType === 'blueprint') {
      setBlueprints(blueprints.filter((_, index) => index !== fileIndex));
    } else if (fileType === 'bill') {
      setBills(bills.filter((_, index) => index !== fileIndex));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your API
    console.log('Form submitted:', { 
      ...formData, 
      blueprints: blueprints.map(file => file.name),
      bills: bills.map(file => file.name)
    });
    
    // Navigate back to projects page
    router.push('/projects');
  };
  
  return (
        <div className="flex-1 overflow-y-auto p-0">
          {/* Page Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={() => router.push('/projects')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-[#05004e]">Add New Project</h1>
          </div>
          
          {/* Form Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Project Name*
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                      placeholder="Auto-generated"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Total Budget*
                    </label>
                    <input
                      type="text"
                      name="totalBudget"
                      value={formData.totalBudget}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="$"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Location Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Location Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Site Address*
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      name="googleMapsLink"
                      value={formData.googleMapsLink}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Schedule and Status Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Schedule & Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Start Date*
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Expected Completion Date*
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Project Status
                    </label>
                    <select
                      name="projectStatus"
                      value={formData.projectStatus}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Delayed">Delayed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Project Type
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Institutional">Institutional</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Completion Percentage
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        name="completionPercentage"
                        value={formData.completionPercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="1"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-4 text-[#05004e] font-medium">{formData.completionPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Teams Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Teams Involved</h2>
                <div className="flex flex-wrap gap-3">
                  {availableTeams.map(team => (
                    <div 
                      key={team}
                      onClick={() => handleTeamToggle(team)}
                      className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
                        formData.teamsInvolved.includes(team) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {team}
                    </div>
                  ))}
                  <div className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200">
                    + Add Custom
                  </div>
                </div>
              </div>
              
              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Project Description</h2>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Provide an overview of the project..."
                ></textarea>
              </div>
              
              {/* Document Uploads Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Blueprints Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-2">
                      Upload Blueprints / Drawings
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="blueprints"
                        onChange={handleBlueprintUpload}
                        className="hidden"
                        multiple
                        accept=".pdf,.dwg,.png,.jpg,.jpeg"
                      />
                      <label htmlFor="blueprints" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <p className="text-sm text-gray-500">
                            Drag & drop files or <span className="text-primary">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Accepts PDF, DWG, PNG, JPEG
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Uploaded Blueprints List */}
                    {blueprints.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-[#737791] mb-2">Uploaded Files:</p>
                        <div className="space-y-2">
                          {blueprints.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <span className="text-sm truncate max-w-xs">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'blueprint')}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bills Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-2">
                      Upload Bills
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="bills"
                        onChange={handleBillUpload}
                        className="hidden"
                        multiple
                        accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="bills" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <p className="text-sm text-gray-500">
                            Drag & drop files or <span className="text-primary">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Accepts PDF, Excel, JPEG, PNG
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Uploaded Bills List */}
                    {bills.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-[#737791] mb-2">Uploaded Files:</p>
                        <div className="space-y-2">
                          {bills.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <span className="text-sm truncate max-w-xs">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'bill')}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Workers Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-[#05004e] border-b pb-2">
                  Workers Assignment
                  <span className="text-sm font-normal text-[#737791] ml-2">
                    (Total Assigned: {formData.workers.length})
                  </span>
                </h2>
                
                {/* Worker Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Worker Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={workerInput.name}
                      onChange={handleWorkerInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={workerInput.role}
                      onChange={handleWorkerInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Helmet ID
                    </label>
                    <input
                      type="text"
                      name="helmetId"
                      value={workerInput.helmetId}
                      onChange={handleWorkerInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#737791] mb-1">
                      Contact
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="contact"
                        value={workerInput.contact}
                        onChange={handleWorkerInputChange}
                        className="w-full p-3 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={addWorker}
                        className="bg-primary text-white px-4 rounded-r-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Workers List */}
                {formData.workers.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="text-left text-[#737791] border-b">
                            <th className="pb-3 px-2">Name</th>
                            <th className="pb-3 px-2">Role</th>
                            <th className="pb-3 px-2">Helmet ID</th>
                            <th className="pb-3 px-2">Contact</th>
                            <th className="pb-3 px-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.workers.map((worker) => (
                            <tr key={worker.id} className="border-b last:border-0">
                              <td className="py-3 px-2">{worker.name}</td>
                              <td className="py-3 px-2">{worker.role}</td>
                              <td className="py-3 px-2">{worker.helmetId || '-'}</td>
                              <td className="py-3 px-2">{worker.contact || '-'}</td>
                              <td className="py-3 px-2">
                                <button
                                  type="button"
                                  onClick={() => removeWorker(worker.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Form Submission Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/projects')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
  );
};

export default AddProjectPage;