'use client';

import { useCallback, useEffect, useId, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Pause, Play, RotateCcw, RotateCw, ArrowLeftRight } from 'lucide-react';
import { BOARD_HEIGHT, BOARD_WIDTH, LOCK_DELAY, PIECE_COLORS, createGame, fallInterval, gameReducer, getGhostPiece, getPieceCells, isGrounded, type GameAction, type GameState, type PieceType } from '@/games/blockstack';
import styles from './BlockStack.module.css';

const BEST_SCORE_KEY = 'blockstack:best:v1';

export default function BlockStack({ active = true }: { active?: boolean }) {
  const [game, dispatch] = useReducer(gameReducer, undefined, () => createGame(1, 'ready'));
  const [best, setBest] = useState(0);
  const [environmentActive, setEnvironmentActive] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const playable = active && environmentActive;
  const running = game.status === 'playing' && playable;
  const grounded = isGrounded(game);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY));
      if (Number.isSafeInteger(saved) && saved > 0) setBest(saved);
    } catch { /* The game also works when browser storage is unavailable. */ }
  }, []);

  useEffect(() => {
    if (game.score <= best) return;
    setBest(game.score);
    try { window.localStorage.setItem(BEST_SCORE_KEY, String(game.score)); } catch { /* Keep the in-memory best. */ }
  }, [game.score, best]);

  useEffect(() => {
    const pause = () => {
      setEnvironmentActive(false);
      dispatch({ type: 'pause', reason: 'away' });
    };
    const focus = () => setEnvironmentActive(!document.hidden);
    const visibility = () => { if (document.hidden) pause(); else focus(); };
    visibility();
    window.addEventListener('blur', pause);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', pause);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (!playable) dispatch({ type: 'pause', reason: 'away' });
  }, [playable]);

  useEffect(() => {
    if (active) boardRef.current?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => dispatch({ type: 'gravity' }), fallInterval(game.level));
    return () => window.clearInterval(timer);
  }, [running, game.level, game.pieceId]);

  useEffect(() => {
    if (!running || !grounded) return;
    const timer = window.setTimeout(() => dispatch({ type: 'lock' }), LOCK_DELAY);
    return () => window.clearTimeout(timer);
  }, [running, grounded, game.pieceId, game.lockResets]);

  const focusBoard = () => boardRef.current?.focus({ preventScroll: true });
  const start = () => {
    if (!playable) return;
    dispatch({ type: 'start', seed: window.crypto.getRandomValues(new Uint32Array(1))[0] });
    focusBoard();
  };
  const togglePause = () => {
    if (!playable) return;
    dispatch(game.status === 'paused' ? { type: 'resume' } : { type: 'pause' });
    focusBoard();
  };
  const perform = (action: GameAction) => {
    if (!running) return;
    dispatch(action);
    focusBoard();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key !== 'Escape' && (event.target as HTMLElement).closest('button')) return;
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'a', 'd', 's', 'w', 'x', 'z', 'c', 'Shift', ' ', 'p', 'Escape', 'Enter', 'r'];
    if (!keys.includes(key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!playable) return;
    if (event.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowDown', 'a', 'd', 's'].includes(key)) return;
    if (key === 'r') { start(); return; }
    if (game.status === 'ready' || game.status === 'gameover') {
      if (key === 'Enter' || key === ' ') start();
      return;
    }
    if (key === 'p' || key === 'Escape' || (key === 'Enter' && game.status === 'paused')) {
      togglePause();
      return;
    }
    const actions: Record<string, GameAction> = {
      ArrowLeft: { type: 'move', direction: -1 }, a: { type: 'move', direction: -1 },
      ArrowRight: { type: 'move', direction: 1 }, d: { type: 'move', direction: 1 },
      ArrowDown: { type: 'softDrop' }, s: { type: 'softDrop' },
      ArrowUp: { type: 'rotate', direction: 1 }, w: { type: 'rotate', direction: 1 }, x: { type: 'rotate', direction: 1 },
      z: { type: 'rotate', direction: -1 }, c: { type: 'hold' }, Shift: { type: 'hold' }, ' ': { type: 'hardDrop' },
    };
    if (actions[key]) perform(actions[key]);
  };

  const status = game.status === 'ready' ? 'READY // press Enter to start'
    : game.status === 'gameover' ? 'STACK OVERFLOW // try another run'
      : game.status === 'paused' ? 'PAUSED // your stack is safe'
        : game.lastClear ? `${game.lastClear === 4 ? 'FOUR-LINE CLEAR' : `${game.lastClear} LINE${game.lastClear > 1 ? 'S' : ''} CLEARED`} // nice stack management`
          : 'RUNNING // stack, clear, repeat';

  return (
    <div className={styles.app} data-state={game.status} onKeyDown={onKeyDown}>
      <header className={styles.header}>
        <div><h3>BLOCKSTACK<span aria-hidden="true">_</span></h3><p>falling blocks / terminal edition</p></div>
        <div className={styles.headerActions}>
          <button type="button" onClick={togglePause} disabled={!playable || game.status === 'ready' || game.status === 'gameover'} aria-label={game.status === 'paused' ? 'Resume game' : 'Pause game'} title="Pause / resume (P)">
            {game.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button type="button" onClick={start} disabled={!playable || game.status === 'ready'} aria-label="Restart game" title="Restart (R)"><RotateCcw size={15} /></button>
        </div>
      </header>

      <dl className={styles.scoreboard}>
        {[['Score', game.score], ['Lines', game.lines], ['Level', game.level], ['Best', best]].map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd data-testid={`blockstack-${String(label).toLowerCase()}`}>{String(value).padStart(label === 'Score' || label === 'Best' ? 6 : 2, '0')}</dd></div>
        ))}
      </dl>

      <div className={styles.arena}>
        <aside className={styles.side}>
          <h4>HOLD</h4>
          <PiecePreview type={game.held} label={`Held piece: ${game.held ?? 'empty'}`} dimmed={!game.canHold} />
          <span className={styles.keyHint}>[ C ]</span>
          <div className={styles.sideNote}>10 × 20<br />7-BAG<br /><span>▧ ghost</span></div>
        </aside>

        <div ref={boardRef} className={styles.well} role="application" aria-label="BlockStack game board" aria-describedby={instructionsId} tabIndex={0} data-game-focus
          data-piece={game.piece.type} data-x={game.piece.x} data-y={game.piece.y} data-rotation={game.piece.rotation} data-locked={game.lockedPieces}
          onPointerDown={(event) => { if (!(event.target as HTMLElement).closest('button')) focusBoard(); }}>
          <BoardView game={game} />
          {game.status !== 'playing' && <div className={styles.overlay}>
            <span className={styles.overlayTag}>{game.status === 'ready' ? 'INSERT COFFEE' : game.status === 'paused' ? 'SESSION SUSPENDED' : 'STACK OVERFLOW'}</span>
            <h4>{game.status === 'ready' ? 'Ready to stack?' : game.status === 'paused' ? 'Paused' : 'Game over'}</h4>
            <p>{game.status === 'ready' ? 'Fill a row. Clear some space.' : game.status === 'paused' ? (game.pauseReason === 'away' ? 'Paused while you were away.' : 'Take a breath. The stack can wait.') : `${game.score.toLocaleString()} points. One more run?`}</p>
            <button type="button" disabled={!playable} onClick={game.status === 'paused' ? togglePause : start}>
              {game.status === 'ready' ? 'Start game' : game.status === 'paused' ? 'Continue game' : 'Play again'}
            </button>
            <span className={styles.keyHint}>[ Enter ]</span>
          </div>}
        </div>

        <aside className={styles.side}>
          <h4>NEXT</h4>
          {game.queue.slice(0, 3).map((type, index) => <PiecePreview key={index} type={type} label={`Next ${index + 1}: ${type}`} />)}
        </aside>
      </div>

      <p id={instructionsId} className={styles.instructions}>← → move · ↑ / X rotate · Z reverse · ↓ soft drop<br />Space hard drop · C hold · P / Esc pause · R restart</p>

      <div className={styles.controls} aria-label="Game controls">
        <RepeatControl label="Move left" disabled={!running} onAction={() => perform({ type: 'move', direction: -1 })}><ArrowLeft size={18} /></RepeatControl>
        <button type="button" aria-label="Rotate clockwise" title="Rotate clockwise" disabled={!running} onClick={() => perform({ type: 'rotate', direction: 1 })}><RotateCw size={18} /></button>
        <RepeatControl label="Move right" disabled={!running} onAction={() => perform({ type: 'move', direction: 1 })}><ArrowRight size={18} /></RepeatControl>
        <RepeatControl label="Soft drop" disabled={!running} onAction={() => perform({ type: 'softDrop' })}><ArrowDown size={18} /></RepeatControl>
        <button type="button" aria-label="Hard drop" title="Hard drop" disabled={!running} onClick={() => perform({ type: 'hardDrop' })}><ChevronsDown size={18} /></button>
        <button type="button" aria-label="Hold piece" title="Hold piece" disabled={!running || !game.canHold} onClick={() => perform({ type: 'hold' })}><ArrowLeftRight size={18} /></button>
      </div>
      <p className={styles.status} role="status">{status}</p>
    </div>
  );
}

function BoardView({ game }: { game: GameState }) {
  const visiblePiece = game.status === 'playing' || game.status === 'paused';
  const cells = new Set(visiblePiece ? getPieceCells(game.piece).map(({ x, y }) => y * BOARD_WIDTH + x) : []);
  const ghost = new Set(visiblePiece ? getPieceCells(getGhostPiece(game)).map(({ x, y }) => y * BOARD_WIDTH + x) : []);
  return <div className={styles.board} aria-hidden="true">
    {game.board.flatMap((row, y) => row.map((locked, x) => {
      const index = y * BOARD_WIDTH + x;
      const type = cells.has(index) ? game.piece.type : locked;
      const isGhost = !type && ghost.has(index);
      return <span key={index} data-cell={type ? (locked ? 'locked' : 'active') : isGhost ? 'ghost' : 'empty'}
        className={`${styles.cell} ${type ? styles.filled : isGhost ? styles.ghost : styles.empty}`}
        style={type ? { '--piece-color': PIECE_COLORS[type] } as CSSProperties : undefined}>{type ? '[]' : isGhost ? '░░' : '·'}</span>;
    }))}
    <span className="sr-only">{BOARD_HEIGHT} rows</span>
  </div>;
}

function PiecePreview({ type, label, dimmed = false }: { type: PieceType | null; label: string; dimmed?: boolean }) {
  const cells = type ? getPieceCells({ type, x: 0, y: 0, rotation: 0 }) : [];
  const minX = Math.min(...cells.map(({ x }) => x));
  const minY = Math.min(...cells.map(({ y }) => y));
  const width = type ? Math.max(...cells.map(({ x }) => x)) - minX + 1 : 0;
  const height = type ? Math.max(...cells.map(({ y }) => y)) - minY + 1 : 0;
  const occupied = new Set(cells.map(({ x, y }) => (y - minY + Math.floor((4 - height) / 2)) * 4 + x - minX + Math.floor((4 - width) / 2)));
  return <div className={`${styles.preview} ${dimmed ? styles.dimmed : ''}`} role="img" aria-label={label} style={type ? { color: PIECE_COLORS[type] } : undefined}>
    {Array.from({ length: 16 }, (_, index) => <span key={index} aria-hidden="true">{occupied.has(index) ? '[]' : ' '}</span>)}
  </div>;
}

function RepeatControl({ label, disabled, onAction, children }: { label: string; disabled: boolean; onAction: () => void; children: ReactNode }) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionRef = useRef(onAction);
  useEffect(() => { actionRef.current = onAction; }, [onAction]);
  const stop = useCallback(() => {
    if (delay.current) clearTimeout(delay.current);
    if (repeat.current) clearInterval(repeat.current);
    delay.current = null;
    repeat.current = null;
  }, []);
  useEffect(() => {
    if (disabled) stop();
    return stop;
  }, [disabled, stop]);
  return <button type="button" aria-label={label} title={label} disabled={disabled}
    onPointerDown={(event) => {
      if (event.button !== 0 || disabled) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      stop();
      onAction();
      delay.current = setTimeout(() => { repeat.current = setInterval(() => actionRef.current(), 70); }, 180);
    }}
    onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
    onClick={(event) => { if (event.detail === 0) onAction(); }}>{children}</button>;
}
