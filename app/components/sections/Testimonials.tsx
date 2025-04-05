// app/components/sections/Testimonials.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  clientName: string; // Expecting formatted data from API
  position?: string | null;
  company?: string | null;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragRef = useRef<HTMLDivElement>(null);

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch only active testimonials (as GET /api/testimonials does by default)
        const response = await fetch('/api/testimonials', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        setTestimonials(data.testimonials || []); // Ensure it's an array
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset < -100 || velocity < -500) {
      // Swipe left
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    } else if (offset > 100 || velocity > 500) {
      // Swipe right
      setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-white">What Clients <span className="text-sky-400">Say</span></h2>
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-white">What Clients <span className="text-sky-400">Say</span></h2>
        <div className="text-center text-red-400">Error loading testimonials: {error}</div>
      </div>
    );
  }
  
  if (testimonials.length === 0) {
     return (
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-white">What Clients <span className="text-sky-400">Say</span></h2>
        <div className="text-center text-slate-400">No testimonials available yet.</div>
      </div>
    ); 
  }

  return (
    <div className="container mx-auto px-6 py-20 overflow-hidden" ref={ref}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-16 text-white"
        >
          What Clients <span className="text-sky-400">Say</span>
        </motion.h2>

        <motion.div 
          ref={dragRef}
          className="relative h-80"
          variants={itemVariants} // Apply item variant to the carousel container
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="absolute w-full h-full flex items-center justify-center"
              custom={index}
              initial={{ opacity: 0, x: index === currentIndex ? 0 : (index > currentIndex ? '100%' : '-100%') }}
              animate={{
                opacity: index === currentIndex ? 1 : 0.5,
                x: 0,
                scale: index === currentIndex ? 1 : 0.8,
                zIndex: index === currentIndex ? 10 : 1,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{ cursor: 'grab' }}
            >
              <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-2xl w-full text-center mx-auto">
                <p className="text-slate-300 italic text-lg mb-6">"{testimonial.content}"</p>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-semibold text-white">{testimonial.clientName}</p>
                <p className="text-sm text-sky-400">
                  {testimonial.position}{testimonial.position && testimonial.company ? ', ' : ''}{testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dots for navigation */} 
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-sky-500' : 'bg-slate-600 hover:bg-slate-500'}`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}