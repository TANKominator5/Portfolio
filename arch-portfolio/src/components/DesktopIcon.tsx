// components/DesktopIcon.tsx
import React from 'react';

interface DesktopIconProps {
  icon: string;
  name: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, name }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white w-24 h-24">
      <span className="text-4xl">{icon}</span>
      <span className="mt-2 text-sm">{name}</span>
    </div>
  );
};

export default DesktopIcon;