// app/components/Particles.tsx
'use client';

import { useCallback, useEffect, useState } from "react";
import { useMousePosition } from "../hooks/useMousePosition";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
  vx: number; // Added velocity x
  vy: number; // Added velocity y
}

interface ConnectionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  id: string;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const mousePosition = useMousePosition();
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Initialize dimensions
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate particles with initial velocities
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const particleCount = Math.min(
      100,
      Math.floor((dimensions.width * dimensions.height) / 10000)
    );
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 2 + 1,
      color: `rgba(${160 + Math.floor(Math.random() * 40)}, ${
        200 + Math.floor(Math.random() * 55)
      }, ${230 + Math.floor(Math.random() * 25)}, ${
        0.3 + Math.random() * 0.7
      })`,
      id: i,
      vx: (Math.random() - 0.5) * 0.3, // Initial velocity X
      vy: (Math.random() - 0.5) * 0.3, // Initial velocity Y
    }));

    setParticles(newParticles);
  }, [dimensions]);

  // Create connections between particles
  useEffect(() => {
    const maxDistance = 150;
    const newConnections: ConnectionLine[] = [];

    // Connect particles to each other if they are close enough
    for (let i = 0; i < particles.length; i++) {
      const particle1 = particles[i];
      
      // Connect with mouse if close enough
      if (mousePosition.x && mousePosition.y) {
        const dx = particle1.x - mousePosition.x;
        const dy = particle1.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance * 1.5) {
          newConnections.push({
            x1: particle1.x,
            y1: particle1.y,
            x2: mousePosition.x,
            y2: mousePosition.y,
            id: `mouse-${particle1.id}`,
          });
        }
      }
      
      // Connect with other particles
      for (let j = i + 1; j < particles.length; j++) {
        const particle2 = particles[j];
        const dx = particle1.x - particle2.x;
        const dy = particle1.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          newConnections.push({
            x1: particle1.x,
            y1: particle1.y,
            x2: particle2.x,
            y2: particle2.y,
            id: `${particle1.id}-${particle2.id}`,
          });
        }
      }
    }

    setConnections(newConnections);
  }, [particles, mousePosition]);

  // Smooth animation for particles with physics-based movement
  useEffect(() => {
    if (particles.length === 0) return;

    const animateParticles = () => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Move based on velocity
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          
          // Bounce off walls
          let newVx = particle.vx;
          let newVy = particle.vy;
          
          if (newX <= 0 || newX >= dimensions.width) {
            newVx = -particle.vx;
            newX = newX <= 0 ? 0 : dimensions.width;
          }
          
          if (newY <= 0 || newY >= dimensions.height) {
            newVy = -particle.vy;
            newY = newY <= 0 ? 0 : dimensions.height;
          }
          
          // Add tiny random movement to prevent straight lines
          newVx += (Math.random() - 0.5) * 0.01;
          newVy += (Math.random() - 0.5) * 0.01;
          
          // Optional: dampen velocity slightly to prevent excessive speed
          newVx *= 0.99;
          newVy *= 0.99;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 30); // More frequent updates for smoother animation
    return () => clearInterval(interval);
  }, [particles, dimensions]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
      
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw connection lines */}
        {connections.map((connection) => (
          <motion.line
            key={connection.id}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Draw particles */}
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </svg>
    </div>
  );
}