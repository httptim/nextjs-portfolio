// app/components/sections/Projects.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Interface matching PortfolioProject model from schema.prisma
interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., FULLSTACK, FRONTEND, etc.
  technologies: string[];
  imageUrl?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  features: string[];
  status?: string | null;
  timeline?: string | null;
  tags: string[];
  order: number;
  createdAt: string; // Dates are typically strings after JSON serialization
  updatedAt: string;
}

// Categories relevant to this component
const RELEVANT_CATEGORIES = ['FULLSTACK', 'FRONTEND', 'BACKEND', 'MOBILE'];

export default function Projects() {
  const [allProjects, setAllProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [displayedProjects, setDisplayedProjects] = useState<PortfolioProject[]>([]);
  
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Fetch all portfolio items
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming GET /api/portfolio-items returns all items
        const response = await fetch('/api/portfolio-items', { cache: 'no-store' });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || 'Failed to fetch projects');
        }
        const data = await response.json();
        const fetchedProjects: PortfolioProject[] = data.projects || [];
        // Filter only relevant categories for this section and sort by order
        const relevantProjects = fetchedProjects
            .filter(p => RELEVANT_CATEGORIES.includes(p.category))
            .sort((a, b) => a.order - b.order);
           
        setAllProjects(relevantProjects);
        setDisplayedProjects(relevantProjects); // Initially display all relevant projects
        setActiveFilter('all'); // Reset filter on new data fetch

      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Handle animation start when component is in view
  useEffect(() => {
    if (inView && !loading) {
      controls.start('visible');
    }
  }, [controls, inView, loading]);

  // Filter projects when activeFilter changes
  const handleFilterChange = (filterName: string) => {
    setActiveFilter(filterName);
    
    if (filterName === 'all') {
      setDisplayedProjects(allProjects);
    } else {
      // Filter from the already relevant projects
      const filtered = allProjects.filter(project => project.category.toUpperCase() === filterName.toUpperCase());
      setDisplayedProjects(filtered);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Get unique categories present in the fetched relevant projects
  const availableCategories = [
      'all', 
      ...Array.from(new Set(allProjects.map(p => p.category.toLowerCase())))
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">My <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Each project represents unique challenges and solutions.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        {!loading && !error && allProjects.length > 0 && (
             <motion.div variants={itemVariants} className="flex justify-center mb-10">
                <div className="flex flex-wrap gap-2 justify-center">
                    {availableCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleFilterChange(category)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        activeFilter === category
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                    ))}
                </div>
            </motion.div>
        )}
      
        {/* Loading State */}
        {loading && (
             <div className="text-center py-10">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
                 <p className="mt-4 text-slate-400">Loading Projects...</p>
             </div>
        )}
       
        {/* Error State */}
        {!loading && error && (
             <div className="text-center py-10 text-red-400">
                Error loading projects: {error}
             </div>
        )}

        {/* No Projects State */}
        {!loading && !error && allProjects.length === 0 && (
             <motion.div 
                variants={itemVariants}
                className="text-center py-10"
             >
                <p className="text-slate-300">No projects available in relevant categories yet.</p>
             </motion.div>
        )}
       
        {/* No Filter Results State */} 
        {!loading && !error && allProjects.length > 0 && displayedProjects.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="text-center py-10"
          >
            <p className="text-slate-300">No projects found matching the '{activeFilter}' filter.</p>
          </motion.div>
        )}

        {/* Projects Grid */}
        {!loading && !error && displayedProjects.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants} // Apply stagger to grid itself
          >
            {displayedProjects.map((project) => (
              <motion.div
                key={project.id}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-sky-900/20 transition-shadow flex flex-col"
                variants={itemVariants} // Apply variant to each item
                layout
                whileHover={{ y: -5 }}
              >
                {/* Use Next/Image if imageUrl exists, otherwise show placeholder */}
                <div className="h-48 bg-slate-700 relative">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <span className="text-3xl text-sky-400">{project.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 flex-grow">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                            <span key={tech} className="text-xs bg-slate-700 text-sky-300 px-2 py-1 rounded">
                            {tech}
                            </span>
                        ))}
                        </div>
                    </div>
                  )}
                  
                  {/* Links */} 
                  <div className="flex space-x-4 mt-auto pt-4 border-t border-slate-700/50">
                    {project.demoUrl && (
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 text-sm flex items-center transition-colors"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Live Demo
                        </a>
                    )}
                     {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-300 text-sm flex items-center transition-colors"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            GitHub
                        </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}