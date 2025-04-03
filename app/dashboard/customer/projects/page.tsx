// app/dashboard/customer/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  tasks: {
    total: number;
    completed: number;
  };
}

export default function CustomerProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  // Load projects data
  useEffect(() => {
    // In a real app, this would be an API call
    const loadProjects = () => {
      setProjects([
        {
          id: 'p1',
          name: 'E-Commerce Website',
          description: 'A full-featured online store with product management, cart functionality, and secure payment processing.',
          status: 'active',
          progress: 65,
          startDate: '2025-03-15',
          endDate: '2025-05-30',
          tasks: {
            total: 15,
            completed: 8,
          },
        },
        {
          id: 'p2',
          name: 'Mobile App UI/UX',
          description: 'Design and implementation of user interface for iOS and Android mobile application.',
          status: 'active',
          progress: 25,
          startDate: '2025-03-25',
          endDate: '2025-06-10',
          tasks: {
            total: 12,
            completed: 3,
          },
        },
        {
          id: 'p3',
          name: 'Brand Identity Redesign',
          description: 'Complete redesign of company brand identity including logo, color palette, and style guide.',
          status: 'completed',
          progress: 100,
          startDate: '2025-01-10',
          endDate: '2025-02-28',
          tasks: {
            total: 8,
            completed: 8,
          },
        },
        {
          id: 'p4',
          name: 'Marketing Website',
          description: 'Corporate website with information about services, team, and contact form.',
          status: 'on-hold',
          progress: 40,
          startDate: '2025-02-15',
          endDate: '2025-04-30',
          tasks: {
            total: 10,
            completed: 4,
          },
        },
      ]);
      setLoading(false);
    };

    loadProjects();
  }, []);

  // Filter projects based on status
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500';
      case 'on-hold':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">My Projects</h1>
        <p className="mt-1 text-sm text-slate-300">View and manage your ongoing projects</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'active' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'completed' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('on-hold')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter === 'on-hold' 
                ? 'bg-sky-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            On Hold
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="md:col-span-2 p-10 bg-slate-800 rounded-lg text-center">
              <p className="text-slate-400">No projects found with the selected filter.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-medium text-white">{project.name}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div 
                        className="bg-sky-500 h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400">Start Date</p>
                      <p className="text-sm text-white">{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">End Date</p>
                      <p className="text-sm text-white">{project.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-1">Tasks</p>
                    <p className="text-sm text-white">
                      {project.tasks.completed} completed of {project.tasks.total} total
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      href={`/dashboard/customer/projects/${project.id}`}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

