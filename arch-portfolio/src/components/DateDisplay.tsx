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
  const dayNameShort = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
  const day = currentDate.getDate();
  const monthShort = currentDate.toLocaleDateString('en-US', { month: 'short' });
  const year = currentDate.getFullYear();

  const formattedDateFull = `${dayName}  ||  ${day} ${monthShort} ${year}`;
  const formattedDateShort = `${dayNameShort} ${day} ${monthShort} ${year}`;

  return (
    <div 
      className="flex items-center justify-center backdrop-blur-md px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg text-white shadow-lg text-[11px] sm:text-sm font-sans select-none border border-white/10 shrink-0"
    >
      <span className="whitespace-nowrap hidden sm:inline">{formattedDateFull}</span>
      <span className="whitespace-nowrap sm:hidden">{formattedDateShort}</span>
    </div>
  );
};

export default DateDisplay;
