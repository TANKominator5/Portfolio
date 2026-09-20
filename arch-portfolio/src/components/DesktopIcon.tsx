// components/DesktopIcon.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DesktopIconProps {
  icon: LucideIcon;
  name: string;
  color?: string;
  filled?: boolean;
  onOpen: () => void;
  id: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon: Icon, name, color = "#ffffff", filled = true, onOpen, id }) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onOpen}
      aria-label={`Open ${name}`}
      className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 hover:bg-white/10 rounded-lg transition-colors cursor-pointer group"
    >
      <div 
        className="transition-transform group-hover:scale-110 duration-200 relative"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      >
        {/* Filled background layer */}
        <Icon 
          size={40} 
          strokeWidth={0} 
          fill={filled ? color : 'none'}
          className="drop-shadow-sm sm:hidden" 
        />
        <Icon 
          size={52} 
          strokeWidth={0} 
          fill={filled ? color : 'none'}
          className="drop-shadow-sm hidden sm:block" 
        />
        {/* Stroke layer on top */}
        <Icon 
          size={40} 
          strokeWidth={1.5} 
          color="#ffffff"
          fill="none"
          className="absolute top-0 left-0 sm:hidden" 
        />
        <Icon 
          size={52} 
          strokeWidth={1.5} 
          color="#ffffff"
          fill="none"
          className="absolute top-0 left-0 hidden sm:block" 
        />
      </div>
      <span className="mt-1 sm:mt-2 text-[11px] sm:text-sm font-medium text-center leading-tight tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{name}</span>
    </button>
  );
};

export default DesktopIcon;
