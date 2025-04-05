// app/dashboard/customer/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
  assignedTo: string;
}

export default function CustomerTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);

  // Fetch tasks data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks/customer');
        
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks);
        
        // Extract unique projects for filter
        const uniqueProjects = Array.from(
          new Set(tasksData.tasks.map((task: Task) => task.projectId))
        ).map(projectId => {
          const project = tasksData.tasks.find((task: Task) => task.projectId === projectId);
          return {
            id: projectId as string,
            name: project ? project.projectName : 'Unknown Project'
          };
        });
        
        setProjects(uniqueProjects);
      } catch (err) {
        console.error('Error fetching tasks data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter tasks
  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .filter(task => priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter)
    .filter(task => projectFilter === 'all' || task.projectId === projectFilter)
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-slate-500/20 text-slate-300';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-500';
      case 'REVIEW':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-500/20 text-green-500';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'HIGH':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'REVIEW': return 'In Review';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md">
            {error}
            <button 
              className="ml-2 underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-300">View and track your project tasks</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-2 block w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'card' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tasks */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400">No tasks found matching your filters.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Task
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {filteredTasks.map((task) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-slate-700 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{task.title}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{task.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{task.projectName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusDisplay(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatDate(task.dueDate)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700 rounded-lg overflow-hidden shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-md font-medium text-white">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="text-xs text-slate-400 mb-3">
                        <div>Project: {task.projectName}</div>
                        <div>Assigned to: {task.assignedTo}</div>
                        <div>Due date: {formatDate(task.dueDate)}</div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusDisplay(task.status)}
                        </span>
                        <button className="text-xs text-sky-400 hover:text-sky-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}