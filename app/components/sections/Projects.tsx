// app/components/sections/Projects.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';

// Define the structure of a project
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  demoUrl?: string; // Changed from demoLink
  githubUrl?: string; // Changed from githubLink
  imageUrl?: string; // Changed from image
}

// Define the constant for the category filter
const CATEGORY_FILTER = 'CLIENT_PROJECTS'; // Updated category filter

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px 0px' });

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setError(null); // Reset error before fetch
      try {
        const response = await fetch('/api/portfolio-items');
        if (!response.ok) {
          let errorMsg = 'Failed to fetch portfolio items';
          try {
             const errorData = await response.json();
             errorMsg = errorData.error || errorData.message || errorMsg;
          } catch(e){}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        
        // Filter projects directly based on the constant
        const filteredItems = (data.projects || []).filter((item: Project) => item.category === CATEGORY_FILTER);
        setProjects(filteredItems);

      } catch (err) {
        console.error('Error fetching or filtering portfolio items:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []); // Dependency array is empty, runs once on mount

  // Trigger animation when the component is in view
  useEffect(() => {
    if (inView && !loading) {
      controls.start('visible');
    }
  }, [controls, inView, loading]);

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

  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          {/* Updated Section Title */}
          <h2 className="text-3xl font-bold mb-4 text-white">Client <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on for clients. Each project represents unique challenges and solutions.
          </p>
        </motion.div>

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
        {!loading && !error && projects.length === 0 && (
             <motion.div 
                variants={itemVariants}
                className="text-center py-10"
             >
                {/* Updated Message */}
                <p className="text-slate-300">No projects categorized as 'Client Projects' found.</p>
             </motion.div>
        )}

        {/* Projects Grid - Use 'projects' state directly */}
        {!loading && !error && projects.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants} // Apply stagger to grid itself
          >
            {projects.map((project) => (
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