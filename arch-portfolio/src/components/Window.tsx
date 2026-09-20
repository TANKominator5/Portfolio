'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { AppWindow, type LucideIcon } from 'lucide-react';
import { fitWindow, resizeWindow, type ResizeDirection, type WindowGeometry } from './windowGeometry';

interface WindowProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  active?: boolean;
  minimized?: boolean;
  zIndex?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  unpadded?: boolean;
  children: React.ReactNode;
}

const HANDLE = 6;
const handleStyles: Record<ResizeDirection, React.CSSProperties> = {
  n: { top: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: 'ns-resize' },
  s: { bottom: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: 'ns-resize' },
  e: { top: HANDLE, right: -HANDLE / 2, bottom: HANDLE, width: HANDLE, cursor: 'ew-resize' },
  w: { top: HANDLE, left: -HANDLE / 2, bottom: HANDLE, width: HANDLE, cursor: 'ew-resize' },
  nw: { top: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nwse-resize' },
  ne: { top: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nesw-resize' },
  sw: { bottom: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nesw-resize' },
  se: { bottom: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nwse-resize' },
};

const Window: React.FC<WindowProps> = ({
  id, title, icon = AppWindow, accentColor = '#93c5fd', onClose, onMinimize, onFocus, active = false, minimized = false, zIndex = 1,
  defaultWidth = 600, defaultHeight = 400, minWidth = 320, minHeight = 220,
  unpadded = false, children,
}) => {
  const titleId = useId();
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [isMobile, setIsMobile] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [geometry, setGeometry] = useState<WindowGeometry>({ x: 0, y: 0, w: defaultWidth, h: defaultHeight });
  const bounds = useRef({ w: defaultWidth, h: defaultHeight });
  const resizing = useRef<{
    direction: ResizeDirection;
    pointerId: number;
    startX: number;
    startY: number;
    geometry: WindowGeometry;
    cursor: string;
    userSelect: string;
  } | null>(null);

  const stopResize = useCallback(() => {
    const resize = resizing.current;
    if (!resize) return;
    document.body.style.cursor = resize.cursor;
    document.body.style.userSelect = resize.userSelect;
    resizing.current = null;
  }, []);

  useLayoutEffect(() => {
    const workspace = nodeRef.current.parentElement;
    if (!workspace) return;
    let initial = true;
    const measure = () => {
      stopResize();
      bounds.current = { w: workspace.clientWidth, h: workspace.clientHeight };
      setIsMobile(window.innerWidth < 640);
      const center = initial;
      initial = false;
      setGeometry((previous) => fitWindow(center ? {
        ...previous,
        x: (bounds.current.w - previous.w) / 2,
        y: (bounds.current.h - previous.h) / 2,
      } : previous, bounds.current, minWidth, minHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [minWidth, minHeight, stopResize]);

  useEffect(() => {
    if (active && !minimized && !nodeRef.current.contains(document.activeElement)) {
      nodeRef.current.focus({ preventScroll: true });
    }
  }, [active, minimized]);

  useEffect(() => {
    if (minimized || maximized || isMobile) stopResize();
  }, [minimized, maximized, isMobile, stopResize]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const resize = resizing.current;
      if (!resize || event.pointerId !== resize.pointerId) return;
      setGeometry(resizeWindow(resize.geometry, resize.direction,
        event.clientX - resize.startX, event.clientY - resize.startY,
        bounds.current, minWidth, minHeight));
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId === resizing.current?.pointerId) stopResize();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', stopResize);
    return () => {
      stopResize();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', stopResize);
    };
  }, [minWidth, minHeight, stopResize]);

  const startResize = (direction: ResizeDirection, event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || resizing.current) return;
    event.preventDefault();
    event.stopPropagation();
    onFocus?.();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizing.current = {
      direction, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      geometry, cursor: document.body.style.cursor, userSelect: document.body.style.userSelect,
    };
    document.body.style.cursor = handleStyles[direction].cursor ?? '';
    document.body.style.userSelect = 'none';
  };

  const fullscreen = maximized || isMobile;
  return (
    <Draggable
      handle=".window-title-bar"
      cancel=".window-controls, .window-resize-handle"
      position={fullscreen ? { x: 0, y: 0 } : { x: geometry.x, y: geometry.y }}
      bounds="parent"
      onDrag={(_event, data) => setGeometry((previous) => fitWindow({ ...previous, x: data.x, y: data.y }, bounds.current, minWidth, minHeight))}
      disabled={fullscreen || minimized}
      nodeRef={nodeRef}
    >
      <div
        id={id}
        ref={nodeRef}
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        hidden={minimized}
        data-active={active}
        className="desktop-window absolute top-0 left-0 pointer-events-auto flex-col"
        style={{ '--window-accent': accentColor, display: minimized ? 'none' : 'flex', width: fullscreen ? '100%' : geometry.w, height: fullscreen ? '100%' : geometry.h, zIndex } as React.CSSProperties}
        onPointerDownCapture={() => { if (!active) onFocus?.(); }}
        onFocusCapture={() => { if (!active) onFocus?.(); }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <TitleBar title={title} titleId={titleId} icon={icon} onClose={onClose} onMinimize={onMinimize}
          onMaximize={isMobile ? undefined : () => setMaximized((previous) => !previous)} maximized={maximized} />
        <div tabIndex={0} aria-label={`${title} content`} className={`window-body min-h-0 min-w-0 flex-1 text-white text-sm sm:text-base ${unpadded ? 'overflow-hidden' : 'custom-scroll overflow-auto p-5 sm:p-6'}`}>
          {children}
        </div>
        {!fullscreen && (Object.keys(handleStyles) as ResizeDirection[]).map((direction) => (
          <div key={direction} aria-hidden="true" className="window-resize-handle touch-none"
            style={{ position: 'absolute', zIndex: 1, ...handleStyles[direction] }}
            onPointerDown={(event) => startResize(direction, event)} />
        ))}
      </div>
    </Draggable>
  );
};

interface TitleBarProps {
  title: string;
  titleId: string;
  icon: LucideIcon;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  maximized: boolean;
}

const controlPaths = {
  close: 'M4.5 4.5 9.5 9.5M9.5 4.5 4.5 9.5',
  minimize: 'M4 7H10',
  maximize: 'M4.5 4.5H9.5V9.5H4.5Z',
  restore: 'M5.5 4H10V8.5M4 5.5H8.5V10H4Z',
};

function ControlIcon({ action }: { action: keyof typeof controlPaths }) {
  return (
    // Draw the circle and mark together, centered at (7, 7), without nested SVG scaling.
    <svg className={`window-control-dot window-control-${action === 'restore' ? 'maximize' : action}`}
      width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="6.5" fill="currentColor" stroke="rgb(0 0 0 / 12%)" strokeWidth="0.5" />
      <path className="window-control-icon" d={controlPaths[action]} fill="none"
        stroke="rgb(0 0 0 / 72%)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TitleBar: React.FC<TitleBarProps> = ({ title, titleId, icon: Icon, onClose, onMinimize, onMaximize, maximized }) => (
  <div className={`window-title-bar relative shrink-0 select-none ${onMaximize ? 'cursor-move' : ''}`}
    onDoubleClick={onMaximize}>
    <div className="window-controls flex items-center justify-self-start" onDoubleClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} className="window-control" aria-label="Close window" title="Close">
        <ControlIcon action="close" />
      </button>
      {onMinimize && <button type="button" onClick={onMinimize} className="window-control" aria-label="Minimize window" title="Minimize">
        <ControlIcon action="minimize" />
      </button>}
      {onMaximize && <button type="button" onClick={onMaximize} className="window-control" aria-label={maximized ? 'Restore window' : 'Maximize window'} title={maximized ? 'Restore' : 'Maximize'}>
        <ControlIcon action={maximized ? 'restore' : 'maximize'} />
      </button>}
    </div>
    <div className="window-heading min-w-0 flex items-center justify-center gap-2 pointer-events-none">
      <Icon className="window-app-icon shrink-0" size={14} strokeWidth={1.7} aria-hidden="true" />
      <h2 id={titleId} className="truncate text-xs font-medium tracking-wide">{title}</h2>
    </div>
    <span aria-hidden="true" className="window-title-detail justify-self-end">Portfolio</span>
  </div>
);

export default Window;
