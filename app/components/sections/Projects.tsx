// app/components/sections/Projects.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  features: string[];
  demoLink: string;
  githubLink: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
}

// Sample project data
const projects: Project[] = [
  {
    id: 'project1',
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with product management, cart functionality, and secure payment processing.',
    image: '/images/project1.jpg',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    features: ['User authentication', 'Product search and filtering', 'Shopping cart', 'Payment integration', 'Order management'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/username/project',
    category: 'fullstack',
  },
  {
    id: 'project2',
    title: 'Real-time Chat Application',
    description: 'A real-time messaging platform with private and group chat capabilities, online status, and notification system.',
    image: '/images/project2.jpg',
    technologies: ['React', 'Socket.io', 'Express', 'MongoDB', 'JWT'],
    features: ['Real-time messaging', 'User authentication', 'Online status indicators', 'Read receipts', 'File sharing'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/username/project',
    category: 'fullstack',
  },
  {
    id: 'project3',
    title: 'Task Management Dashboard',
    description: 'A comprehensive project management tool with task tracking, team collaboration, and performance analytics.',
    image: '/images/project3.jpg',
    technologies: ['React', 'Redux', 'TypeScript', 'Material UI', 'Chart.js'],
    features: ['Drag-and-drop interface', 'Task assignments', 'Progress tracking', 'Performance metrics', 'Calendar integration'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/username/project',
    category: 'frontend',
  },
  {
    id: 'project4',
    title: 'Weather Forecast App',
    description: 'A responsive mobile weather application with 7-day forecasts, location-based weather, and interactive maps.',
    image: '/images/project4.jpg',
    technologies: ['React Native', 'Redux', 'Weather API', 'Geolocation', 'Maps SDK'],
    features: ['Real-time weather updates', 'Location tracking', 'Interactive weather maps', 'Hourly forecasts', 'Weather alerts'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/username/project',
    category: 'mobile',
  },
];

export default function Projects() {
  const [filter, setFilter] = useState<string>('all');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Fixed the filtering logic to ensure it always works correctly
  useEffect(() => {
    if (filter === 'all') {
      setFilteredProjects([...projects]); // Create a new array to ensure state update
    } else {
      setFilteredProjects(projects.filter(project => project.category === filter));
    }
  }, [filter]);

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
          <h2 className="text-3xl font-bold mb-4">My <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Each project represents unique challenges and solutions.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'frontend', 'backend', 'fullstack', 'mobile'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filter === category
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-sky-900/20 transition-shadow"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="h-48 bg-slate-700 relative">
                  {/* This would be a project image */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                    <span className="text-3xl text-sky-400">{project.title.charAt(0)}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{project.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="text-xs bg-slate-700 text-sky-300 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Live Demo
                    </a>
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-300">No projects found for this category.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}