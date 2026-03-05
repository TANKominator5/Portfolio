// src/components/Window.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';

/* ───────────────────────── types ───────────────────────── */

interface WindowProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  children: React.ReactNode;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/* cursor for each resize direction */
const CURSOR_MAP: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
};

/* handle thickness in px */
const HANDLE = 6;

/* ───────────────────── resize handle positions ───────────────────── */

const handleStyles: Record<ResizeDirection, React.CSSProperties> = {
  n: { top: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: CURSOR_MAP.n },
  s: { bottom: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: CURSOR_MAP.s },
  e: { top: HANDLE, right: -HANDLE / 2, bottom: HANDLE, width: HANDLE, cursor: CURSOR_MAP.e },
  w: { top: HANDLE, left: -HANDLE / 2, bottom: HANDLE, width: HANDLE, cursor: CURSOR_MAP.w },
  nw: { top: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: CURSOR_MAP.nw },
  ne: { top: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: CURSOR_MAP.ne },
  sw: { bottom: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: CURSOR_MAP.sw },
  se: { bottom: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: CURSOR_MAP.se },
};

/* ───────────────────────── component ───────────────────────── */

const Window: React.FC<WindowProps> = ({
  title,
  onClose,
  onMinimize,
  onFocus,
  zIndex = 40,
  defaultWidth = 600,
  defaultHeight = 400,
  minWidth = 320,
  minHeight = 220,
  children,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [maximized, setMaximized] = useState(false);

  /* size state (only used when not maximized) */
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });

  /* Draggable position — we control it so we can reset on maximize */
  const [position, setPosition] = useState({ x: 0, y: 0 });

  /* remember pre-maximized position + size for restore */
  const preMax = useRef({ x: 0, y: 0, w: defaultWidth, h: defaultHeight });

  /* ref for listening to pointermove/pointerup on window during resize */
  const resizing = useRef<{
    dir: ResizeDirection;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const nodeRef = useRef<HTMLDivElement>(null!);

  /* ── mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── center the window on first mount (desktop only) ── */
  useEffect(() => {
    if (!isMobile) {
      const x = Math.max(0, Math.round((window.innerWidth - defaultWidth) / 2));
      const y = Math.max(0, Math.round((window.innerHeight - defaultHeight) / 2));
      setPosition({ x, y });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  /* ── resize handlers ── */
  const onResizeStart = useCallback(
    (dir: ResizeDirection, e: React.PointerEvent) => {
      if (maximized) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus?.();

      resizing.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startW: size.w,
        startH: size.h,
        startPosX: position.x,
        startPosY: position.y,
      };

      /* override cursor globally while resizing */
      document.body.style.cursor = CURSOR_MAP[dir];
      document.body.style.userSelect = 'none';
    },
    [maximized, size, position, onFocus],
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const r = resizing.current;
      if (!r) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;

      let newW = r.startW;
      let newH = r.startH;
      let newX = r.startPosX;
      let newY = r.startPosY;

      /* east */
      if (r.dir.includes('e')) newW = Math.max(minWidth, r.startW + dx);
      /* west */
      if (r.dir.includes('w')) {
        const deltaW = Math.min(dx, r.startW - minWidth);
        newW = r.startW - deltaW;
        newX = r.startPosX + deltaW;
      }
      /* south */
      if (r.dir.includes('s')) newH = Math.max(minHeight, r.startH + dy);
      /* north */
      if (r.dir === 'n' || r.dir === 'ne' || r.dir === 'nw') {
        const deltaH = Math.min(dy, r.startH - minHeight);
        newH = r.startH - deltaH;
        newY = r.startPosY + deltaH;
      }

      setSize({ w: newW, h: newH });
      setPosition({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      if (resizing.current) {
        resizing.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [minWidth, minHeight]);

  /* ── maximize / restore ── */
  const toggleMaximize = () => {
    if (maximized) {
      /* restore */
      setSize({ w: preMax.current.w, h: preMax.current.h });
      setPosition({ x: preMax.current.x, y: preMax.current.y });
      setMaximized(false);
    } else {
      /* save current state, then maximize */
      preMax.current = { x: position.x, y: position.y, w: size.w, h: size.h };
      setPosition({ x: 8, y: 8 });
      setSize({ w: window.innerWidth - 16, h: window.innerHeight - 16 });
      setMaximized(true);
    }
  };

  /* ══════════════════════ render ══════════════════════ */

  /* ── mobile: near-fullscreen, no drag / resize ── */
  if (isMobile) {
    return (
      <div
        className="absolute inset-3 top-10 bg-gray-900/90 backdrop-blur-lg shadow-2xl rounded-lg border border-gray-700 flex flex-col"
        style={{ zIndex }}
        onPointerDown={() => onFocus?.()}
      >
        <TitleBar
          title={title}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={toggleMaximize}
          maximized={maximized}
        />
        <div className="p-3 text-white text-sm overflow-auto flex-grow">{children}</div>
      </div>
    );
  }

  /* ── desktop: always wrapped in Draggable for stable tree ── */
  return (
    <Draggable
      handle=".window-title-bar"
      cancel=".window-controls"
      position={maximized ? { x: 0, y: 0 } : position}
      onDrag={(_e, data) => { if (!maximized) setPosition({ x: data.x, y: data.y }); }}
      disabled={maximized}
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
    >
      <div
        ref={nodeRef}
        className="absolute bg-gray-900/90 backdrop-blur-lg rounded-lg border border-gray-700 flex flex-col"
        style={{
          width: maximized ? 'calc(100vw - 16px)' : size.w,
          height: maximized ? 'calc(100vh - 16px)' : size.h,
          top: maximized ? 8 : 0,
          left: maximized ? 8 : 0,
          zIndex,
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
          transition: maximized ? 'width .2s ease, height .2s ease, top .2s ease, left .2s ease' : undefined,
        }}
        onPointerDown={() => onFocus?.()}
      >
        <TitleBar
          title={title}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={toggleMaximize}
          maximized={maximized}
        />

        {/* content */}
        <div className="p-4 text-white text-sm sm:text-base overflow-auto flex-grow">
          {children}
        </div>

        {/* resize handles (hidden when maximized) */}
        {!maximized &&
          (Object.keys(handleStyles) as ResizeDirection[]).map((dir) => (
            <div
              key={dir}
              style={{ position: 'absolute', zIndex: 1, ...handleStyles[dir] }}
              onPointerDown={(e) => onResizeStart(dir, e)}
            />
          ))}
      </div>
    </Draggable>
  );
};

/* ───────────────── title bar sub-component ───────────────── */

interface TitleBarProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize: () => void;
  maximized: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, onClose, onMinimize, onMaximize, maximized }) => (
  <div
    className="window-title-bar h-9 bg-gray-800/80 rounded-t-lg flex items-center justify-between px-3 cursor-move shrink-0 select-none border-b border-white/5"
    onDoubleClick={onMaximize}
  >
    {/* traffic-light buttons — .window-controls is excluded from Draggable via cancel prop */}
    <div className="window-controls flex items-center gap-2">
      <button
        onClick={onClose}
        className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:brightness-110 transition-all shadow-[0_0_6px_rgba(255,95,87,0.4)] group relative cursor-default"
        aria-label="Close window"
      >
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black/0 group-hover:text-black/60 transition-colors">✕</span>
      </button>
      {onMinimize && (
        <button
          onClick={onMinimize}
          className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:brightness-110 transition-all shadow-[0_0_6px_rgba(254,188,46,0.4)] group relative cursor-default"
          aria-label="Minimize window"
        >
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black/0 group-hover:text-black/60 transition-colors">−</span>
        </button>
      )}
      <button
        onClick={onMaximize}
        className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:brightness-110 transition-all shadow-[0_0_6px_rgba(40,200,64,0.4)] group relative cursor-default"
        aria-label={maximized ? 'Restore window' : 'Maximize window'}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black/0 group-hover:text-black/60 transition-colors">{maximized ? '⊖' : '⊕'}</span>
      </button>
    </div>

    {/* title — centered */}
    <span className="text-white/70 text-xs font-medium tracking-wide truncate absolute left-1/2 -translate-x-1/2 pointer-events-none">
      {title}
    </span>

    {/* spacer to balance flexbox */}
    <div className="w-16" />
  </div>
);

export default Window;
