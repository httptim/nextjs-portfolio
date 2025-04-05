// app/dashboard/admin/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  customer: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerId: '',
    projectId: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED',
    dueDate: '',
    assignedToId: '',
  });

  // Fetch data
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
        setTasks(tasksData.tasks);
        
        // Fetch users for assignment
        const usersResponse = await fetch('/api/users');
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtered and searched tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      
      // Map filter value to corresponding task status format
      const statusMap: Record<string, string> = {
        'todo': 'TODO',
        'in-progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'completed': 'COMPLETED'
      };
      
      return task.status === statusMap[filter];
    })
    .filter(task => priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter)
    .filter(task => projectFilter === 'all' || task.project.id === projectFilter)
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddTask = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    setFormData({
      title: '',
      description: '',
      customerId: '',
      projectId: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: tomorrowFormatted,
      assignedToId: '',
    });
    
    setIsNewTask(true);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      customerId: task.customer.id,
      projectId: task.project.id,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignedToId: task.assignedTo?.id || '',
    });
    
    setEditingTask(task);
    setIsNewTask(false);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (!formData.title.trim()) {
        alert('Title is required');
        return;
      }
      
      if (!formData.projectId) {
        alert('Project is required');
        return;
      }
      
      if (!formData.dueDate) {
        alert('Due date is required');
        return;
      }
      
      let response;
      
      if (isNewTask) {
        // Create new task
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else if (editingTask) {
        // Update existing task
        response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response || !response.ok) {
        throw new Error('Failed to save task');
      }
      
      const data = await response.json();
      
      if (isNewTask) {
        setTasks([...tasks, data.task]);
      } else {
        setTasks(tasks.map(task => task.id === data.task.id ? data.task : task));
      }
      
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while saving the task');
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
      
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the task');
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED') => {
    try {
      const response = await fetch(`/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      setTasks(tasks.map(task => 
        task.id === id 
          ? { ...task, status: newStatus } 
          : task
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while updating task status');
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter projects by customer
  const getProjectsByCustomer = (customerId: string) => {
    return projects.filter(project => project.clientId === customerId);
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
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      filter === 'all' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All Tasks
                  </button>
                  <button
                    onClick={() => setFilter('todo')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      filter === 'todo' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => setFilter('in-progress')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      filter === 'in-progress' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setFilter('review')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      filter === 'review' 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    In Review
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                      filter === 'completed' 
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

            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">Priority Filter:</span>
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
                          <div className="text-xs text-slate-400">Created: {formatDate(task.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{task.customer.name}</div>
                          <div className="text-xs text-slate-400">{task.project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED')}
                            className="bg-slate-700 border-slate-600 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">In Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatDate(task.dueDate)}
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

      {/* Edit/Add Task Modal */}
      {isModalOpen && (
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerId" className="block text-sm font-medium text-slate-300">
                      Customer
                    </label>
                    <select
                      id="customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Reset project when customer changes
                        setFormData(prev => ({ ...prev, projectId: '' }));
                      }}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select Customer</option>
                      {users.filter(user => user.role === 'CUSTOMER').map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-slate-300">
                      Project
                    </label>
                    <select
                      id="projectId"
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select Project</option>
                      {formData.customerId ? 
                        getProjectsByCustomer(formData.customerId).map(project => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        )) : 
                        <option disabled>Select a customer first</option>
                      }
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-300">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">In Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="assignedToId" className="block text-sm font-medium text-slate-300">
                    Assigned To
                  </label>
                  <select
                    id="assignedToId"
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Not Assigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}