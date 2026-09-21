// src/components/Taskbar.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TaskbarApp<Key extends string = string> {
  key: Key;
  name: string;
  icon: LucideIcon;
  color: string;
  active: boolean;
  minimized: boolean;
}

interface TaskbarProps<Key extends string> {
  apps: TaskbarApp<Key>[];
  onAppClick: (key: Key) => void;
}

const Taskbar = <Key extends string,>({ apps, onAppClick }: TaskbarProps<Key>) => {
  return (
    <nav
      aria-label="Open applications"
      className="absolute left-2 top-14 lg:left-4 lg:top-4 z-20 flex items-center gap-1 bg-gray-900/80 backdrop-blur-md rounded-lg text-white shadow-lg text-xs font-sans select-none border border-white/10"
      style={{ minHeight: '36px', padding: apps.length === 0 ? '3px 8px' : '3px' }}
    >
      {apps.length === 0 ? (
        <span className="text-white/40 text-xs tracking-wide">No open apps</span>
      ) : (
        apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.key}
              id={`taskbar-${app.key}`}
              type="button"
              onClick={() => onAppClick(app.key)}
              title={app.name}
              aria-label={`${app.minimized ? 'Restore' : 'Show'} ${app.name}`}
              aria-pressed={app.active}
              className={`relative flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-pointer group ${app.active ? 'bg-white/15' : ''}`}
            >
              <div className="relative">
                <Icon
                  size={16}
                  strokeWidth={0}
                  fill={app.color}
                  className="drop-shadow-sm"
                />
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  color="#ffffff"
                  fill="none"
                  className="absolute top-0 left-0"
                />
              </div>
              {/* Tooltip */}
              <span aria-hidden="true" className="pointer-events-none absolute top-full left-0 mt-2 whitespace-nowrap rounded-md bg-gray-900/90 border border-white/10 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">
                {app.name}
              </span>
            </button>
          );
        })
      )}
    </nav>
  );
};

export default Taskbar;
