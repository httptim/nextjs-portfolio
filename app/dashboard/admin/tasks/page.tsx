'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatDeadline } from '@/lib/utils/date-utils';

interface Customer {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  created: string;
  customer: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

  // Load tasks and customers data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasksData = await tasksResponse.json();
        
        // Fetch customers for filtering
        const customersResponse = await fetch('/api/customers');
        if (!customersResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customersData = await customersResponse.json();
        
        setTasks(tasksData.tasks);
        setFilteredTasks(tasksData.tasks);
        setCustomers(customersData.customers);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Apply customer filter
    if (customerFilter !== 'all') {
      result = result.filter(task => task.customer.id === customerFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.project.name.toLowerCase().includes(search) ||
        task.customer.name.toLowerCase().includes(search)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, priorityFilter, customerFilter, searchTerm]);

  const handleAddTask = () => {
    // Initialize default values for new task
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    setEditingTask({
      id: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: tomorrowFormatted,
      created: new Date().toISOString().split('T')[0],
      customer: {
        id: '',
        name: '',
      },
      project: {
        id: '',
        name: '',
      }
    });
    setIsNewTask(true);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsNewTask(false);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!editingTask) return;
    
    try {
      let response;
      
      if (isNewTask) {
        // Create new task
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingTask),
        });
      } else {
        // Update existing task
        response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingTask),
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save task');
      }
      
      // Refresh the tasks list
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks);
      
      // Close the modal
      setIsModalOpen(false);
      setEditingTask(null);
      
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Remove from state
      setTasks(tasks.filter(task => task.id !== id));
      
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: 'todo' | 'in-progress' | 'review' | 'completed') => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update state
      setTasks(tasks.map(task => 
        task.id === id 
          ? { ...task, status: newStatus } 
          : task
      ));
      
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Task form state and handlers would go here but are omitted for brevity
  // In a real implementation, you would have all the form fields and update handlers

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
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
        <p className="mt-1 text-sm text-slate-300">Manage and track project tasks</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div className="w-full md:w-auto">
                <div className="relative rounded-md shadow-sm">
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
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      statusFilter === 'all' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All Tasks
                  </button>
                  <button
                    onClick={() => setStatusFilter('todo')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      statusFilter === 'todo' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => setStatusFilter('in-progress')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      statusFilter === 'in-progress' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setStatusFilter('review')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      statusFilter === 'review' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    In Review
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      statusFilter === 'completed' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Completed
                  </button>
                </div>
                
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors md:ml-4 whitespace-nowrap"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">Priority:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPriorityFilter('all')}
                    className={`px-2 py-1 text-xs rounded-md ${
                      priorityFilter === 'all' 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPriorityFilter('low')}
                    className={`px-2 py-1 text-xs rounded-md ${
                      priorityFilter === 'low' 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Low
                  </button>
                  <button
                    onClick={() => setPriorityFilter('medium')}
                    className={`px-2 py-1 text-xs rounded-md ${
                      priorityFilter === 'medium' 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setPriorityFilter('high')}
                    className={`px-2 py-1 text-xs rounded-md ${
                      priorityFilter === 'high' 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>
              
              <div className="ml-4">
                <span className="text-sm text-slate-300 mr-2">Customer:</span>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                >
                  <option value="all">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Customer / Project
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No tasks found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{task.title}</div>
                          <div className="text-xs text-slate-400">Created: {formatDate(task.created)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{task.customer.name}</div>
                          <div className="text-xs text-slate-400">{task.project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'todo' | 'in-progress' | 'review' | 'completed')}
                            className="bg-slate-700 border-slate-600 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            new Date(task.dueDate) < new Date() && task.status !== 'completed'
                              ? 'text-red-400'
                              : 'text-slate-300'
                          }`}>
                            {formatDeadline(task.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-sky-400 hover:text-sky-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Task Modal - implementation omitted for brevity */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">
                  {isNewTask ? 'Add New Task' : 'Edit Task'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Task form would go here */}
              <p className="text-slate-300 mb-4">Task form fields go here (customer selection, project selection, title, description, due date, etc.)</p>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  {isNewTask ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}