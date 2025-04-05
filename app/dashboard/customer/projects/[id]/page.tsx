'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string | null;
  tasks: {
    total: number;
    completed: number;
    overdue: number;
  };
  team: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  nextDeadline: string | null;
  documents: {
    id: string;
    name: string;
    url: string;
    type: string;
    createdAt: string;
  }[];
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'admin' | 'customer';
  timestamp: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'documents'>('overview');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view this project');
          }
          throw new Error('Failed to fetch project details');
        }
        
        const data = await response.json();
        setProject(data.project);
        setRecentTasks(data.recentTasks || []);
        setRecentMessages(data.recentMessages || []);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500';
      case 'on-hold':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getTaskStatusColor = (status: string) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-slate-700 p-4 rounded-md mb-4 text-slate-300">
            Project not found.
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard/customer/projects"
            className="text-sky-400 hover:text-sky-300 flex items-center mb-2"
          >
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
              <div className="mt-1 flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="ml-2 text-sm text-slate-400">
                  Started {formatDate(project.startDate)}
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center">
              <div className="text-right">
                <div className="text-sm text-slate-300">Completion</div>
                <div className="text-lg font-semibold text-white">{project.progress}%</div>
              </div>
              <Link
                href={`/dashboard/customer/chat?project=${project.id}`}
                className="ml-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm transition-colors"
              >
                Send Message
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-white mb-4">Project Description</h2>
                  <p className="text-slate-300 whitespace-pre-wrap">{project.description}</p>
                </div>

                {/* Project Timeline */}
                <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-white mb-4">Timeline</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Start Date</p>
                      <p className="text-white">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">End Date</p>
                      <p className="text-white">{formatDate(project.endDate)}</p>
                    </div>
                    {project.nextDeadline && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-slate-400">Next Deadline</p>
                        <p className="text-white">{formatDate(project.nextDeadline)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-white">Recent Messages</h2>
                    <Link
                      href={`/dashboard/customer/chat?project=${project.id}`}
                      className="text-sm text-sky-400 hover:text-sky-300"
                    >
                      View All
                    </Link>
                  </div>
                  {recentMessages.length > 0 ? (
                    <div className="space-y-4">
                      {recentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                              message.sender === 'customer'
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="mt-1 text-xs text-right opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">No recent messages.</p>
                  )}
                </div>
              </div>

              <div>
                {/* Progress and Stats */}
                <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-white mb-4">Progress</h2>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Completion</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div 
                        className="bg-sky-500 h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-300">Tasks Completed</span>
                      <span className="text-sm text-white">{project.tasks.completed}/{project.tasks.total}</span>
                    </div>
                    {project.tasks.overdue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-300">Overdue Tasks</span>
                        <span className="text-sm text-red-400">{project.tasks.overdue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-white">Recent Tasks</h2>
                    <Link
                      href="/dashboard/customer/tasks"
                      className="text-sm text-sky-400 hover:text-sky-300"
                    >
                      View All
                    </Link>
                  </div>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-4">
                      {recentTasks.map((task) => (
                        <Link 
                          key={task.id}
                          href={`/dashboard/customer/tasks/${task.id}`}
                          className="block"
                        >
                          <div className="bg-slate-700 p-3 rounded-md hover:bg-slate-650 transition-colors">
                            <div className="flex justify-between">
                              <h3 className="text-sm font-medium text-white">{task.title}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                                {task.status === 'todo' ? 'To Do' : 
                                task.status === 'in-progress' ? 'In Progress' :
                                task.status === 'review' ? 'In Review' : 'Completed'}
                              </span>
                              <span className="text-xs text-slate-400">Due: {formatDate(task.dueDate)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">No recent tasks.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-white">Project Tasks</h2>
                <Link
                  href={`/dashboard/customer/tasks?project=${project.id}`}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                >
                  View All Tasks
                </Link>
              </div>
              
              {recentTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Task
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Assigned To
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {recentTasks.map((task) => (
                        <tr 
                          key={task.id} 
                          className="hover:bg-slate-700 cursor-pointer"
                          onClick={() => router.push(`/dashboard/customer/tasks/${task.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{task.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                              {task.status === 'todo' ? 'To Do' : 
                              task.status === 'in-progress' ? 'In Progress' :
                              task.status === 'review' ? 'In Review' : 'Completed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {formatDate(task.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {task.assignedTo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">No tasks found for this project.</p>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-white mb-6">Project Team</h2>
              
              {project.team.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {project.team.map((member) => (
                    <div key={member.id} className="bg-slate-750 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {member.avatar ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={member.avatar}
                              alt={member.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-sky-500 flex items-center justify-center">
                              <span className="text-xl font-medium text-white">{member.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-white">{member.name}</h3>
                          <p className="text-xs text-slate-400">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">No team members assigned to this project.</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-white mb-6">Project Documents</h2>
              
              {project.documents.length > 0 ? (
                <div className="space-y-4">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-750 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-700 rounded-md text-slate-300">
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-white">{doc.name}</h3>
                          <p className="text-xs text-slate-400">
                            {doc.type} • {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">No documents available for this project.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}