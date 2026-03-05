// src/app/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { User, FileText, Folder, Mail, LucideIcon } from 'lucide-react';
import DesktopIcon from '@/components/DesktopIcon';
import SystemInfo from '@/components/SystemInfo';
import DateDisplay from '@/components/DateDisplay';
import Window from '@/components/Window';
import Taskbar, { TaskbarApp } from '@/components/Taskbar';
import ResumeContent from '@/components/ResumeContent';

interface OpenWindowsState {
  aboutMe: boolean;
  resume: boolean;
  projects: boolean;
  contact: boolean;
}

const APP_META: Record<keyof OpenWindowsState, { name: string; icon: LucideIcon; color: string }> = {
  aboutMe: { name: 'About Me', icon: User, color: '#60A5FA' },
  resume: { name: 'My Resume', icon: FileText, color: '#A78BFA' },
  projects: { name: 'My Projects', icon: Folder, color: '#FBBF24' },
  contact: { name: 'Contact Me', icon: Mail, color: '#F87171' },
};

const Home: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<OpenWindowsState>({
    aboutMe: false,
    resume: false,
    projects: false,
    contact: false,
  });

  /* ── minimized tracking (window is still "open" but hidden) ── */
  const [minimizedWindows, setMinimizedWindows] = useState<OpenWindowsState>({
    aboutMe: false,
    resume: false,
    projects: false,
    contact: false,
  });

  /* ── focus / z-index management ── */
  const zCounter = useRef(40); // starting z-index
  const [windowZ, setWindowZ] = useState<Record<keyof OpenWindowsState, number>>({
    aboutMe: 40,
    resume: 40,
    projects: 40,
    contact: 40,
  });

  const bringToFront = (key: keyof OpenWindowsState) => {
    zCounter.current += 1;
    setWindowZ((prev) => ({ ...prev, [key]: zCounter.current }));
  };

  const handleOpen = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: true }));
    setMinimizedWindows((prev) => ({ ...prev, [windowName]: false }));
    bringToFront(windowName);
  };

  const handleClose = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: false }));
    setMinimizedWindows((prev) => ({ ...prev, [windowName]: false }));
  };

  const handleMinimize = (windowName: keyof OpenWindowsState) => {
    setMinimizedWindows((prev) => ({ ...prev, [windowName]: true }));
  };

  // Build list of currently open apps for the taskbar
  const activeApps: TaskbarApp[] = (Object.keys(openWindows) as Array<keyof OpenWindowsState>)
    .filter((key) => openWindows[key])
    .map((key) => ({
      key,
      ...APP_META[key],
    }));

  const handleTaskbarClick = (key: string) => {
    const k = key as keyof OpenWindowsState;
    if (minimizedWindows[k]) {
      // restore from minimized
      setMinimizedWindows((prev) => ({ ...prev, [k]: false }));
      bringToFront(k);
    } else {
      // already visible — bring to front
      bringToFront(k);
    }
  };

  return (
    <main className="h-screen bg-desktop-wallpaper bg-cover bg-center text-white overflow-hidden relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex-1" />
        <DateDisplay />
        <div className="flex-1 flex justify-end">
          <SystemInfo />
        </div>
      </div>

      {/* Desktop icons */}
      <div className="grid grid-cols-2 gap-2 p-4 pt-14 sm:grid-cols-1 sm:gap-4 sm:p-8 sm:pt-16 sm:flex sm:flex-col sm:items-start">
        <div onDoubleClick={() => handleOpen('aboutMe')} onTouchEnd={(e) => { e.preventDefault(); handleOpen('aboutMe'); }}>
          <DesktopIcon icon={User} name="About Me" color="#60A5FA" />
        </div>
        <div onDoubleClick={() => handleOpen('resume')} onTouchEnd={(e) => { e.preventDefault(); handleOpen('resume'); }}>
          <DesktopIcon icon={FileText} name="My Resume" color="#A78BFA" />
        </div>
        <div onDoubleClick={() => handleOpen('projects')} onTouchEnd={(e) => { e.preventDefault(); handleOpen('projects'); }}>
          <DesktopIcon icon={Folder} name="My Projects" color="#FBBF24" />
        </div>
        <div onDoubleClick={() => handleOpen('contact')} onTouchEnd={(e) => { e.preventDefault(); handleOpen('contact'); }}>
          <DesktopIcon icon={Mail} name="Contact Me" color="#F87171" />
        </div>
      </div>

      {/* ── App Windows ── */}
      {openWindows.aboutMe && !minimizedWindows.aboutMe && (
        <Window
          title="About Me"
          onClose={() => handleClose('aboutMe')}
          onMinimize={() => handleMinimize('aboutMe')}
          onFocus={() => bringToFront('aboutMe')}
          zIndex={windowZ.aboutMe}
        >
          <p>This is the About Me window.</p>
        </Window>
      )}

      {openWindows.resume && !minimizedWindows.resume && (
        <Window
          title="My Resume"
          onClose={() => handleClose('resume')}
          onMinimize={() => handleMinimize('resume')}
          onFocus={() => bringToFront('resume')}
          zIndex={windowZ.resume}
          defaultWidth={800}
          defaultHeight={600}
        >
          <div className="-m-4 h-[calc(100%+2rem)]"><ResumeContent /></div>
        </Window>
      )}

      {openWindows.projects && !minimizedWindows.projects && (
        <Window
          title="My Projects"
          onClose={() => handleClose('projects')}
          onMinimize={() => handleMinimize('projects')}
          onFocus={() => bringToFront('projects')}
          zIndex={windowZ.projects}
          defaultWidth={700}
          defaultHeight={480}
        >
          <p>Here are some of my projects.</p>
        </Window>
      )}

      {openWindows.contact && !minimizedWindows.contact && (
        <Window
          title="Contact Me"
          onClose={() => handleClose('contact')}
          onMinimize={() => handleMinimize('contact')}
          onFocus={() => bringToFront('contact')}
          zIndex={windowZ.contact}
          defaultWidth={500}
          defaultHeight={360}
        >
          <p>You can contact me here.</p>
        </Window>
      )}

      {/* Taskbar */}
      <Taskbar apps={activeApps} onAppClick={handleTaskbarClick} />
    </main>
  );
};

export default Home;
