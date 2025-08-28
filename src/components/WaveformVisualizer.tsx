'use client';

import { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
}

export default function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.2));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-end justify-center space-x-1 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`bg-gradient-to-t from-purple-400 to-pink-400 rounded-full transition-all duration-150 ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            width: '4px',
            height: `${height * 60 + 12}px`,
            animationDelay: `${index * 50}ms`
          }}
        />
      ))}
    </div>
  );
}
