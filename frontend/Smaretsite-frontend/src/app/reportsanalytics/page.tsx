'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import Card from '@/components/common/Card';
import { Download, Calendar, Filter, ChevronDown, Users, Clock, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('Performance');
  
  // Sample data for charts
  const performanceData = [
    { name: 'Week 1', excellent: 12, good: 18, average: 8, poor: 2 },
    { name: 'Week 2', excellent: 15, good: 16, average: 6, poor: 3 },
    { name: 'Week 3', excellent: 18, good: 14, average: 7, poor: 1 },
    { name: 'Week 4', excellent: 20, good: 15, average: 5, poor: 0 },
  ];
  
  const attendanceData = [
    { name: 'John', id: 'WRK-001', attendance: 98 },
    { name: 'Jane', id: 'WRK-002', attendance: 95 },
    { name: 'Mike', id: 'WRK-003', attendance: 90 },
    { name: 'Sarah', id: 'WRK-004', attendance: 99 },
    { name: 'David', id: 'WRK-005', attendance: 92 },
    { name: 'Alex', id: 'WRK-006', attendance: 97 },
    { name: 'Linda', id: 'WRK-007', attendance: 88 },
    { name: 'Robert', id: 'WRK-008', attendance: 94 },
  ];
  
  const projectProgressData = [
    { name: 'Project A1', completed: 72, remaining: 28 },
    { name: 'Project B2', completed: 38, remaining: 62 },
    { name: 'Project C3', completed: 45, remaining: 55 },
    { name: 'Project D4', completed: 85, remaining: 15 },
    { name: 'Project E5', completed: 100, remaining: 0 },
  ];
  
  const pieData = [
    { name: 'Electrical', value: 35 },
    { name: 'Plumbing', value: 25 },
    { name: 'Carpentry', value: 20 },
    { name: 'Masonry', value: 15 },
    { name: 'Others', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Sample reports list
  const reports = [
    { 
      id: 'REP-001', 
      title: 'Monthly Performance Summary', 
      date: '2025-05-01', 
      type: 'Performance', 
      author: 'System', 
      size: '2.4 MB' 
    },
    { 
      id: 'REP-002', 
      title: 'Project A1 Progress Report', 
      date: '2025-05-10', 
      type: 'Project', 
      author: 'Robert Chen', 
      size: '3.1 MB' 
    },
    { 
      id: 'REP-003', 
      title: 'Worker Efficiency Analysis Q1', 
      date: '2025-04-15', 
      type: 'Efficiency', 
      author: 'System', 
      size: '4.7 MB' 
    },
    { 
      id: 'REP-004', 
      title: 'Safety Incident Summary', 
      date: '2025-05-05', 
      type: 'Safety', 
      author: 'Maria Lopez', 
      size: '1.8 MB' 
    },
    { 
      id: 'REP-005', 
      title: 'Attendance & Work Hours Report', 
      date: '2025-05-15', 
      type: 'Attendance', 
      author: 'System', 
      size: '2.9 MB' 
    },
  ];

  return (
        <div className="flex-1 overflow-y-auto p-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#05004e]">Reports & Analytics</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700">
                  <Calendar size={18} />
                  <span>{dateRange}</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Filter size={18} />
                <span>Filter</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                <Download size={18} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
          
          {/* Report Type Selection */}
          <div className="flex mb-6 bg-white rounded-lg border border-gray-200 p-1">
            {['Performance', 'Attendance','Safety', 'Efficiency'].map((type) => (
              <button
                key={type}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${
                  reportType === type ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => setReportType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Dashboard Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-[#05004e]">Worker Performance Trends</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="excellent" stackId="a" fill="#4ADE80" />
                    <Bar dataKey="good" stackId="a" fill="#60A5FA" />
                    <Bar dataKey="average" stackId="a" fill="#FBBF24" />
                    <Bar dataKey="poor" stackId="a" fill="#F87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#05004e]">Labor Distribution</h2>
              <div className="h-72 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#05004e]">Worker Attendance Rate</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#60A5FA" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#05004e]">Project Progress</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectProgressData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#4ADE80" />
                    <Bar dataKey="remaining" stackId="a" fill="#E5E7EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Generated Reports */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#05004e]">Generated Reports</h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <button className="flex items-center gap-1 text-sm text-gray-700">
                  <span>Date</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 rounded-tl-lg">Report</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Author</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            <div className="text-xs text-gray-500">{report.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <Download size={16} />
                          <span>Download</span>
                        </button>
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