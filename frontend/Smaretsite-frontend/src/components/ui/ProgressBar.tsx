'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
  bgColor?: string;
  height?: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#0094ff',
  bgColor = '#cde7ff',
  height = 3,
  className = '',
}) => {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div 
      className={`w-full rounded-[1px] ${className}`} 
      style={{ 
        backgroundColor: bgColor,
        height: `${height}px`
      }}
    >
      <div
        className="rounded-[1px]"
        style={{
          width: `${validProgress}%`,
          backgroundColor: color,
          height: `${height}px`,
          transition: 'width 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default ProgressBar;