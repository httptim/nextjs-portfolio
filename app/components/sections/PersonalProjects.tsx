// app/components/sections/PersonalProjects.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface PersonalProject {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

const personalProjects: PersonalProject[] = [
  {
    id: 'personal1',
    title: 'Photography Portfolio',
    description: 'A minimalist portfolio showcasing my landscape and urban photography work, built with a focus on image quality and performance.',
    image: '/images/personal1.jpg',
    tags: ['Photography', 'Gatsby', 'Netlify CMS'],
    link: 'https://example.com',
  },
  {
    id: 'personal2',
    title: 'Recipe Collection App',
    description: 'A personal project to organize and share family recipes with a clean, user-friendly interface.',
    image: '/images/personal2.jpg',
    tags: ['Food', 'React', 'Firebase'],
    link: 'https://example.com',
  },
  {
    id: 'personal3',
    title: 'Travel Map Blog',
    description: 'An interactive map showcasing my travels with integrated blog posts, photos, and travel tips.',
    image: '/images/personal3.jpg',
    tags: ['Travel', 'Mapbox', 'Next.js'],
    link: 'https://example.com',
  },
  {
    id: 'personal4',
    title: 'Retro Game Collection',
    description: 'A tribute to classic 8-bit games with a collection of reimagined classics built with JavaScript.',
    image: '/images/personal4.jpg',
    tags: ['Gaming', 'JavaScript', 'Canvas API'],
    link: 'https://example.com',
  },
];

export default function PersonalProjects() {
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
    <div className="container mx-auto px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Personal <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Beyond my professional work, here are some passion projects I've created to explore new ideas and technologies.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
          variants={containerVariants}
        >
          {personalProjects.map((project) => (
            <motion.div
              key={project.id}
              className="group relative overflow-hidden rounded-lg aspect-video bg-slate-800"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {/* This would be a project image */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-900 group-hover:opacity-80 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-sky-300 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-slate-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-sky-900/50 text-sky-200 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-md text-sm inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Project
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}