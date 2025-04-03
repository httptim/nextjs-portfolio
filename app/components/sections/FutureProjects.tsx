// app/components/sections/FutureProjects.tsx
'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FutureProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  timeline: string;
  status: 'planning' | 'research' | 'prototyping' | 'in-progress';
}

const futureProjects: FutureProject[] = [
  {
    id: 'future1',
    title: 'AI-Powered Content Creator',
    description: 'A platform that leverages AI to help users generate and optimize content for various platforms and purposes.',
    technologies: ['React', 'Next.js', 'OpenAI API', 'Node.js', 'MongoDB'],
    timeline: 'Q3 2023',
    status: 'research',
  },
  {
    id: 'future2',
    title: 'Blockchain Portfolio Tracker',
    description: 'A comprehensive dashboard for tracking and analyzing cryptocurrency investments across multiple blockchains.',
    technologies: ['React', 'Redux', 'Web3.js', 'Blockchain APIs', 'Chart.js'],
    timeline: 'Q4 2023',
    status: 'planning',
  },
  {
    id: 'future3',
    title: 'Smart Home Automation Hub',
    description: 'A central control system for IoT devices with automation rules, scenes, and voice command integration.',
    technologies: ['React Native', 'Node.js', 'WebSockets', 'IoT Protocols', 'Voice Recognition APIs'],
    timeline: 'Q1 2024',
    status: 'planning',
  },
  {
    id: 'future4',
    title: 'AR Educational App',
    description: 'An augmented reality application for interactive educational experiences in science and history.',
    technologies: ['Unity', 'AR Kit', 'C#', 'React Native', 'Firebase'],
    timeline: 'Q2 2024',
    status: 'research',
  },
];

const statusColors = {
  'planning': 'bg-yellow-600',
  'research': 'bg-blue-600',
  'prototyping': 'bg-purple-600',
  'in-progress': 'bg-green-600',
};

const statusLabels = {
  'planning': 'Planning Phase',
  'research': 'Research Phase',
  'prototyping': 'Prototyping',
  'in-progress': 'In Progress',
};

export default function FutureProjects() {
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
    <div className="container mx-auto px-6 py-20">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Future <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Here's what I'm planning to work on next. These projects represent my interests in emerging technologies and areas I'm excited to explore.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-700" />

          <motion.div variants={containerVariants} className="relative space-y-16">
            {futureProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`flex flex-col md:flex-row ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
                variants={itemVariants}
              >
                <div className="md:w-1/2 flex justify-center">
                  <div className={`
                    w-full max-w-md p-6 rounded-xl bg-slate-800 shadow-lg
                    ${index % 2 === 0 ? 'md:ml-10' : 'md:mr-10'}
                  `}>
                    <div className="flex items-center mb-3">
                      <div className={`rounded-full w-3 h-3 ${statusColors[project.status]} mr-2`} />
                      <span className="text-sm text-slate-300">{statusLabels[project.status]}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-slate-300 text-sm mb-4">{project.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Planned Technology Stack:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="text-xs bg-slate-700 text-sky-300 px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Estimated Timeline: {project.timeline}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="md:w-6 md:h-6 bg-sky-500 rounded-full z-10 relative">
                      <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}