// src/components/SystemInfo.tsx
'use client';

import React, { useState, useEffect } from 'react';

// We create a more descriptive type for our battery's state
type BatteryStateInfo = {
  level: number | null;
  status: 'loading' | 'available' | 'unavailable';
};

const SystemInfo: React.FC = () => {
  const [time, setTime] = useState(new Date());
  // Initialize the battery state as 'loading'
  const [battery, setBattery] = useState<BatteryStateInfo>({
    level: null,
    status: 'loading',
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const getBatteryStatus = async () => {
      try {
        // Check if getBattery exists in navigator
        if (!('getBattery' in navigator)) {
          console.log('Battery API not supported in this browser');
          setBattery({ level: null, status: 'unavailable' });
          return;
        }

        // Get the battery manager
        const batteryManager = await navigator.getBattery();
        
        // Check if we got a Response object (which means something is wrong)
        if (batteryManager instanceof Response) {
          console.error('getBattery() returned a Response object instead of BatteryManager');
          console.log('This might be caused by a browser extension or service worker');
          setBattery({ level: null, status: 'unavailable' });
          return;
        }

        // Check if batteryManager has the expected properties
        if (!batteryManager || typeof batteryManager !== 'object') {
          console.error('Invalid battery manager object');
          setBattery({ level: null, status: 'unavailable' });
          return;
        }

        console.log('Battery Manager received:', batteryManager);
        console.log('All properties:', Object.getOwnPropertyNames(batteryManager));
        console.log('Prototype properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(batteryManager)));
        
        // Try to access the level property
        const level = batteryManager.level;
        console.log('Battery level:', level, 'Type:', typeof level);

        // Validate and set battery level
        if (typeof level === 'number' && !isNaN(level) && level >= 0 && level <= 1) {
          const percentage = Math.round(level * 100);
          console.log('✅ Successfully set battery to:', percentage + '%');
          setBattery({
            level: percentage,
            status: 'available',
          });
          
          // Add event listeners for battery changes
          batteryManager.addEventListener('levelchange', () => {
            const newLevel = batteryManager.level;
            if (typeof newLevel === 'number' && !isNaN(newLevel)) {
              setBattery({
                level: Math.round(newLevel * 100),
                status: 'available',
              });
            }
          });
        } else {
          console.error('❌ Battery level is invalid:', level);
          setBattery({ level: null, status: 'unavailable' });
        }

      } catch (error) {
        console.error('❌ Error getting battery status:', error);
        setBattery({ level: null, status: 'unavailable' });
      }
    };

    getBatteryStatus();

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // This helper function decides what to display based on the battery status
  const renderBatteryInfo = () => {
    // Don't show anything while we are still checking
    if (battery.status === 'loading') {
      return null;
    }

    // If available, show the percentage. Otherwise, show "N/A".
    const batteryText = battery.status === 'available' ? `${battery.level}%` : 'N/A';

    return (
      <>
        <span className="text-gray-500">|</span>
        <span>🔋 {batteryText}</span>
      </>
    );
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 backdrop-blur-md p-2 rounded-lg text-white shadow-lg text-sm font-sans">
      <span>{formattedTime}</span>
      {renderBatteryInfo()}
    </div>
  );
};

export default SystemInfo;