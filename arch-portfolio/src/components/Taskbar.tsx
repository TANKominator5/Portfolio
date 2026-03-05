// src/components/Taskbar.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TaskbarApp {
  key: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

interface TaskbarProps {
  apps: TaskbarApp[];
  onAppClick: (key: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ apps, onAppClick }) => {
  if (apps.length === 0) return null;

  return (
    <div
      className="absolute bottom-4 right-4 z-50 flex items-center gap-2 backdrop-blur-md p-2 rounded-lg text-white shadow-lg text-sm font-sans select-none border border-white/10 transition-all duration-300"
    >
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <button
            key={app.key}
            onClick={() => onAppClick(app.key)}
            title={app.name}
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-pointer group"
          >
            <div className="relative">
              <Icon
                size={20}
                strokeWidth={0}
                fill={app.color}
                className="drop-shadow-sm"
              />
              <Icon
                size={20}
                strokeWidth={1.5}
                color="#ffffff"
                fill="none"
                className="absolute top-0 left-0"
              />
            </div>
            {/* Active indicator dot */}
            <span
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
              style={{ backgroundColor: app.color }}
            />
            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 border border-white/10 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Taskbar;
