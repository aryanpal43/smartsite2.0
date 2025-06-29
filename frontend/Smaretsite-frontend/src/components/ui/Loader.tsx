'use client';

import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  color = '#5d5fef',
  className = '',
}) => {
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeMap[size]} border-4 border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: `transparent ${color} ${color} ${color}` }}
      ></div>
    </div>
  );
};

export default Loader;