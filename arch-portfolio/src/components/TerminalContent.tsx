'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { profile } from '@/data/portfolio';
import { runTerminalCommand, terminalCommands, TERMINAL_BANNER, TERMINAL_PROMPT, type TerminalResult } from './terminalCommands';
import TerminalEffects from './TerminalEffects';
import type { TerminalEffect } from './terminalEasterEggs';

interface Entry {
  id: number;
  command: string;
  result: TerminalResult;
}

const BOOT_LINES = ['Initializing portfolio terminal...', 'Loading profile, projects, and commands...', 'Session ready. Welcome, visitor.'];
const WELCOME: Entry = { id: 0, command: 'welcome', result: runTerminalCommand('welcome') };

export default function TerminalContent({ active = true }: { active?: boolean }) {
  const [booting, setBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [skipThrough, setSkipThrough] = useState(-1);
  const [effect, setEffect] = useState<TerminalEffect | null>(null);
  const nextId = useRef(1);
  const draft = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const scrollToPrompt = useCallback(() => {
    const viewport = viewportRef.current;
    // Hidden windows have no layout; leave their saved scroll position intact.
    if (viewport && viewport.clientHeight > 0 && stickToBottom.current) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  const finishBoot = useCallback(() => {
    setBooting(false);
    setEntries([WELCOME]);
  }, []);

  const exitEffect = useCallback(() => setEffect(null), []);

  const rebootTerminal = useCallback(() => {
    const id = nextId.current++;
    setEffect(null);
    setBooting(false);
    setBootStep(0);
    setEntries([{ ...WELCOME, id, result: { ...WELCOME.result, text: `Reboot complete. All projects survived.\n\n${WELCOME.result.text}` } }]);
    setSkipThrough(id);
    setHistory([]);
    setHistoryIndex(null);
    setInput('');
    setCompletions([]);
    draft.current = '';
    stickToBottom.current = true;
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!booting) return;
    if (reducedMotion) {
      finishBoot();
      return;
    }
    const timer = window.setTimeout(() => {
      if (bootStep < BOOT_LINES.length - 1) setBootStep((step) => step + 1);
      else finishBoot();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [bootStep, booting, reducedMotion, finishBoot]);

  useEffect(() => {
    if (active && !booting && !effect) {
      inputRef.current?.focus({ preventScroll: true });
      scrollToPrompt();
    }
  }, [active, booting, effect, scrollToPrompt]);

  useEffect(() => { scrollToPrompt(); }, [entries, completions, scrollToPrompt]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(scrollToPrompt);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scrollToPrompt]);

  const appendEntry = (command: string, result: TerminalResult) => {
    const entry = { id: nextId.current++, command, result };
    stickToBottom.current = true;
    setEntries((previous) => [...previous.slice(-99), entry]);
  };

  const clearScreen = () => {
    setEntries([]);
    setCompletions([]);
    stickToBottom.current = true;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (booting || effect || !command) return;
    const result = runTerminalCommand(command);
    setHistory((previous) => [...previous.slice(-99), command]);
    setHistoryIndex(null);
    setCompletions([]);
    setInput('');
    draft.current = '';

    if (result.action === 'clear') clearScreen();
    else appendEntry(command, result);

    if (result.effect) setEffect(result.effect);

    // Keep browser actions in the submit gesture so popup/mail handlers can run.
    if (result.action === 'gui') window.open(window.location.origin, '_blank', 'noopener,noreferrer');
    if (result.action === 'email') window.location.href = `mailto:${profile.email}`;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      setInput('');
      setHistoryIndex(null);
      setCompletions([]);
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      clearScreen();
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection()?.toString()
      && inputRef.current?.selectionStart === inputRef.current?.selectionEnd) {
      event.preventDefault();
      setSkipThrough(nextId.current);
      appendEntry(`${input}^C`, { text: '' });
      setInput('');
      setHistoryIndex(null);
      setCompletions([]);
      return;
    }
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      if (historyIndex === null) draft.current = input;
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
      setCompletions([]);
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      const index = historyIndex + 1;
      setHistoryIndex(index < history.length ? index : null);
      setInput(index < history.length ? history[index] : draft.current);
      setCompletions([]);
    } else if (event.key === 'Tab' && !event.shiftKey && input.trim()) {
      const prefix = input.trim().toLowerCase();
      const matches = terminalCommands.map(([name]) => name).filter((name) => name.startsWith(prefix));
      // Exact/unmatched commands keep normal Tab navigation available.
      if (!matches.length || matches.some((name) => name === prefix)) return;
      event.preventDefault();
      if (matches.length === 1) {
        setInput(matches[0]);
        setCompletions([]);
      } else setCompletions(matches);
    }
  };

  return (
    <div className="terminal-app">
      <div className="terminal-session" inert={effect !== null} aria-hidden={effect ? true : undefined}>
        <div className="terminal-toolbar">
          <span>{profile.name.replaceAll(' ', '')}</span>
          <TerminalClock />
        </div>
        <div ref={viewportRef} className="terminal-viewport custom-scroll" tabIndex={0} aria-label="Terminal scrollback"
          onScroll={(event) => {
            const viewport = event.currentTarget;
            if (viewport.clientHeight > 0) stickToBottom.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48;
          }}
          onClick={(event) => {
            if (!(event.target as HTMLElement).closest('a, button, input') && !window.getSelection()?.toString()) {
              inputRef.current?.focus({ preventScroll: true });
            }
          }}>
          {booting ? (
            <div className="terminal-boot">
              <div role="status" aria-label="Starting terminal">
                {BOOT_LINES.slice(0, bootStep + 1).map((line) => <p key={line}><span className="terminal-prompt">[ OK ]</span> {line}</p>)}
                <span className="terminal-cursor" aria-hidden="true" />
              </div>
              <button type="button" className="terminal-skip" onClick={finishBoot}>Skip startup →</button>
            </div>
          ) : (
            <>
              <div role="log" aria-label="Terminal history" aria-live="polite" aria-relevant="additions">
                {entries.map((entry) => (
                  <div key={entry.id} className="terminal-entry" data-command={entry.command}>
                    <div className="terminal-command-line"><span className="terminal-prompt">{TERMINAL_PROMPT}</span><span className="terminal-echo">{entry.command}</span></div>
                    {entry.result.banner && <pre className="terminal-banner" role="img" aria-label={profile.name}>{TERMINAL_BANNER}</pre>}
                    <TypedResult result={entry.result} animate={!reducedMotion && entry.id > skipThrough} onProgress={scrollToPrompt} />
                  </div>
                ))}
              </div>
              <form className="terminal-command-line terminal-input-line" aria-label="Run a terminal command" onSubmit={submit}>
                <label htmlFor="terminal-command" className="terminal-prompt"><span aria-hidden="true">{TERMINAL_PROMPT}</span><span className="sr-only">Terminal command</span></label>
                <input ref={inputRef} id="terminal-command" data-terminal-input value={input} maxLength={256}
                  onChange={(event) => { setInput(event.target.value); setHistoryIndex(null); setCompletions([]); }}
                  onKeyDown={handleKeyDown} className="terminal-input" type="text" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="go" />
                <button type="submit" className="sr-only focus:not-sr-only terminal-run">Run command</button>
              </form>
              {!!completions.length && <p className="terminal-completions" role="status">{completions.join('  ')}</p>}
            </>
          )}
        </div>
        <div className="terminal-footer" aria-hidden="true"><span>↑↓ history · Tab complete</span><span>Ctrl+L clear</span></div>
      </div>
      {effect && <TerminalEffects effect={effect} active={active} reducedMotion={reducedMotion} onExit={exitEffect} onReboot={rebootTerminal} />}
    </div>
  );
}

function TypedResult({ result, animate, onProgress }: { result: TerminalResult; animate: boolean; onProgress: () => void }) {
  const [visible, setVisible] = useState(animate ? 0 : result.text.length);

  useEffect(() => {
    if (!animate) {
      setVisible(result.text.length);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = Math.min(1400, Math.max(180, result.text.length * 3));
    const tick = (now: number) => {
      const count = Math.min(result.text.length, Math.ceil(result.text.length * (now - start) / duration));
      setVisible(count);
      if (count < result.text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [result.text, animate]);

  useEffect(() => { onProgress(); }, [visible, onProgress]);

  return (
    <div className={`terminal-result ${result.error ? 'terminal-error' : ''}`} data-typing={visible < result.text.length}>
      <span className="sr-only">{result.announcement ?? result.text}</span>
      <div className={result.art ? 'terminal-fetch' : undefined}>
        {result.art && <pre className="terminal-fetch-logo" role="img" aria-label="DebajitOS ASCII logo">{result.art}</pre>}
        <pre className={`terminal-output ${result.preformatted ? 'terminal-output-ascii' : ''}`} aria-hidden="true">{result.text.slice(0, visible)}{visible < result.text.length && <span className="terminal-cursor" />}</pre>
      </div>
      {visible >= result.text.length && result.links && <div className="terminal-links">
        {result.links.map(({ href, label }) => <a key={href} href={href} target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer">{label}</a>)}
      </div>}
    </div>
  );
}

function TerminalClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <time dateTime={now?.toISOString()}>{now ? `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}` : '\u00a0'}</time>;
}
