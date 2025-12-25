// src/components/DateDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';

const DateDisplay: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize date on mount
    setCurrentDate(new Date());
    
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Return null on server-side or before first client render
  if (!currentDate) return null;

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;

  const formattedDate = `${dayName} ${day}/${month}`;

  return (
    <div 
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 backdrop-blur-md p-2 rounded-lg text-white shadow-lg text-sm font-sans select-none border border-white/10"
      style={{ minWidth: '150px' }}
    >
      <span>{formattedDate}</span>
    </div>
  );
};

export default DateDisplay;