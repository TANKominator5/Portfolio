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
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center px-4 py-2 rounded-lg bg-gray-800/60 backdrop-blur-md text-white shadow-lg border border-white/10 select-none"
      style={{ minWidth: '150px' }} // Ensure it has width
    >
      <span className="text-sm font-medium">{formattedDate}</span>
    </div>
  );
};

export default DateDisplay;