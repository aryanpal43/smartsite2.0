// 'use client';

// import React from 'react';
// import Image from 'next/image';

// const HelmetStatusChart: React.FC = () => {
//   // Percentages
//   const active = 50.0;
//   const inactive = 35.0;
//   const issue = 15.0;

//   const CIRCUMFERENCE = 2 * Math.PI * 13.9155; // ≈ 87.45

//   const percentToStroke = (percent: number) => (percent / 100) * CIRCUMFERENCE;

//   const activeLength = percentToStroke(active);
//   const inactiveLength = percentToStroke(inactive);
//   const issueLength = percentToStroke(issue);

//   const handleClick = () => {
//     // Replace this URL with your desired link
//     window.location.href = "#helmet-status-details";
//   };

//   return (
//     <div
//       onClick={handleClick}
//       className="flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
//       role="button"
//       tabIndex={0}
//       onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
//       aria-label="Helmet status chart"
//     >
//       <div className="relative w-[300px] h-[300px]">
//         <svg width="300" height="300" viewBox="0 0 42 42" className="transform -rotate-90">
//           {/* Background ring */}
//           <circle
//             cx="21"
//             cy="21"
//             r="13.9155"
//             fill="none"
//             stroke="#ece8ff"
//             strokeWidth="10"
//           />

//           {/* Active */}
//           <circle
//             cx="21"
//             cy="21"
//             r="13.9155"
//             fill="none"
//             stroke="#5d45db"
//             strokeWidth="10"
//             strokeDasharray={`${activeLength} ${CIRCUMFERENCE - activeLength}`}
//             strokeDashoffset="0"
//           />

//           {/* Inactive */}
//           <circle
//             cx="21"
//             cy="21"
//             r="13.9155"
//             fill="none"
//             stroke="#a698eb"
//             strokeWidth="10"
//             strokeDasharray={`${inactiveLength} ${CIRCUMFERENCE - inactiveLength}`}
//             strokeDashoffset={`-${activeLength}`}
//           />

//           {/* Issue */}
//           <circle
//             cx="21"
//             cy="21"
//             r="13.9155"
//             fill="none"
//             stroke="#7a65e2"
//             strokeWidth="10"
//             strokeDasharray={`${issueLength} ${CIRCUMFERENCE - issueLength}`}
//             strokeDashoffset={`-${activeLength + inactiveLength}`}
//           />
//         </svg>

//         {/* Center Helmet Icon */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//           <Image src="/images/img_vector.svg" alt="Helmet" width={60} height={50} />
//         </div>

//         {/* Labels */}
//         <div className="absolute top-[30px] left-[95px] text-center">
//           <p className="text-[15px] text-[#ece8ff] font-semibold">Issue</p>
//           <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
//             {issue}%
//           </div>
//         </div>

//         <div className="absolute top-[120px] left-[225px] text-center">
//           <p className="text-[15px] text-[#ece8ff] font-semibold">Active</p>
//           <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
//             {active}%
//           </div>
//         </div>

//         <div className="absolute top-[125px] left-[30px] text-center">
//           <p className="text-[15px] text-[#ece8ff] font-semibold">Inactive</p>
//           <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
//             {inactive}%
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HelmetStatusChart;


'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HelmetStatusChart: React.FC = () => {
  const router = useRouter();

  const active = 50.0;
  const inactive = 35.0;
  const issue = 15.0;
  const CIRCUMFERENCE = 2 * Math.PI * 13.9155;

  const percentToStroke = (percent: number) => (percent / 100) * CIRCUMFERENCE;

  const activeLength = percentToStroke(active);
  const inactiveLength = percentToStroke(inactive);
  const issueLength = percentToStroke(issue);

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-[300px] h-[300px]">
        <svg width="300" height="300" viewBox="0 0 42 42" className="transform -rotate-90">
          <circle cx="21" cy="21" r="13.9155" fill="none" stroke="#ece8ff" strokeWidth="10" />
          <circle cx="21" cy="21" r="13.9155" fill="none" stroke="#5d45db" strokeWidth="10"
            strokeDasharray={`${activeLength} ${CIRCUMFERENCE - activeLength}`} strokeDashoffset="0" />
          <circle cx="21" cy="21" r="13.9155" fill="none" stroke="#a698eb" strokeWidth="10"
            strokeDasharray={`${inactiveLength} ${CIRCUMFERENCE - inactiveLength}`}
            strokeDashoffset={`-${activeLength}`} />
          <circle cx="21" cy="21" r="13.9155" fill="none" stroke="#7a65e2" strokeWidth="10"
            strokeDasharray={`${issueLength} ${CIRCUMFERENCE - issueLength}`}
            strokeDashoffset={`-${activeLength + inactiveLength}`} />
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image src="/images/img_vector.svg" alt="Helmet" width={60} height={50} />
        </div>

        {/* Clickable + hover label: Issue */}
        <div
          onClick={() => router.push('/helmet')}
          className="absolute top-[30px] left-[95px] text-center cursor-pointer transition-transform hover:-translate-y-2"
        >
          <p className="text-[15px] text-[#ece8ff] font-semibold">Issue</p>
          <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
            {issue}%
          </div>
        </div>

        {/* Active */}
        <div
          onClick={() => router.push('/helmet')}
          className="absolute top-[120px] left-[225px] text-center cursor-pointer transition-transform hover:-translate-y-2"
        >
          <p className="text-[15px] text-[#ece8ff] font-semibold">Active</p>
          <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
            {active}%
          </div>
        </div>

        {/* Inactive */}
        <div
          onClick={() => router.push('/helmet')}
          className="absolute top-[125px] left-[30px] text-center cursor-pointer transition-transform hover:-translate-y-2"
        >
          <p className="text-[15px] text-[#ece8ff] font-semibold">Inactive</p>
          <div className="bg-[#ece8ff] text-[#5d45db] px-2 py-1 rounded mt-1 text-[13px]">
            {inactive}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelmetStatusChart;

