// app/dashboard/admin/content/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  features?: string[];
  demoLink?: string;
  githubLink?: string;
  image?: string;
  timeline?: string;
  status?: string;
  tags?: string[];
  link?: string;
}

// Mock data for projects
const initialProjects: Project[] = [
  {
    id: 'project1',
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with product management, cart functionality, and secure payment processing.',
    category: 'fullstack',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    features: ['User authentication', 'Product search and filtering', 'Shopping cart', 'Payment integration', 'Order management'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/username/project',
  },
  {
    id: 'future1',
    title: 'AI-Powered Content Creator',
    description: 'A platform that leverages AI to help users generate and optimize content for various platforms and purposes.',
    category: 'future',
    technologies: ['React', 'Next.js', 'OpenAI API', 'Node.js', 'MongoDB'],
    timeline: 'Q3 2023',
    status: 'research',
  },
  {
    id: 'personal1',
    title: 'Photography Portfolio',
    description: 'A minimalist portfolio showcasing my landscape and urban photography work, built with a focus on image quality and performance.',
    category: 'personal',
    technologies: ['Gatsby', 'Netlify CMS'],
    tags: ['Photography', 'Gatsby', 'Netlify CMS'],
    link: 'https://example.com',
  }
];

export default function ContentManagement() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);

  // Filtered projects based on selected category
  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setIsNewProject(false);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject({
      id: `project${Date.now()}`,
      title: '',
      description: '',
      category: selectedCategory === 'all' ? 'fullstack' : selectedCategory,
      technologies: [],
    });
    setIsNewProject(true);
    setIsModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!editingProject) return;

    if (isNewProject) {
      setProjects([...projects, editingProject]);
    } else {
      setProjects(projects.map(p => (p.id === editingProject.id ? editingProject : p)));
    }

    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== id));
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Content Management</h1>
        <p className="mt-1 text-sm text-slate-300">Edit your portfolio content</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-white">Project Management</h2>
                <p className="text-sm text-slate-400">Add, edit or remove projects from your portfolio</p>
              </div>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
              >
                Add New Project
              </button>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['all', 'fullstack', 'frontend', 'backend', 'mobile', 'future', 'personal'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} Projects
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Technologies
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {filteredProjects.map((project) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{project.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{project.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-300">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded bg-slate-700 text-sky-300">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <button
                          onClick={() => handleProjectEdit(project)}
                          className="text-sky-400 hover:text-sky-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-slate-400">
                        No projects found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Messages/Contact Submissions */}
        <div className="mt-8 bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-4">Contact Form Submissions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">Jane Cooper</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">jane.cooper@example.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">Apr 1, 2025</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 truncate max-w-xs">I'm interested in hiring you for a web development project...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-sky-400 hover:text-sky-300 mr-2">View</button>
                      <button className="text-green-400 hover:text-green-300 mr-2">Reply</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">Alex Morgan</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">alex.morgan@example.com</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">Mar 30, 2025</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 truncate max-w-xs">Would you be available for a freelance project starting next month?</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-sky-400 hover:text-sky-300 mr-2">View</button>
                      <button className="text-green-400 hover:text-green-300 mr-2">Reply</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">
                  {isNewProject ? 'Add New Project' : 'Edit Project'}
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
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <select
                    id="category"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="fullstack">Fullstack</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="mobile">Mobile</option>
                    <option value="future">Future Project</option>
                    <option value="personal">Personal Project</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="technologies" className="block text-sm font-medium text-slate-300">
                    Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    id="technologies"
                    value={editingProject.technologies.join(', ')}
                    onChange={(e) => setEditingProject({ 
                      ...editingProject, 
                      technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                    })}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {(editingProject.category === 'fullstack' || 
                  editingProject.category === 'frontend' || 
                  editingProject.category === 'backend' || 
                  editingProject.category === 'mobile') && (
                  <>
                    <div>
                      <label htmlFor="demoLink" className="block text-sm font-medium text-slate-300">
                        Demo Link
                      </label>
                      <input
                        type="text"
                        id="demoLink"
                        value={editingProject.demoLink || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, demoLink: e.target.value })}
                        className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="githubLink" className="block text-sm font-medium text-slate-300">
                        GitHub Link
                      </label>
                      <input
                        type="text"
                        id="githubLink"
                        value={editingProject.githubLink || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, githubLink: e.target.value })}
                        className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </>
                )}

                {editingProject.category === 'future' && (
                  <>
                    <div>
                      <label htmlFor="timeline" className="block text-sm font-medium text-slate-300">
                        Timeline
                      </label>
                      <input
                        type="text"
                        id="timeline"
                        value={editingProject.timeline || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, timeline: e.target.value })}
                        className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-slate-300">
                        Status
                      </label>
                      <select
                        id="status"
                        value={editingProject.status || 'planning'}
                        onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                        className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="planning">Planning Phase</option>
                        <option value="research">Research Phase</option>
                        <option value="prototyping">Prototyping</option>
                        <option value="in-progress">In Progress</option>
                      </select>
                    </div>
                  </>
                )}

                {editingProject.category === 'personal' && (
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-slate-300">
                      Project Link
                    </label>
                    <input
                      type="text"
                      id="link"
                      value={editingProject.link || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                      className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}