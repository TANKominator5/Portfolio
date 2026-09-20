// src/components/SystemInfo.tsx
'use client';

import React, { useState, useEffect } from 'react';

// We create a more descriptive type for our battery's state
type BatteryStateInfo = {
  level: number | null;
  status: 'loading' | 'available' | 'unavailable';
};

const SystemInfo: React.FC = () => {
  const [time, setTime] = useState<Date | null>(null);
  // Initialize the battery state as 'loading'
  const [battery, setBattery] = useState<BatteryStateInfo>({
    level: null,
    status: 'loading',
  });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    let disposed = false;
    let removeBatteryListener: (() => void) | undefined;

    const getBatteryStatus = async () => {
      try {
        if (typeof navigator.getBattery !== 'function') {
          setBattery({ level: null, status: 'unavailable' });
          return;
        }

        const result = await navigator.getBattery();
        if (disposed) return;

        // Validate that we got a real BatteryManager (has a numeric `level` property)
        // Some environments return a Response or other unexpected object
        if (
          !result ||
          typeof result !== 'object' ||
          !Number.isFinite(result.level) ||
          result.level < 0 || result.level > 1 ||
          typeof result.addEventListener !== 'function' ||
          typeof result.removeEventListener !== 'function'
        ) {
          setBattery({ level: null, status: 'unavailable' });
          return;
        }

        const percentage = Math.round(result.level * 100);
        setBattery({ level: percentage, status: 'available' });

        const handleLevelChange = () => {
          if (Number.isFinite(result.level) && result.level >= 0 && result.level <= 1) {
            setBattery({ level: Math.round(result.level * 100), status: 'available' });
          } else {
            setBattery({ level: null, status: 'unavailable' });
          }
        };
        result.addEventListener('levelchange', handleLevelChange);
        removeBatteryListener = () => result.removeEventListener('levelchange', handleLevelChange);
      } catch {
        if (!disposed) setBattery({ level: null, status: 'unavailable' });
      }
    };

    getBatteryStatus();

    return () => {
      disposed = true;
      removeBatteryListener?.();
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time
    ? time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Return null on server-side or before first client render
  if (!time) return null;

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
        <span aria-label={battery.status === 'available' ? `Battery: ${batteryText}` : 'Battery information unavailable'}>🔋 {batteryText}</span>
      </>
    );
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-white shadow-lg text-[11px] sm:text-sm font-sans border border-white/10 shrink-0">
      <span>{formattedTime}</span>
      {renderBatteryInfo()}
    </div>
  );
};

export default SystemInfo;
