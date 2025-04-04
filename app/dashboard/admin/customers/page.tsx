// app/dashboard/customer/page.tsx (updated with real data)
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  tasksCompleted: number;
  pendingTasks: number;
  nextDeadline: string | null;
  totalInvoices: number;
  unpaidInvoices: number;
}

interface Activity {
  id: string;
  type: 'task' | 'message' | 'payment' | 'project' | 'invoice';
  action: string;
  project: string | null;
  customer: string | null;
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  time: string;
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get user data from NextAuth session or localStorage
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (session && session.user) {
          setUserName(session.user.name || '');
        } else {
          // Fallback to localStorage (for backwards compatibility)
          const storedName = localStorage.getItem('userName');
          if (storedName) setUserName(storedName);
        }
        
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/customer/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const statsData = await statsResponse.json();
        
        // Fetch activities
        const activitiesResponse = await fetch('/api/dashboard/customer/activities');
        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch recent activities');
        }
        const activitiesData = await activitiesResponse.json();
        
        // Fetch notifications
        const notificationsResponse = await fetch('/api/dashboard/customer/notifications');
        let notificationsData = { notifications: [] };
        if (notificationsResponse.ok) {
          notificationsData = await notificationsResponse.json();
        }
        
        setStats(statsData.stats);
        setActivities(activitiesData.activities);
        setNotifications(notificationsData.notifications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Format deadline date
  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return 'None';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ));
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
            
            {stats?.activeProjects === 0 ? (
              <p className="text-center text-slate-400 py-4">No active projects.</p>
            ) : (
              <div className="space-y-6">
                {/* Projects would be loaded here - for now show a summary */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-medium text-white">Project Summary</h3>
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                          Active Projects: {stats?.activeProjects || 0}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          Completed: {stats?.completedProjects || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-white">Next Deadline</span>
                      <div className="text-xs text-slate-400">
                        {formatDeadline(stats?.nextDeadline || null)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <p className="text-2xl font-semibold text-white">{stats?.tasksCompleted || 0}</p>
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
                <p className="text-2xl font-semibold text-white">{stats?.pendingTasks || 0}</p>
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
                <p className="text-lg font-semibold text-white">
                  {stats?.nextDeadline ? formatDeadline(stats.nextDeadline) : 'None scheduled'}
                </p>
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
              {activities.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No recent activities.</p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="border-l-2 border-sky-500 pl-4">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-xs text-slate-400">{formatDate(activity.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
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
              {notifications.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No notifications.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
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
                  ))}
                </div>
              )}
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