// app/components/sections/FutureProjects.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Interface matching PortfolioProject model
interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  features: string[];
  status?: string | null;
  timeline?: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_FILTER = 'FUTURE'; // Filter for this specific category

export default function FutureProjects() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portfolio-items');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || 'Failed to fetch future projects');
        }
        const data = await response.json();
        const fetchedProjects: PortfolioProject[] = data.projects || [];
        // Filter for FUTURE category and sort by order
        const futureProjects = fetchedProjects
          .filter(p => p.category.toUpperCase() === CATEGORY_FILTER)
          .sort((a, b) => a.order - b.order);

        setProjects(futureProjects);

      } catch (err) {
        console.error('Error fetching future projects:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Handle animation
  useEffect(() => {
    if (inView && !loading) {
      controls.start('visible');
    }
  }, [controls, inView, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // --- Render --- //
  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">Future <span className="text-sky-400">Projects</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Ideas and concepts I'm planning to explore or currently developing in my spare time.
          </p>
        </motion.div>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading Projects...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-10 text-red-400">
            Error loading projects: {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-10"
          >
            <p className="text-slate-300">No future projects listed yet.</p>
          </motion.div>
        )}

        {!loading && !error && projects.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className="bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-900/20 transition-shadow flex flex-col"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-semibold mb-3 text-white">{project.title}</h3>
                <p className="text-slate-300 text-sm mb-4 flex-grow">{project.description}</p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Potential Tech</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="text-xs bg-slate-700 text-sky-300 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.status && (
                  <div className="mt-auto pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400"><span className="font-semibold">Status:</span> {project.status}</p>
                  </div>
                )}
                {/* Optional: Add demo/github links if applicable later */}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}