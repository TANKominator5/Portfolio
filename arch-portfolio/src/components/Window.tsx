// src/components/Window.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

interface WindowProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ title, onClose, children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const windowContent = (
    <div
      className={
        isMobile
          ? 'absolute inset-3 top-10 bg-gray-900/90 backdrop-blur-lg shadow-2xl rounded-lg border border-gray-700 flex flex-col z-40'
          : 'absolute top-1/4 left-1/4 w-1/2 h-1/2 min-w-[300px] min-h-[200px] bg-gray-900/90 backdrop-blur-lg shadow-2xl rounded-lg border border-gray-700 flex flex-col z-40'
      }
    >
      {/* Title Bar */}
      <div className="window-title-bar h-8 bg-gray-800 rounded-t-lg flex items-center justify-between px-2 cursor-move shrink-0">
        <span className="text-white text-sm font-semibold truncate">{title}</span>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
          aria-label="Close window"
        >
          X
        </button>
      </div>

      {/* Window Content */}
      <div className="p-3 sm:p-4 text-white text-sm sm:text-base overflow-auto flex-grow">
        {children}
      </div>
    </div>
  );

  // On mobile, skip Draggable (poor touch support) and render full-screen-ish window
  if (isMobile) {
    return windowContent;
  }

  return (
    <Draggable handle=".window-title-bar">
      {windowContent}
    </Draggable>
  );
};

export default Window;
