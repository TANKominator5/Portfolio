// src/components/Window.tsx
import React from 'react';
import Draggable from 'react-draggable';

interface WindowProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ title, onClose, children }) => {
  return (
    <Draggable handle=".window-title-bar">
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 min-w-[300px] min-h-[200px] bg-gray-900 bg-opacity-80 backdrop-blur-lg shadow-2xl rounded-lg border border-gray-700 flex flex-col">
        {/* Title Bar */}
        <div className="window-title-bar h-8 bg-gray-800 rounded-t-lg flex items-center justify-between px-2 cursor-move">
          <span className="text-white font-semibold">{title}</span>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
            aria-label="Close window"
          >
            X
          </button>
        </div>

        {/* Window Content */}
        <div className="p-4 text-white overflow-auto flex-grow">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default Window;