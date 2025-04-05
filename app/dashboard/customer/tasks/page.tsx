// app/dashboard/customer/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  project: {
    name: string;
  };
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (status !== 'authenticated') {
        console.log('Not authenticated yet, waiting...');
        return;
      }

      try {
        console.log('Fetching tasks...');
        const response = await fetch('/api/dashboard/customer/tasks', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error response:', errorData);
          throw new Error(errorData?.error || `Failed to fetch tasks: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Tasks data:', data);
        setTasks(data.tasks || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchTasks();
    } else if (status === 'unauthenticated') {
      setError('You must be logged in to view tasks');
      setLoading(false);
    }
  }, [status]);

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
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <div className="mt-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {tasks.length === 0 ? (
              <p className="text-center text-slate-400">No tasks found.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-medium text-white">{task.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-slate-400">
                            Project: {task.project.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white">{task.status}</span>
                        <div className="text-xs text-slate-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
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
