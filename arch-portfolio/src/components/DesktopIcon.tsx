// components/DesktopIcon.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DesktopIconProps {
  icon: LucideIcon;
  name: string;
  color?: string;
  filled?: boolean;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon: Icon, name, color = "#ffffff", filled = true }) => {
  return (
    <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 hover:bg-white/10 rounded-lg transition-colors cursor-pointer group">
      <div 
        className="transition-transform group-hover:scale-110 duration-200 relative"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      >
        {/* Filled background layer */}
        <Icon 
          size={36} 
          strokeWidth={0} 
          fill={color}
          className="drop-shadow-sm sm:hidden" 
        />
        <Icon 
          size={52} 
          strokeWidth={0} 
          fill={color}
          className="drop-shadow-sm hidden sm:block" 
        />
        {/* Stroke layer on top */}
        <Icon 
          size={36} 
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
      <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{name}</span>
    </div>
  );
};

export default DesktopIcon;
