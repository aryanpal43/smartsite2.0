'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-card shadow-card border border-[#f8f9fa] ${className}`}>
      {children}
    </div>
  );
};

export default Card;