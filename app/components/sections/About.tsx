// app/components/sections/About.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Skill {
  name: string;
  level: number;
  icon: string;
}

const skills: Skill[] = [
  { name: 'React / Next.js', level: 95, icon: 'Re' },
  { name: 'Node.js / Express', level: 90, icon: 'No' },
  { name: 'TypeScript', level: 90, icon: 'Ts' },
  { name: 'Database (SQL/NoSQL)', level: 85, icon: 'Db' },
  { name: 'Tailwind CSS / UI Design', level: 95, icon: 'Ui' },
  { name: 'Cloud / DevOps (AWS/Docker)', level: 75, icon: 'Cl' },
];

export default function About() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
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
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        <div>
          <motion.h2 
            className="text-3xl font-bold mb-4 text-white" 
            variants={itemVariants}
          >
            About <span className="text-sky-400">Me</span>
          </motion.h2>
          
          <motion.div variants={itemVariants} className="space-y-4 text-slate-300">
            <p>
              I'm a passionate Full Stack Developer with a strong focus on creating elegant, user-friendly applications with clean, maintainable code.
            </p>
            <p>
              With over 5 years of experience in web development, I've worked on a diverse range of projects from e-commerce platforms to data visualization dashboards and real-time applications.
            </p>
            <p>
              My approach combines technical expertise with an eye for design and user experience, ensuring that the solutions I build are not only functional but also a joy to use.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-6">
            <a 
              href="/resume.pdf"
              download
              className="inline-flex items-center px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4 text-white">My Skills</h3>
          
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <motion.div 
                key={skill.name} 
                className="space-y-2"
                variants={itemVariants}
                custom={index}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex items-center justify-center bg-slate-800 rounded-md text-sky-400 font-bold text-xs">
                      {skill.icon}
                    </div>
                    <span className="text-slate-300">{skill.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">{skill.level}%</span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    className="bg-sky-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}