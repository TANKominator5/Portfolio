'use client';

import { useState } from 'react';
import { User, FileText, Folder, Mail } from 'lucide-react';
import DesktopIcon from '@/components/DesktopIcon';
import SystemInfo from '@/components/SystemInfo';
import DateDisplay from '@/components/DateDisplay';
import Window from '@/components/Window';
import Taskbar from '@/components/Taskbar';
import ResumeContent from '@/components/ResumeContent';
import { AboutContent, ContactContent, ProjectsContent } from '@/components/PortfolioContent';

const APPS = {
  aboutMe: { name: 'About Me', icon: User, color: '#60A5FA', width: 600, height: 400, content: AboutContent },
  resume: { name: 'My Resume', icon: FileText, color: '#A78BFA', width: 800, height: 600, content: ResumeContent },
  projects: { name: 'My Projects', icon: Folder, color: '#FBBF24', width: 700, height: 480, content: ProjectsContent },
  contact: { name: 'Contact Me', icon: Mail, color: '#F87171', width: 500, height: 360, content: ContactContent },
};

type AppKey = keyof typeof APPS;
const appKeys = Object.keys(APPS) as AppKey[];
interface OpenApp { key: AppKey; minimized: boolean }

export default function Home() {
  // Ordered back to front; keeping minimized windows mounted preserves their state.
  const [windows, setWindows] = useState<OpenApp[]>([]);
  const activeKey = windows.filter((app) => !app.minimized).at(-1)?.key;

  const bringToFront = (key: AppKey) => {
    setWindows((previous) => [...previous.filter((app) => app.key !== key), { key, minimized: false }]);
  };

  const openApp = (key: AppKey) => {
    bringToFront(key);
    // An already-active window still needs keyboard focus when launched again.
    document.getElementById(`window-${key}`)?.focus({ preventScroll: true });
  };

  const closeApp = (key: AppKey) => {
    setWindows((previous) => previous.filter((app) => app.key !== key));
    document.getElementById(`desktop-${key}`)?.focus();
  };

  const minimizeApp = (key: AppKey) => {
    setWindows((previous) => previous.map((app) => app.key === key ? { ...app, minimized: true } : app));
    document.getElementById(`taskbar-${key}`)?.focus();
  };

  return (
    <main className="h-dvh min-h-64 bg-desktop-wallpaper bg-cover bg-center text-white overflow-hidden relative isolate">
      <h1 className="sr-only">Debajit Pal — Portfolio</h1>
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-2 px-2 py-2 sm:px-4 sm:py-3">
        <div className="hidden sm:block flex-1" />
        <DateDisplay />
        <div className="sm:flex-1 flex justify-end"><SystemInfo /></div>
      </header>

      <nav aria-label="Desktop applications" className="absolute inset-x-0 top-14 bottom-20 overflow-auto">
        <div className="grid grid-cols-2 gap-2 p-4 sm:flex sm:flex-col sm:gap-4 sm:px-8 sm:items-start">
          {appKeys.map((key) => <DesktopIcon key={key} id={`desktop-${key}`} {...APPS[key]} onOpen={() => openApp(key)} />)}
        </div>
      </nav>

      <div className="absolute inset-x-2 top-14 bottom-20 z-10 isolate pointer-events-none">
        {appKeys.filter((key) => windows.some((app) => app.key === key)).map((key) => {
          const index = windows.findIndex((app) => app.key === key);
          const { minimized } = windows[index];
          const app = APPS[key];
          const Content = app.content;
          return (
            <Window key={key} id={`window-${key}`} title={app.name} onClose={() => closeApp(key)} onMinimize={() => minimizeApp(key)}
              icon={app.icon} accentColor={app.color}
              onFocus={() => bringToFront(key)} active={activeKey === key} minimized={minimized} zIndex={index + 1}
              defaultWidth={app.width} defaultHeight={app.height} unpadded={key === 'resume'}>
              <Content />
            </Window>
          );
        })}
      </div>

      <Taskbar apps={appKeys.filter((key) => windows.some((app) => app.key === key)).map((key) => ({
        key, ...APPS[key], active: activeKey === key, minimized: windows.find((app) => app.key === key)!.minimized,
      }))} onAppClick={openApp} />
    </main>
  );
}
