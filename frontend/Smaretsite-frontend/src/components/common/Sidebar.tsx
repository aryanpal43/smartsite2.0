'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '/images/img_group.svg',
      path: '/dashboard',
    },
    {
      id: 'helmet',
      title: 'Helmet Assign',
      icon: '/images/img_union.png',
      path: '/helmet',
    },
    {
      id: 'workers',
      title: 'Workers',
      icon: '/images/img_avatar.svg',
      path: '/workers',
    },
    {
      id: 'projects',
      title: 'Projects/Sites',
      icon: '/images/img_union_37x37.png',
      path: '/projects',
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '/images/img_interface_chartline.svg',
      path: '/reportsanalytics',
    },
    {
      id: 'alerts',
      title: 'Alerts & Issues',
      icon: '/images/img_image.png',
      path: '/alerts',
    },
    {
      id: 'drawing',
      title: 'Drawing & Bills',
      icon: '/images/img_mdimessageprocessingoutline.png',
      path: '/drawing',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '/images/img_mdicogoutline.svg',
      path: '/settings',
    },
    {
      id: 'signout',
      title: 'Sign Out',
      icon: '/images/img_sign_out_icon.svg',
      path: '/signout',
    },
  ];

  return (
    <div className="h-full w-[345px] bg-white flex flex-col">
      <div className="flex items-center p-10 mb-8">
        <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center">
          <Image src="/images/img_dummy.svg" alt="Logo" width={24} height={24} />
        </div>
        <div className="ml-5">
          <h1 className="text-3xl font-semibold text-secondary">Smartsite</h1>
          <p className="text-sm font-semibold text-secondary">Ekinch</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4 px-10">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              href={item.path}
              key={item.id}
              className={`flex items-center py-3 px-4 rounded-2xl transition-colors ${
                isActive ? 'bg-primary' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={32}
                  height={32}
                />
              </div>
              <span
                className={`ml-4 text-lg ${
                  isActive ? 'text-white font-semibold' : 'text-[#737791] font-normal'
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
