'use client';

import React from 'react';
import Card from '@/components/common/Card';
import Image from 'next/image';

const EffectiveWorkChart: React.FC = () => {
  return (
    <Card className="p-6 h-[351px] overflow-hidden">
      <h3 className="text-xl font-semibold text-[#05004e] mb-6">Effective Work</h3>
      
      <div className="relative h-[200px] overflow-hidden">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between h-full">
          {[25, 20, 15, 10, 5, 0].map((v) => (
            <span key={v} className="text-xs text-[#7a91b0]">{v}k</span>
          ))}
        </div>

        {/* Chart bars */}
        <div className="ml-10 flex justify-between items-end h-full overflow-hidden">
          {[
            { day: 'Mon', height: 88 },
            { day: 'Tue', height: 108 },
            { day: 'Wed', height: 144 },
            { day: 'Thu', height: 100 },
            { day: 'Fri', height: 76 },
            { day: 'Sat', height: 106 },
            // { day: 'Sun', height: 134 },
          ].map(({ day, height }) => (
            <div key={day} className="flex flex-col items-center">
              <div className="flex items-end" style={{ height: '120px' }}>
                <Image src="/images/img_group_14.svg" alt={day} width={28} height={height} />
              </div>
              <span className="text-xs text-[#7a91b0] mt-2">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-8">
        <div className="flex items-center text-xs text-[#222b45]">
          <span className="mr-2">Effective Hours</span>
          <div className="w-[11px] h-[11px] rounded-full bg-[#0094ff]"></div>
        </div>
        <div className="flex items-center text-xs text-[#222b45]">
          <span className="mr-2">Working Hours</span>
          <div className="w-[10px] h-[11px] rounded-full bg-[#00e095]"></div>
        </div>
      </div>
    </Card>
  );
};

// const CustomerSatisfactionChart: React.FC = () => {
//   return (
//     <Card className="p-6 h-[351px] overflow-hidden">
//       <h3 className="text-xl font-semibold text-[#05004e] mb-4">Customer Satisfaction</h3>
//       <div className="relative h-[200px] mt-4 overflow-hidden">
//         <Image 
//           src="/images/img_group_17.png" 
//           alt="Customer Satisfaction Chart" 
//           width={398} 
//           height={167} 
//           className="absolute top-0 left-0 max-w-full"
//         />
//         <Image 
//           src="/images/img_group_16.png" 
//           alt="Overlay" 
//           width={396} 
//           height={93} 
//           className="absolute top-[72px] left-0 max-w-full"
//         />
//       </div>

//       <div className="flex justify-between mt-8 border-t pt-4">
//         <div className="flex flex-col">
//           <span className="text-sm text-[#96a5b8]">Last Month</span>
//           <div className="flex items-center">
//             <Image src="/images/img_group_18.svg" alt="Down" width={19} height={9} className="mr-2" />
//             <span className="text-sm font-medium text-[#222b45]">$3,004</span>
//           </div>
//         </div>

//         <div className="h-6 w-px bg-[#bcc9d3] mx-4 self-center"></div>

//         <div className="flex flex-col">
//           <span className="text-sm text-[#96a5b8]">This Month</span>
//           <div className="flex items-center">
//             <Image src="/images/img_group_18_copy.svg" alt="Up" width={19} height={9} className="mr-2" />
//             <span className="text-sm font-medium text-[#222b45]">$4,504</span>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// };

const CustomerSatisfactionChart: React.FC = () => {
  return (
    <Card className="p-6 h-[351px] overflow-hidden">
      <h3 className="text-xl font-semibold text-[#05004e] mb-4">Customer Satisfaction</h3>

      <div className="relative h-[200px] mt-2 overflow-hidden">
        <Image 
          src="/images/img_group_17.png" 
          alt="Customer Satisfaction Chart" 
          width={398} 
          height={167} 
          className="absolute top-0 left-0 max-w-full"
        />
        <Image 
          src="/images/img_group_16.png" 
          alt="Overlay" 
          width={396} 
          height={93} 
          className="absolute top-[72px] left-0 max-w-full"
        />
      </div>

      {/* Reduced top margin from mt-8 to mt-4 */}
      <div className="flex justify-between mt-0 border-t pt-4">
        <div className="flex flex-col">
          <span className="text-sm text-[#96a5b8]">Last Month</span>
          <div className="flex items-center">
            <Image src="/images/img_group_18.svg" alt="Down" width={19} height={9} className="mr-2" />
            <span className="text-sm font-medium text-[#222b45]">$3,004</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#bcc9d3] mx-4 self-center"></div>

        <div className="flex flex-col">
          <span className="text-sm text-[#96a5b8]">This Month</span>
          <div className="flex items-center">
            <Image src="/images/img_group_18_copy.svg" alt="Up" width={19} height={9} className="mr-2" />
            <span className="text-sm font-medium text-[#222b45]">$4,504</span>
          </div>
        </div>
      </div>
    </Card>
  );
};



const TargetVsRealityChart: React.FC = () => {
  return (
    <Card className="p-6 h-[351px] overflow-hidden">
      <h3 className="text-xl font-semibold text-[#05004e] mb-6">Target vs Reality</h3>
      <div className="relative h-[160px] mt-4 overflow-hidden">
        <div className="flex justify-between items-end h-full">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'].map((month, index) => (
            <div key={month} className="flex flex-col items-center">
              <Image
                src="/images/img_group_1000002782.svg"
                alt={month}
                width={36}
                height={index % 2 === 0 ? 116 : 92}
              />
              <span className="text-xs text-[#7a91b0] mt-2">{month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-[#27ae60] rounded-full flex items-center justify-center mr-4">
            <Image src="/images/img_avatar.svg" alt="Reality" width={20} height={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-[#151d48]">Reality Sales</h4>
            <p className="text-[10px] text-[#737791]">Achieved (In Green)</p>
          </div>
          <span className="text-sm font-medium text-[#27ae60]">8.823</span>
        </div>

        <div className="flex items-center">
          <div className="w-9 h-9 bg-[#ffa412] rounded-full flex items-center justify-center mr-4">
            <Image src="/images/img_avatar_orange_50_01.svg" alt="Target" width={20} height={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-[#151d48]">Target Sales</h4>
            <p className="text-[10px] text-[#737791]">Goal (In Yellow)</p>
          </div>
          <span className="text-sm font-medium text-[#ffa412]">12.122</span>
        </div>
      </div>
    </Card>
  );
};

const ChartsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      <EffectiveWorkChart />
      <CustomerSatisfactionChart />
      <TargetVsRealityChart />
    </div>
  );
};

export default ChartsSection;
