'use client';

import React from 'react';
import Card from '@/components/common/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Chip from '@/components/ui/Chip';

interface Project {
  id: string;
  name: string;
  progress: number;
  progressColor: string;
  progressBgColor: string;
  status: 'active' | 'hold' | 'complete';
}

const projects: Project[] = [
  {
    id: '01',
    name: 'Home Decor Range',
    progress: 78,
    progressColor: '#0094ff',
    progressBgColor: '#cde7ff',
    status: 'active'
  },
  {
    id: '02',
    name: "Disney Princess Pink Bag 18'",
    progress: 61,
    progressColor: '#00e095',
    progressBgColor: '#8bf9c6',
    status: 'active'
  },
  {
    id: '03',
    name: 'Bathroom Essentials',
    progress: 55,
    progressColor: '#884dff',
    progressBgColor: '#c5a8ff',
    status: 'hold'
  },
  {
    id: '04',
    name: 'Apple Smartwatches',
    progress: 33,
    progressColor: '#ff8e0c',
    progressBgColor: '#ffd4a3',
    status: 'complete'
  }
];

const ProjectsTable: React.FC = () => {
  return (
    <Card className="p-6 mb-8">
      <h3 className="text-xl font-semibold text-[#05004e] mb-6">Projects</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f8f9fa]">
              <th className="text-left py-4 text-sm font-normal text-[#96a5b8] w-24">Project ID</th>
              <th className="text-left py-4 text-sm font-normal text-[#96a5b8]">Project Name</th>
              <th className="text-left py-4 text-sm font-normal text-[#96a5b8] w-1/3">Project Progress</th>
              <th className="text-left py-4 text-sm font-normal text-[#96a5b8] w-32">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-[#f8f9fa]">
                <td className="py-4 text-sm text-[#444a6d]">{project.id}</td>
                <td className="py-4 text-sm text-[#444a6d]">{project.name}</td>
                <td className="py-4">
                  <ProgressBar 
                    progress={project.progress} 
                    color={project.progressColor} 
                    bgColor={project.progressBgColor} 
                  />
                </td>
                <td className="py-4">
                  <Chip 
                    label={project.status === 'active' ? 'Active' : project.status === 'hold' ? 'Hold' : 'Complete'} 
                    variant={project.status} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProjectsTable;