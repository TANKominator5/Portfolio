'use client';

import { useEffect, useRef, useState } from 'react';
import type { TerminalEffect } from './terminalEasterEggs';

interface TerminalEffectsProps {
  effect: TerminalEffect;
  active: boolean;
  reducedMotion: boolean;
  onExit: () => void;
  onReboot: () => void;
}

const EFFECT_LABELS = {
  panic: 'Simulated kernel panic',
  matrix: 'Matrix rain',
  train: 'Steam locomotive',
};

export default function TerminalEffects({ effect, active, reducedMotion, onExit, onReboot }: TerminalEffectsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active) rootRef.current?.focus({ preventScroll: true });
  }, [active, effect]);

  const exit = effect === 'panic' ? onReboot : onExit;
  return (
    <div ref={rootRef} tabIndex={-1} role="region" aria-label={EFFECT_LABELS[effect]}
      className={`terminal-effect terminal-effect-${effect}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || (event.ctrlKey && event.key.toLowerCase() === 'c')) {
          event.preventDefault();
          event.stopPropagation();
          exit();
        }
      }}>
      {effect === 'panic' && <PanicScreen onComplete={onReboot} />}
      {effect === 'matrix' && <>
        <MatrixRain active={active} reducedMotion={reducedMotion} />
        <div className="terminal-effect-controls"><span>MATRIX // connected</span><button type="button" onClick={onExit}>Exit Matrix · Esc</button></div>
        <p className="terminal-matrix-caption">{reducedMotion ? 'The Matrix, paused for reduced motion.' : 'Follow the purple rabbit.'}<br />Esc / Ctrl+C to return</p>
      </>}
      {effect === 'train' && <Train reducedMotion={reducedMotion} onComplete={onExit} />}
      {effect !== 'matrix' && <div className="terminal-effect-controls">
        <span>{effect === 'train' ? 'sl ≠ ls // deadline express' : 'DebajitOS // recovery mode'}</span>
        <button type="button" onClick={exit}>{effect === 'train' ? 'Stop train · Esc' : 'Reboot now'}</button>
      </div>}
    </div>
  );
}

function PanicScreen({ onComplete }: { onComplete: () => void }) {
  const [rebooting, setRebooting] = useState(false);
  useEffect(() => {
    const phase = window.setTimeout(() => setRebooting(true), 900);
    // One deadline includes both the glitch and reboot; it does not reload the page.
    const finish = window.setTimeout(onComplete, 3000);
    return () => {
      window.clearTimeout(phase);
      window.clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className="terminal-panic-screen" data-phase={rebooting ? 'reboot' : 'panic'}>
      {!rebooting ? <div className="terminal-panic-glitch">
        <p className="terminal-panic-code">STOP CODE: 0xC0FFEE</p>
        <h3>KERNEL PANIC</h3>
        <p role="alert">not syncing: Attempted to delete the last brain cell.</p>
        <pre>{'CPU: 0  PID: 1  Comm: BTech_Student_v2026\nCall trace:\n  coffee() → deadline() → panic()\n\nProcrastination is a system dependency.\nInitiating emergency portfolio recovery...'}</pre>
      </div> : <div className="terminal-reboot-screen">
        <p className="terminal-panic-code">DEBAJITOS v1.0</p>
        <h3 role="status">Rebooting...</h3>
        <pre>{'[ OK ] Remounting portfolio\n[ OK ] Restoring projects and questionable jokes\n[ OK ] Brewing recovery coffee\n\nStarting BTech_Student_v2026...'}</pre>
        <div className="terminal-reboot-progress" aria-hidden="true"><span /></div>
        <p className="terminal-reboot-note">Your tabs survived. Your dignity is still loading.</p>
      </div>}
    </div>
  );
}

const MATRIX_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&{}[]<>/';

function MatrixRain({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const cell = 16;
    let width = 0;
    let height = 0;
    let drops: number[] = [];
    let frame = 0;
    let lastFrame = 0;
    const character = () => MATRIX_CHARACTERS[Math.floor(Math.random() * MATRIX_CHARACTERS.length)];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = bounds.width;
      height = bounds.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.font = '14px ui-monospace, monospace';
      context.fillStyle = '#020a04';
      context.fillRect(0, 0, width, height);
      drops = Array.from({ length: Math.ceil(width / cell) }, () => Math.random() * height / cell);
      // A complete still frame also makes reduced-motion mode useful.
      for (let column = 0; column < drops.length; column++) {
        for (let row = 0; row < Math.ceil(height / cell); row++) {
          context.fillStyle = `rgba(74, 222, 128, ${0.08 + Math.random() * 0.38})`;
          context.fillText(character(), column * cell, row * cell);
        }
      }
    };

    const draw = (now: number) => {
      if (now - lastFrame >= 50 && width && height) {
        context.fillStyle = 'rgba(2, 10, 4, 0.09)';
        context.fillRect(0, 0, width, height);
        drops.forEach((drop, column) => {
          context.fillStyle = column % 4 === 0 ? '#bcffcb' : '#4ade80';
          context.fillText(character(), column * cell, drop * cell);
          drops[column] = drop * cell > height && Math.random() > 0.96 ? -Math.random() * 10 : drop + 0.65;
        });
        lastFrame = now;
      }
      frame = requestAnimationFrame(draw);
    };

    const updatePlayback = () => {
      cancelAnimationFrame(frame);
      if (active && !reducedMotion && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize();
    updatePlayback();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', updatePlayback);
    };
  }, [active, reducedMotion]);

  return <canvas ref={canvasRef} className="terminal-matrix-canvas" aria-hidden="true" />;
}

const TRAIN = String.raw`      (  )  (   )  ( )
       ====       ________
   _D _|  |_______/        \__
    |(_)---  |   H\________/ |
    /     |  |   H  |  |    |
   |______|__|___H__|__|____|
    \_____/  (O)====(O)  (O)`;

function Train({ reducedMotion, onComplete }: { reducedMotion: boolean; onComplete: () => void }) {
  const duration = reducedMotion ? 1500 : 3600;
  useEffect(() => {
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);
  return <div className="terminal-train-track">
    <pre className={`terminal-train ${reducedMotion ? 'terminal-train-parked' : ''}`} style={{ animationDuration: `${duration}ms` }} role="img" aria-label="A tiny ASCII steam locomotive passing the prompt">{TRAIN}</pre>
  </div>;
}
