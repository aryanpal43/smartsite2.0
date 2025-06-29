'use client';

import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <div className="h-[120px] w-full bg-white flex items-center justify-between px-10">
      {/* <h1 className="text-4xl font-semibold text-[#151d48]">Dashboard</h1> */}
      
      <div className="flex items-center">
        <div className="relative flex items-center bg-[#f9fafb] rounded-2xl px-6 py-4 w-[513px]">
          <Image 
            src="/images/img_magnifier.svg" 
            alt="Search" 
            width={32} 
            height={32} 
            className="mr-2"
          />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="bg-transparent border-none outline-none text-lg text-[#737791] w-full"
          />
        </div>
        
        <div className="flex items-center ml-8">
          <div className="flex items-center mr-4">
            <Image 
              src="/images/img_united.svg" 
              alt="Language" 
              width={24} 
              height={24} 
              className="mr-2"
            />
            <span className="text-lg font-semibold text-[#374557]">Eng (US)</span>
            <Image 
              src="/images/img_chevrondown.svg" 
              alt="Dropdown" 
              width={24} 
              height={24} 
              className="ml-2"
            />
          </div>
          
          <div className="relative mr-4">
            <Image 
              src="/images/img_notifications.svg" 
              alt="Notifications" 
              width={48} 
              height={48} 
            />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </div>
          
          <div className="flex items-center">
            <Image 
              src="/images/img_rectangle_1393.png" 
              alt="Profile" 
              width={60} 
              height={60} 
              className="rounded-2xl mr-4"
            />
            <div>
              <p className="text-base font-medium text-[#151d48]">Musfiq</p>
              <p className="text-sm text-[#737791]">Admin</p>
            </div>
            <Image 
              src="/images/img_group_21861.svg" 
              alt="Dropdown" 
              width={16} 
              height={16} 
              className="ml-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;