'use client';

import React from 'react';
import Image from 'next/image';

interface MetricCardProps {
  title: string;
  icon: string;
  iconBgColor: string;
  children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, iconBgColor, children }) => {
  return (
    <div className="bg-white rounded-metric p-6 relative">
      <div className={`absolute top-6 left-6 w-[54px] h-[50px] ${iconBgColor} rounded-full flex items-center justify-center`}>
        <Image src={icon} alt={title} width={32} height={32} />
      </div>
      <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

interface MetricItemProps {
  value: string;
  label: string;
  bold?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({ value, label, bold = true }) => {
  return (
    <div className="flex items-center">
      <span className={`text-base ${bold ? 'font-bold' : 'font-medium'} text-[#415165] mr-1`}>{value}</span>
      <span className="text-sm font-medium text-[#415165]">{label}</span>
    </div>
  );
};

// const MetricsSection: React.FC = () => {
//   return (
//     <div className="grid grid-cols-4 gap-6 mb-8">
//       <div className="bg-[#ffe2e5] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[54px] h-[50px] bg-[#fa5a7d] rounded-full flex items-center justify-center">
//           <Image src="/images/img_group_white_a700.svg" alt="Attendance" width={32} height={32} />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Attendence</h3>
//         <div className="space-y-2">
//           <MetricItem value="24" label="Worker Present" />
//           <MetricItem value="3" label="Worker Absect" />
//           <MetricItem value="27" label="Total Worker in Projest" />
//         </div>
//       </div>

//       <div className="bg-[#fff4de] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[54px] h-[50px] rounded-full flex items-center justify-center">
//           <Image src="/images/img_ellipse.svg" alt="Progress" width={54} height={50} />
//           <Image src="/images/img_vector_gray_50_04.svg" alt="Progress Icon" width={26} height={26} className="absolute" />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Project Progress</h3>
//         <div className="space-y-2">
//           <MetricItem value="45%" label="Work Remaining" />
//           <MetricItem value="55%" label="Work Done for Today" />
//           <p className="text-xs font-medium text-[#4078ec]">+5% from yesterday</p>
//         </div>
//       </div>

//       <div className="bg-[#dcfce7] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[52px] h-[48px] bg-[#3cd856] rounded-full flex items-center justify-center">
//           <Image src="/images/img_group_white_a700_28x31.svg" alt="Budget" width={31} height={28} />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Budget</h3>
//         <div className="space-y-2">
//           <MetricItem value="5.1 L" label="Total Spend" />
//           <MetricItem value="50 L" label="Project Budget" />
//           <p className="text-xs font-medium text-[#4078ec]">+11% From Budget Used</p>
//         </div>
//       </div>

//       <div className="bg-[#f3e8ff] rounded-metric p-6 relative">
//         <div className="absolute top-5 left-11 w-[53px] h-[49px] bg-[#bf83ff] rounded-full flex items-center justify-center">
//           <Image src="/images/img_group_white_a700_29x32.svg" alt="Targets" width={32} height={29} />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Targets</h3>
//       </div>
//     </div>
//   );
// };

// const MetricsSection: React.FC = () => {
//   return (
//     <div className="grid grid-cols-3 gap-6 mb-8">
//       <div className="bg-[#ffe2e5] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[54px] h-[50px] bg-[#fa5a7d] rounded-full flex items-center justify-center">
//           <Image src="/images/img_group_white_a700.svg" alt="Attendance" width={32} height={32} />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Attendence</h3>
//         <div className="space-y-2">
//           <MetricItem value="24" label="Worker Present" />
//           <MetricItem value="3" label="Worker Absect" />
//           <MetricItem value="27" label="Total Worker in Projest" />
//         </div>
//       </div>

//       <div className="bg-[#fff4de] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[54px] h-[50px] rounded-full flex items-center justify-center">
//           <Image src="/images/img_ellipse.svg" alt="Progress" width={54} height={50} />
//           <Image src="/images/img_vector_gray_50_04.svg" alt="Progress Icon" width={26} height={26} className="absolute" />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4"> Progress</h3>
//         <div className="space-y-2">
//           <MetricItem value="45%" label="Work Remaining" />
//           <MetricItem value="55%" label="Work Done for Today" />
//           <p className="text-xs font-medium text-[#4078ec]">+5% from yesterday</p>
//         </div>
//       </div>

//       <div className="bg-[#dcfce7] rounded-metric p-6 relative">
//         <div className="absolute top-6 left-6 w-[52px] h-[48px] bg-[#3cd856] rounded-full flex items-center justify-center">
//           <Image src="/images/img_group_white_a700_28x31.svg" alt="Budget" width={31} height={28} />
//         </div>
//         <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Budget</h3>
//         <div className="space-y-2">
//           <MetricItem value="5.1 L" label="Total Spend" />
//           <MetricItem value="50 L" label="Project Budget" />
//           <p className="text-xs font-medium text-[#4078ec]">+11% From Budget Used</p>
//         </div>
//       </div>
//     </div>
//   );
// };
const MetricsSection: React.FC = () => {
  const handleClick = (link: string) => {
    // For now, just open the link or do nothing if link is empty
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div
        onClick={() => handleClick("#attendance")}
        className="bg-[#ffe2e5] rounded-metric p-6 relative cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
      >
        <div className="absolute top-6 left-6 w-[54px] h-[50px] bg-[#fa5a7d] rounded-full flex items-center justify-center">
          <Image src="/images/img_group_white_a700.svg" alt="Attendance" width={32} height={32} />
        </div>
        <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Attendence</h3>
        <div className="space-y-2">
          <MetricItem value="24" label="Worker Present" />
          <MetricItem value="3" label="Worker Absect" />
          <MetricItem value="27" label="Total Worker in Projest" />
        </div>
      </div>

      <div
        onClick={() => handleClick("#progress")}
        className="bg-[#fff4de] rounded-metric p-6 relative cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
      >
        <div className="absolute top-6 left-6 w-[54px] h-[50px] rounded-full flex items-center justify-center">
          <Image src="/images/img_ellipse.svg" alt="Progress" width={54} height={50} />
          <Image
            src="/images/img_vector_gray_50_04.svg"
            alt="Progress Icon"
            width={26}
            height={26}
            className="absolute"
          />
        </div>
        <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Progress</h3>
        <div className="space-y-2">
          <MetricItem value="45%" label="Work Remaining" />
          <MetricItem value="55%" label="Work Done for Today" />
          <p className="text-xs font-medium text-[#4078ec]">+5% from yesterday</p>
        </div>
      </div>

      <div
        onClick={() => handleClick("#budget")}
        className="bg-[#dcfce7] rounded-metric p-6 relative cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
      >
        <div className="absolute top-6 left-6 w-[52px] h-[48px] bg-[#3cd856] rounded-full flex items-center justify-center">
          <Image src="/images/img_group_white_a700_28x31.svg" alt="Budget" width={31} height={28} />
        </div>
        <h3 className="text-2xl font-semibold text-[#151d48] mt-16 mb-4">Budget</h3>
        <div className="space-y-2">
          <MetricItem value="5.1 L" label="Total Spend" />
          <MetricItem value="50 L" label="Project Budget" />
          <p className="text-xs font-medium text-[#4078ec]">+11% From Budget Used</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;