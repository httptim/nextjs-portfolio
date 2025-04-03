// app/dashboard/customer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  tasks: {
    total: number;
    completed: number;
  };
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function CustomerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Load customer data
  useEffect(() => {
    // In a real app, this would be API calls
    const loadData = () => {
      // Example data
      setProjects([
        {
          id: 'p1',
          name: 'E-Commerce Website',
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
          status: 'active',
          progress: 25,
          startDate: '2025-03-25',
          endDate: '2025-06-10',
          tasks: {
            total: 12,
            completed: 3,
          },
        },
      ]);
      
      setNotifications([
        {
          id: 'n1',
          message: 'New task added to E-Commerce Website',
          time: '2 hours ago',
          read: false,
        },
        {
          id: 'n2',
          message: 'Task "Design homepage mockup" was marked as completed',
          time: '1 day ago',
          read: false,
        },
        {
          id: 'n3',
          message: 'Your invoice #INV-2023-001 is due in 7 days',
          time: '3 days ago',
          read: true,
        },
      ]);
      
      const name = localStorage.getItem('userName');
      if (name) {
        setUserName(name);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ));
  };

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
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-300">Welcome back, {userName}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        {/* Projects Overview */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white">My Projects</h2>
              <Link 
                href="/dashboard/customer/projects"
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-6">
              {projects.length === 0 ? (
                <p className="text-center text-slate-400">No active projects.</p>
              ) : (
                projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-medium text-white">{project.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {project.startDate} - {project.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white">{project.progress}%</span>
                        <div className="text-xs text-slate-400">
                          {project.tasks.completed}/{project.tasks.total} tasks completed
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-slate-600 rounded-full h-2.5">
                        <div 
                          className="bg-sky-500 h-2.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/dashboard/customer/projects/${project.id}`}
                        className="text-sm text-sky-400 hover:text-sky-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-500/20 text-green-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Completed Tasks</h3>
                <p className="text-2xl font-semibold text-white">11</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-yellow-500/20 text-yellow-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Pending Tasks</h3>
                <p className="text-2xl font-semibold text-white">16</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-sky-500/20 text-sky-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Next Deadline</h3>
                <p className="text-lg font-semibold text-white">April 15, 2025</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-sky-500 pl-4">
                  <p className="text-white text-sm">Task "Set up payment processing" was moved to Review</p>
                  <p className="text-xs text-slate-400">Today, 10:30 AM</p>
                </div>
                <div className="border-l-2 border-green-500 pl-4">
                  <p className="text-white text-sm">Task "Design homepage mockup" was completed</p>
                  <p className="text-xs text-slate-400">Yesterday, 2:45 PM</p>
                </div>
                <div className="border-l-2 border-yellow-500 pl-4">
                  <p className="text-white text-sm">New task "Implement user authentication" was added</p>
                  <p className="text-xs text-slate-400">Apr 1, 2025, 9:15 AM</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-4">
                  <p className="text-white text-sm">Project milestone "Initial Design Phase" completed</p>
                  <p className="text-xs text-slate-400">Mar 29, 2025, 4:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-lg font-medium text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400">No notifications.</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-md ${notification.read ? 'bg-slate-700' : 'bg-slate-700/50 border-l-2 border-sky-500'}`}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm text-white">{notification.message}</p>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="ml-2 text-xs text-sky-400 hover:text-sky-300"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-sky-400 hover:text-sky-300">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

