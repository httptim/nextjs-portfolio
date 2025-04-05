'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
  assignedTo: string;
}

interface Project {
  id: string;
  name: string;
}

export default function CustomerTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  // Load tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        if (priorityFilter !== 'all') params.append('priority', priorityFilter);
        if (projectFilter !== 'all') params.append('project', projectFilter);
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`/api/customer/tasks?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filter, priorityFilter, projectFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-500/20 text-slate-300';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-500';
      case 'review':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/20 text-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'high':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeDueDate = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    
    // Set time to midnight for proper day comparison
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays < 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due on ${formatDate(dueDate)}`;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
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

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-500 rounded-md">
                {error}
                <button 
                  onClick={() => window.location.reload()}
                  className="ml-2 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Tasks */}
            {tasks.length === 0 ? (
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
                    {tasks.map((task) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-slate-700 cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/customer/tasks/${task.id}`}
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
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status === 'todo' ? 'To Do' : 
                             task.status === 'in-progress' ? 'In Progress' :
                             task.status === 'review' ? 'In Review' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {getRelativeDueDate(task.dueDate)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <Link key={task.id} href={`/dashboard/customer/tasks/${task.id}`}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-700 rounded-lg overflow-hidden shadow hover:bg-slate-650 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-md font-medium text-white">{task.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="text-xs text-slate-400 mb-3">
                          <div>Project: {task.projectName}</div>
                          <div>Assigned to: {task.assignedTo}</div>
                          <div>{getRelativeDueDate(task.dueDate)}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {task.status === 'todo' ? 'To Do' : 
                             task.status === 'in-progress' ? 'In Progress' :
                             task.status === 'review' ? 'In Review' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}