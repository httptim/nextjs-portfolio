// app/dashboard/admin/content/page.tsx
'use client';

import { useState, useEffect } from 'react';
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

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export default function ContentManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error on fetch
      try {
        // Fetch portfolio items (corrected endpoint)
        const projectsResponse = await fetch('/api/portfolio-items', { credentials: 'include' });

        if (!projectsResponse.ok) {
          console.error(`Failed to fetch portfolio items: ${projectsResponse.status} ${projectsResponse.statusText}`);
          let errorDetails = 'Failed to fetch portfolio items';
          try {
            const errorData = await projectsResponse.json();
            errorDetails = errorData.error || errorData.message || errorDetails;
          } catch (parseError) {}
          throw new Error(errorDetails);
        }

        const projectsData = await projectsResponse.json();
        // Ensure the response key matches what the API sends ('portfolioItems')
        setProjects(projectsData.portfolioItems || []); 

        // Fetch contact submissions (corrected endpoint)
        const submissionsResponse = await fetch('/api/contact-submissions', { credentials: 'include' });

        if (!submissionsResponse.ok) {
           console.error(`Failed to fetch contact submissions: ${submissionsResponse.status} ${submissionsResponse.statusText}`);
           // Decide if failing to load submissions should block the whole page
           // setError('Failed to fetch contact submissions'); 
        } else {
          const submissionsData = await submissionsResponse.json();
          // Ensure the response key matches what the API sends ('submissions')
          setContactSubmissions(submissionsData.submissions || []); 
        }
      } catch (err) {
        console.error('Error fetching content data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      id: '',
      title: '',
      description: '',
      category: selectedCategory === 'all' ? 'fullstack' : selectedCategory,
      technologies: [],
    });
    setIsNewProject(true);
    setIsModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    // Basic validation on client side can be helpful
    if (!editingProject.title || !editingProject.category || !editingProject.description) {
      alert('Title, Category, and Description are required.');
      return;
    }

    try {
      let response;
      const apiUrl = isNewProject ? '/api/portfolio-items' : `/api/portfolio-items/${editingProject.id}`;
      const method = isNewProject ? 'POST' : 'PUT';

      response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the correct field names (demoUrl, githubUrl, imageUrl)
        body: JSON.stringify({
          ...editingProject,
          demoLink: undefined, // Don't send demoLink
          githubLink: undefined, // Don't send githubLink
          image: undefined, // Don't send image
          demoUrl: editingProject.demoLink, // Map correctly
          githubUrl: editingProject.githubLink, // Map correctly
          imageUrl: editingProject.image // Map correctly
        }),
        credentials: 'include'
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.details || errorData.error || `Failed to ${isNewProject ? 'create' : 'update'} portfolio item`);
      }

      const data = await response.json();

      // Update state using the correct key ('project') from API response
      if (isNewProject) {
        setProjects([...projects, data.project]);
      } else {
        setProjects(projects.map(p => (p.id === data.project.id ? data.project : p)));
      }

      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while saving the project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/portfolio-items/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to delete portfolio item');
      }
      
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the project');
    }
  };

  const handleViewSubmission = (id: string) => {
    window.location.href = `/dashboard/admin/messages/contact?id=${id}`;
  };

  const handleReplySubmission = (email: string) => {
    const mailtoUrl = `mailto:${email}?subject=Re: Your Inquiry&body=Hello,%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0A`;
    window.open(mailtoUrl, '_blank');
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to delete submission');
      }
      
      setContactSubmissions(contactSubmissions.filter(submission => submission.id !== id));
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the submission');
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
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-slate-400">
                        No projects found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
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
                    ))
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
                  {contactSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                        No contact submissions yet.
                      </td>
                    </tr>
                  ) : (
                    contactSubmissions.map((submission) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={submission.read ? '' : 'bg-slate-750/50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {!submission.read && (
                              <span className="inline-block w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
                            )}
                            {submission.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{submission.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{formatDate(submission.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300 truncate max-w-xs">{submission.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewSubmission(submission.id)}
                            className="text-sky-400 hover:text-sky-300 mr-2"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleReplySubmission(submission.email)}
                            className="text-green-400 hover:text-green-300 mr-2"
                          >
                            Reply
                          </button>
                          <button 
                            onClick={() => handleDeleteSubmission(submission.id)}
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
                    
                    <div>
                      <label htmlFor="features" className="block text-sm font-medium text-slate-300">
                        Features (comma separated)
                      </label>
                      <input
                        type="text"
                        id="features"
                        value={editingProject.features?.join(', ') || ''}
                        onChange={(e) => setEditingProject({ 
                          ...editingProject, 
                          features: e.target.value.split(',').map(feature => feature.trim()).filter(Boolean)
                        })}
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