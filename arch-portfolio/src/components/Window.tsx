'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { fitWindow, resizeWindow, type ResizeDirection, type WindowGeometry } from './windowGeometry';

interface WindowProps {
  id: string;
  title: string;
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
  id, title, onClose, onMinimize, onFocus, active = false, minimized = false, zIndex = 1,
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
        className="absolute top-0 left-0 pointer-events-auto bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl flex-col"
        style={{ display: minimized ? 'none' : 'flex', width: fullscreen ? '100%' : geometry.w, height: fullscreen ? '100%' : geometry.h, zIndex }}
        onPointerDownCapture={() => { if (!active) onFocus?.(); }}
        onFocusCapture={() => { if (!active) onFocus?.(); }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <TitleBar title={title} titleId={titleId} onClose={onClose} onMinimize={onMinimize}
          onMaximize={isMobile ? undefined : () => setMaximized((previous) => !previous)} maximized={maximized} />
        <div tabIndex={0} aria-label={`${title} content`} className={`min-h-0 min-w-0 flex-1 text-white text-sm sm:text-base ${unpadded ? 'overflow-hidden' : 'overflow-auto p-3 sm:p-4'}`}>
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
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  maximized: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, titleId, onClose, onMinimize, onMaximize, maximized }) => (
  <div className={`window-title-bar relative h-10 bg-gray-800/80 rounded-t-lg flex items-center gap-2 px-2 shrink-0 select-none border-b border-white/5 ${onMaximize ? 'cursor-move' : ''}`}
    onDoubleClick={onMaximize}>
    <div className="window-controls flex items-center shrink-0" onDoubleClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} className="w-7 h-7 grid place-items-center rounded group" aria-label="Close window">
        <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] text-[10px] leading-[14px] text-black/70 group-hover:brightness-125">×</span>
      </button>
      {onMinimize && <button type="button" onClick={onMinimize} className="w-7 h-7 grid place-items-center rounded group" aria-label="Minimize window">
        <span className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] text-[10px] leading-[14px] text-black/70 group-hover:brightness-125">−</span>
      </button>}
      {onMaximize && <button type="button" onClick={onMaximize} className="w-7 h-7 grid place-items-center rounded group" aria-label={maximized ? 'Restore window' : 'Maximize window'}>
        <span className="w-3.5 h-3.5 rounded-full bg-[#28C840] text-[10px] leading-[14px] text-black/70 group-hover:brightness-125">{maximized ? '⊖' : '⊕'}</span>
      </button>}
    </div>
    <h2 id={titleId} className="min-w-0 flex-1 text-white/80 text-xs font-medium tracking-wide truncate text-center">{title}</h2>
    <div aria-hidden="true" className="w-7 sm:w-20 shrink-0" />
  </div>
);

export default Window;
