'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import Card from '@/components/common/Card';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Download, Eye, CalendarDays, FileText, Users } from 'lucide-react';

export default function DrawingBills() {
  const [activeTab, setActiveTab] = useState('drawings');
  
  // Sample project data
  const currentProject = {
    id: 'Project_ID_A1',
    title: 'Commercial Tower Construction',
    status: 'Active',
    image: '/images/project_thumbnail.jpg',
    description: 'A 30-story commercial tower with modern amenities and sustainable design features.',
    location: 'Downtown Metro Area',
    startDate: '2024-02-15',
    endDate: '2025-11-20',
    completion: 45
  };

  // Sample projects for the table
  const projects = [
    {
      id: 'Project_ID_A1',
      title: 'Commercial Tower Construction',
      location: 'Downtown Metro Area',
      startDate: '2024-02-15',
      documentsCount: 24,
      billsCount: 12
    },
    {
      id: 'Project_ID_B2',
      title: 'Residential Complex Phase II',
      location: 'Riverside District',
      startDate: '2024-03-22',
      documentsCount: 18,
      billsCount: 8
    },
    {
      id: 'Project_ID_C3',
      title: 'Highway Extension Project',
      location: 'North County',
      startDate: '2024-01-10',
      documentsCount: 32,
      billsCount: 15
    },
    {
      id: 'Project_ID_D4',
      title: 'Public Library Renovation',
      location: 'City Center',
      startDate: '2024-04-05',
      documentsCount: 14,
      billsCount: 6
    }
  ];

  // Sample documents for the current project
  const projectDocuments = [
    {
      id: 'DOC001',
      type: 'drawing',
      title: 'Foundation Blueprint',
      category: 'Structural',
      dateAdded: '2024-02-20',
      addedBy: 'John Architect',
      size: '4.2 MB',
      thumbnail: '/images/blueprint_thumbnail.jpg'
    },
    {
      id: 'DOC002',
      type: 'drawing',
      title: 'Electrical Layout - Floor 1-10',
      category: 'Electrical',
      dateAdded: '2024-02-25',
      addedBy: 'Sarah Engineer',
      size: '3.8 MB',
      thumbnail: '/images/electrical_thumbnail.jpg'
    },
    {
      id: 'DOC003',
      type: 'bill',
      title: 'Concrete Supply Invoice',
      category: 'Materials',
      dateAdded: '2024-03-05',
      addedBy: 'Mike Procurement',
      size: '1.2 MB',
      thumbnail: '/images/invoice_thumbnail.jpg'
    },
    {
      id: 'DOC004',
      type: 'bill',
      title: 'Equipment Rental March 2024',
      category: 'Equipment',
      dateAdded: '2024-03-15',
      addedBy: 'Lisa Manager',
      size: '0.9 MB',
      thumbnail: '/images/invoice_thumbnail.jpg'
    }
  ];

  // Filter documents based on active tab
  const filteredDocuments = projectDocuments.filter(doc => 
    activeTab === 'all' || doc.type === activeTab
  );

  return (      
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#05004e]">Drawing & Bills</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Main Project Card with Image */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Project Image */}
              <div className="w-full lg:w-1/3 relative h-64 rounded-lg overflow-hidden">
                <Image 
                  src={currentProject.image} 
                  alt={currentProject.title}
                  fill
                  className="rounded-lg object-cover"
                />
                
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm font-medium">{currentProject.status}</span>
                </div>
              </div>
              
              {/* Project Details */}
              <div className="w-full lg:w-2/3">
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#05004e]">{currentProject.title}</h2>
                    <p className="text-sm text-gray-500">Project ID: {currentProject.id}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm font-medium">{currentProject.completion}% Complete</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{currentProject.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <CalendarDays size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium">{new Date(currentProject.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-sm font-medium">{new Date(currentProject.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">{projectDocuments.length} Files</p>
                    </div>
                  </div>
                </div>
                
                {/* Document Type Tabs */}
                <div className="flex space-x-4 border-b">
                  <button
                    className={`pb-2 px-1 text-sm font-medium ${
                      activeTab === 'all' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Documents
                  </button>
                  <button
                    className={`pb-2 px-1 text-sm font-medium ${
                      activeTab === 'drawing' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('drawing')}
                  >
                    Drawings
                  </button>
                  <button
                    className={`pb-2 px-1 text-sm font-medium ${
                      activeTab === 'bill' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('bill')}
                  >
                    Bills
                  </button>
                </div>
              </div>
            </div>
            
            {/* Documents Grid */}
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-40 bg-gray-100">
                      <Image 
                        src={doc.thumbnail} 
                        alt={doc.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                        {doc.category}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-800 mb-1">{doc.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">Added on {new Date(doc.dateAdded).toLocaleDateString()}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{doc.size}</span>
                        <div className="flex space-x-2">
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <Eye size={16} className="text-gray-500" />
                          </button>
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <Download size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Projects Table */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#05004e]">All Projects</h2>
              <p className="text-sm text-gray-500">View drawings and bills for all projects</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Drawings</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bills</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500">{project.id}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{project.location}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{new Date(project.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{project.documentsCount}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{project.billsCount}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <Link 
                          href={`/drawing/${project.id}`}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded-md text-xs transition-colors"
                        >
                          View Documents
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

  );
}