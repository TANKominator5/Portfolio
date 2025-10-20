// components/SystemInfo.tsx
'use client';

import React, { useState, useEffect } from 'react';

const SystemInfo: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const getBatteryStatus = async () => {
      try {
        if ('getBattery' in navigator) {
          const batteryManager = await (navigator as any).getBattery();
          setBattery(Math.round(batteryManager.level * 100));

          batteryManager.onlevelchange = () => {
            setBattery(Math.round(batteryManager.level * 100));
          };
        }
      } catch (error) {
        console.error('Error getting battery status:', error);
      }
    };

    getBatteryStatus();

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 rounded-lg text-white shadow-lg">
      <div className="text-lg font-semibold">{time.toLocaleTimeString()}</div>
      {battery !== null && <div className="text-sm">Battery: {battery}%</div>}
    </div>
  );
};

export default SystemInfo;