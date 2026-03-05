// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { User, FileText, Folder, Mail, LucideIcon } from 'lucide-react';
import DesktopIcon from '@/components/DesktopIcon';
import SystemInfo from '@/components/SystemInfo';
import DateDisplay from '@/components/DateDisplay';
import Window from '@/components/Window';
import Taskbar, { TaskbarApp } from '@/components/Taskbar';

interface OpenWindowsState {
  aboutMe: boolean;
  resume: boolean;
  projects: boolean;
  contact: boolean;
}

const APP_META: Record<keyof OpenWindowsState, { name: string; icon: LucideIcon; color: string }> = {
  aboutMe:  { name: 'About Me',     icon: User,     color: '#60A5FA' },
  resume:   { name: 'My Resume',    icon: FileText, color: '#A78BFA' },
  projects: { name: 'My Projects',  icon: Folder,   color: '#FBBF24' },
  contact:  { name: 'Contact Me',   icon: Mail,     color: '#F87171' },
};

const Home: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<OpenWindowsState>({
    aboutMe: false,
    resume: false,
    projects: false,
    contact: false,
  });

  const handleOpen = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: true }));
  };

  const handleClose = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: false }));
  };

  // Build list of currently open apps for the taskbar
  const activeApps: TaskbarApp[] = (Object.keys(openWindows) as Array<keyof OpenWindowsState>)
    .filter((key) => openWindows[key])
    .map((key) => ({
      key,
      ...APP_META[key],
    }));

  const handleTaskbarClick = (key: string) => {
    // Toggle window: clicking an app in the taskbar closes it
    handleClose(key as keyof OpenWindowsState);
  };

  return (
    // IMPORTANT: 'relative' must be here for absolute positioning to work
    <main className="h-screen bg-desktop-wallpaper bg-cover bg-center text-white overflow-hidden relative">
      <SystemInfo />
      {/* Date Display Component */}
      <DateDisplay />

      <div className="grid grid-cols-4 sm:grid-cols-1 gap-1 sm:gap-4 p-4 pt-12 sm:p-8 sm:pt-8 sm:flex sm:flex-col sm:items-start">
        <div onDoubleClick={() => handleOpen('aboutMe')} onTouchEnd={() => handleOpen('aboutMe')}>
          <DesktopIcon icon={User} name="About Me" color="#60A5FA" />
        </div>
        <div onDoubleClick={() => handleOpen('resume')} onTouchEnd={() => handleOpen('resume')}>
          <DesktopIcon icon={FileText} name="My Resume" color="#A78BFA" />
        </div>
        <div onDoubleClick={() => handleOpen('projects')} onTouchEnd={() => handleOpen('projects')}>
          <DesktopIcon icon={Folder} name="My Projects" color="#FBBF24" />
        </div>
        <div onDoubleClick={() => handleOpen('contact')} onTouchEnd={() => handleOpen('contact')}>
          <DesktopIcon icon={Mail} name="Contact Me" color="#F87171" />
        </div>
      </div>

      {openWindows.aboutMe && (
        <Window title="About Me" onClose={() => handleClose('aboutMe')}>
          <p>This is the About Me window.</p>
        </Window>
      )}

      {openWindows.resume && (
        <Window title="My Resume" onClose={() => handleClose('resume')}>
          <p>This is where the resume information will go.</p>
        </Window>
      )}

      {openWindows.projects && (
        <Window title="My Projects" onClose={() => handleClose('projects')}>
          <p>Here are some of my projects.</p>
        </Window>
      )}

      {openWindows.contact && (
        <Window title="Contact Me" onClose={() => handleClose('contact')}>
          <p>You can contact me here.</p>
        </Window>
      )}

      {/* Taskbar: active app icons, bottom-right */}
      <Taskbar apps={activeApps} onAppClick={handleTaskbarClick} />
    </main>
  );
};

export default Home;
