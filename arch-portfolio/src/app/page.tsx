// src/app/page.tsx
'use client'; // This is important for using state and event handlers

import React, { useState } from 'react';
import DesktopIcon from '@/components/DesktopIcon';
import SystemInfo from '@/components/SystemInfo';
import Window from '@/components/Window';

// Define an interface for our window state
interface OpenWindowsState {
  aboutMe: boolean;
  resume: boolean;
  projects: boolean;
  contact: boolean;
}

const Home: React.FC = () => {
  // State to track which windows are open
  const [openWindows, setOpenWindows] = useState<OpenWindowsState>({
    aboutMe: false,
    resume: false,
    projects: false,
    contact: false,
  });

  // Function to open a window
  const handleOpen = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: true }));
  };

  // Function to close a window
  const handleClose = (windowName: keyof OpenWindowsState) => {
    setOpenWindows((prev) => ({ ...prev, [windowName]: false }));
  };

  return (
    <main className="h-screen bg-desktop-wallpaper bg-cover bg-center text-white overflow-hidden">
      <SystemInfo />

      {/* Desktop Icons */}
      <div className="flex flex-col items-start p-8 space-y-4">
        <div onDoubleClick={() => handleOpen('aboutMe')}>
          <DesktopIcon icon="👤" name="About Me" />
        </div>
        <div onDoubleClick={() => handleOpen('resume')}>
          <DesktopIcon icon="📄" name="My Resume" />
        </div>
        <div onDoubleClick={() => handleOpen('projects')}>
          <DesktopIcon icon="📁" name="My Projects" />
        </div>
        <div onDoubleClick={() => handleOpen('contact')}>
          <DesktopIcon icon="📧" name="Contact Me" />
        </div>
      </div>

      {/* Render Windows if they are open */}
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
    </main>
  );
};

export default Home;