'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { User, FileText, Folder, Mail, SquareTerminal, Blocks, Camera } from 'lucide-react';
import DesktopIcon from '@/components/DesktopIcon';
import SystemInfo from '@/components/SystemInfo';
import DateDisplay from '@/components/DateDisplay';
import Taskbar from '@/components/Taskbar';

const loading = () => <p role="status" className="p-4 text-xs text-gray-400">Loading app…</p>;
const Window = dynamic(() => import('@/components/Window'));
const ResumeContent = dynamic(() => import('@/components/ResumeContent'), { loading });
const TerminalContent = dynamic(() => import('@/components/TerminalContent'), { loading });
const BlockStack = dynamic(() => import('@/components/BlockStack'), { loading });
const AsciiCam = dynamic(() => import('@/components/AsciiCam'), { loading });
const AboutContent = dynamic(() => import('@/components/PortfolioContent').then((module) => module.AboutContent), { loading });
const ContactContent = dynamic(() => import('@/components/PortfolioContent').then((module) => module.ContactContent), { loading });
const ProjectsContent = dynamic(() => import('@/components/PortfolioContent').then((module) => module.ProjectsContent), { loading });

const APPS = {
  aboutMe: { name: 'About Me', icon: User, color: '#60A5FA', width: 600, height: 400, content: AboutContent },
  resume: { name: 'My Resume', icon: FileText, color: '#A78BFA', width: 800, height: 600, content: ResumeContent },
  projects: { name: 'My Projects', icon: Folder, color: '#FBBF24', width: 700, height: 480, content: ProjectsContent },
  contact: { name: 'Contact Me', icon: Mail, color: '#F87171', width: 500, height: 360, content: ContactContent },
  terminal: { name: 'Terminal', icon: SquareTerminal, color: '#000000', width: 820, height: 560, content: TerminalContent },
  blockstack: { name: 'BlockStack', icon: Blocks, color: '#22D3EE', width: 330, height: 720, content: BlockStack },
  asciiCam: { name: 'ASCII-Cam', icon: Camera, color: '#86EFAC', width: 820, height: 620, content: AsciiCam },
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
    const windowElement = document.getElementById(`window-${key}`);
    (windowElement?.querySelector<HTMLElement>('[data-terminal-input], [data-game-focus]') ?? windowElement)?.focus({ preventScroll: true });
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
    <main className="h-dvh min-h-64 text-white overflow-hidden relative isolate">
      <Image src="/resumeWallpaper.png" alt="" fill sizes="100vw" priority className="-z-10 object-cover" />
      <h1 className="sr-only">Debajit Pal — Portfolio</h1>
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-2 px-2 py-2 sm:px-4 sm:py-3">
        <div className="hidden sm:block flex-1" />
        <DateDisplay />
        <div className="sm:flex-1 flex justify-end"><SystemInfo /></div>
      </header>

      <nav aria-label="Desktop applications" className="absolute inset-x-0 top-24 bottom-2 overflow-hidden lg:top-16">
        <div className="desktop-icons grid h-full grid-flow-col auto-cols-[80px] grid-rows-[repeat(auto-fill,80px)] content-start justify-start gap-4 p-4 sm:auto-cols-[96px] sm:grid-rows-[repeat(auto-fill,96px)] sm:px-8">
          {appKeys.map((key) => <DesktopIcon key={key} id={`desktop-${key}`} {...APPS[key]} onOpen={() => openApp(key)} />)}
        </div>
      </nav>

      <div className="absolute inset-x-2 top-24 bottom-2 z-10 isolate pointer-events-none lg:top-16">
        {appKeys.filter((key) => windows.some((app) => app.key === key)).map((key) => {
          const index = windows.findIndex((app) => app.key === key);
          const { minimized } = windows[index];
          const app = APPS[key];
          const Content = app.content;
          return (
            <Window key={key} id={`window-${key}`} title={app.name} onClose={() => closeApp(key)} onMinimize={() => minimizeApp(key)}
              icon={app.icon} accentColor={key === 'terminal' ? '#C084FC' : app.color}
              onFocus={() => bringToFront(key)} active={activeKey === key} minimized={minimized} zIndex={index + 1}
              defaultWidth={app.width} defaultHeight={app.height} minWidth={key === 'blockstack' ? 320 : undefined} minHeight={key === 'blockstack' ? 500 : undefined}
              maximizedWidth={key === 'blockstack' ? app.width : undefined}
              lockAspectRatio={key === 'blockstack'}
              unpadded={key === 'resume' || key === 'terminal' || key === 'blockstack' || key === 'asciiCam'}>
              {key === 'terminal' ? <TerminalContent active={activeKey === key && !minimized} />
                : key === 'blockstack' ? <BlockStack active={activeKey === key && !minimized} />
                  : key === 'asciiCam' ? <AsciiCam visible={!minimized} /> : <Content />}
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
