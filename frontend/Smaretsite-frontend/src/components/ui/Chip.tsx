'use client';

import React from 'react';

type ChipVariant = 'active' | 'hold' | 'complete';

interface ChipProps {
  label: string;
  variant: ChipVariant;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ label, variant, className = '' }) => {
  const variantStyles = {
    active: 'bg-[#f0fdf4] text-[#00e58f] border-[#00e48f]',
    hold: 'bg-[#fbf1ff] text-[#884dff] border-[#884dff]',
    complete: 'bg-[#fdf5e6] text-[#ff8900] border-[#ff8900]',
  };

  return (
    <div className={`px-4 py-1 text-sm rounded-lg border ${variantStyles[variant]} ${className}`}>
      {label}
    </div>
  );
};

export default Chip;