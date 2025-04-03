// app/dashboard/admin/tasks/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  customer: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  created: string;
  description?: string;
}

// Mock task data
const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Design homepage mockup',
    customer: 'John Smith',
    project: 'E-Commerce Website',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-04-10',
    created: '2025-04-01',
    description: 'Create a modern homepage design with hero section, featured products, and testimonials.'
  },
  {
    id: 't2',
    title: 'Implement user authentication',
    customer: 'John Smith',
    project: 'E-Commerce Website',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-04-15',
    created: '2025-04-01',
    description: 'Set up user registration, login, and password recovery functionality.'
  },
  {
    id: 't3',
    title: 'Develop product listing page',
    customer: 'Emma Johnson',
    project: 'Mobile App',
    priority: 'medium',
    status: 'todo',
    dueDate: '2025-04-20',
    created: '2025-04-02'
  },
  {
    id: 't4',
    title: 'Design logo and branding',
    customer: 'Michael Brown',
    project: 'CRM System',
    priority: 'medium',
    status: 'completed',
    dueDate: '2025-04-05',
    created: '2025-03-25'
  },
  {
    id: 't5',
    title: 'Set up payment processing',
    customer: 'John Smith',
    project: 'E-Commerce Website',
    priority: 'high',
    status: 'review',
    dueDate: '2025-04-12',
    created: '2025-04-02'
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

  // Filtered and searched tasks
  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .filter(task => priorityFilter === 'all' || task.priority === priorityFilter)
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddTask = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    setEditingTask({
      id: `t${Date.now()}`,
      title: '',
      customer: '',
      project: '',
      priority: 'medium',
      status: 'todo',
      dueDate: tomorrowFormatted,
      created: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsNewTask(true);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsNewTask(false);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;

    if (isNewTask) {
      setTasks([...tasks, editingTask]);
    } else {
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    }
    
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleUpdateTaskStatus = (id: string, newStatus: 'todo' | 'in-progress' | 'review' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: newStatus } 
        : task
    ));
  };

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
                  {filteredTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <div className="text-xs text-slate-400">Created: {task.created}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{task.customer}</div>
                        <div className="text-xs text-slate-400">{task.project}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {task.dueDate}
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
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No tasks found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Task Modal */}
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-slate-300">
                      Customer
                    </label>
                    <input
                      type="text"
                      id="customer"
                      value={editingTask.customer}
                      onChange={(e) => setEditingTask({ ...editingTask, customer: e.target.value })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-slate-300">
                      Project
                    </label>
                    <input
                      type="text"
                      id="project"
                      value={editingTask.project}
                      onChange={(e) => setEditingTask({ ...editingTask, project: e.target.value })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-300">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">
                      Status
                    </label>
                    <select
                      id="status"
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as 'todo' | 'in-progress' | 'review' | 'completed' })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
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