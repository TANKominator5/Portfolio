'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import styles from './AsciiCam.module.css';

const RAMPS = {
  classic: ' .:-=+*#%@',
  dots: '.',
  binary: ' 01',
  blocks: ' ░▒▓█',
};
type Style = keyof typeof RAMPS | 'custom';
type Phase = 'idle' | 'requesting' | 'live';

function cameraError(error: unknown) {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Camera access denied. Allow camera access in your browser, then try again.';
  if (name === 'NotFoundError') return 'No camera found. Connect a webcam and try again.';
  if (name === 'NotReadableError' || name === 'AbortError') return 'Could not start the camera. It may be in use by another application.';
  return 'Could not start the camera. Check your device and browser permissions, then try again.';
}

export default function AsciiCam({ visible = true }: { visible?: boolean }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsId = useId();
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('Camera off · click Start camera to connect.');
  const [style, setStyle] = useState<Style>('classic');
  const [characters, setCharacters] = useState('@');
  const [color, setColor] = useState('mint');
  const [customColor, setCustomColor] = useState('#73d9f5');
  const [mirror, setMirror] = useState(true);
  const [invert, setInvert] = useState(false);
  const [detail, setDetail] = useState(100);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const detachRef = useRef<(() => void) | null>(null);

  const release = useCallback(() => {
    requestRef.current++;
    detachRef.current?.();
    detachRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback((reason = 'Camera off · stream released.') => {
    release();
    setPhase('idle');
    setMessage(reason);
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }, [release]);

  useEffect(() => release, [release]);

  useEffect(() => {
    if (!visible) stop('Camera stopped while minimized · start again to reconnect.');
  }, [visible, stop]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stop('Camera stopped while the tab was hidden · start again to reconnect.');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [stop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.floor(entry.contentRect.width), height: Math.floor(entry.contentRect.height) });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const start = async () => {
    if (!visible || document.hidden || phase !== 'idle') return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMessage('Camera access needs HTTPS or localhost and a browser with webcam support.');
      return;
    }
    const request = ++requestRef.current;
    setPhase('requesting');
    setMessage('Waiting for camera permission…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const ended = () => stop('Camera disconnected · start again to reconnect.');
      stream.getVideoTracks().forEach((track) => track.addEventListener('ended', ended));
      detachRef.current = () => stream.getVideoTracks().forEach((track) => track.removeEventListener('ended', ended));
      const video = videoRef.current;
      if (!video) { release(); return; }
      video.srcObject = stream;
      await video.play();
      if (request !== requestRef.current) return;
      setPhase('live');
      setMessage('LIVE · rendering locally · no audio');
    } catch (error) {
      if (request !== requestRef.current) return;
      release();
      setPhase('idle');
      setMessage(cameraError(error));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (phase !== 'live' || !visible || !canvas || !video || size.width < 1 || size.height < 1) return;
    const output = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    const pixels = sample.getContext('2d', { willReadFrequently: true });
    if (!output || !pixels) { stop('This browser could not create the ASCII renderer.'); return; }
    const custom = Array.from(characters).filter((char) => char.codePointAt(0)! >= 32 && char !== '\u007f');
    const ramp = style === 'custom' ? (custom.length ? custom : ['@']) : Array.from(RAMPS[style]);
    const solid = color === 'mint' ? '#86efac' : color === 'amber' ? '#fbbf24' : color === 'white' ? '#f3f4f6' : color === 'purple' ? '#c084fc' : customColor;
    let animation = 0;
    let previous = -Infinity;
    let frames = 0;

    const render = (now: number) => {
      animation = requestAnimationFrame(render);
      if (now - previous < 1000 / 24 || video.readyState < 2 || !video.videoWidth) return;
      previous = now;
      const aspect = video.videoWidth / video.videoHeight;
      const width = Math.max(1, Math.floor(Math.min(size.width, size.height * aspect)));
      const height = Math.max(1, Math.floor(width / aspect));
      const columns = Math.max(1, Math.min(detail, Math.floor(width / 4)));
      const rows = Math.max(1, Math.round(columns / (aspect * 2)));
      const cellWidth = width / columns;
      const cellHeight = height / rows;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      if (sample.width !== columns || sample.height !== rows) { sample.width = columns; sample.height = rows; }
      pixels.drawImage(video, 0, 0, columns, rows);
      const { data } = pixels.getImageData(0, 0, columns, rows);
      output.setTransform(dpr, 0, 0, dpr, 0, 0);
      output.globalAlpha = 1;
      output.fillStyle = '#101214';
      output.fillRect(0, 0, width, height);
      output.font = `${cellWidth / 0.62}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      output.textAlign = 'center';
      output.textBaseline = 'middle';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + (mirror ? columns - 1 - x : x)) * 4;
          const r = data[index], g = data[index + 1], b = data[index + 2];
          const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const brightness = invert ? 1 - light : light;
          const char = ramp[Math.min(ramp.length - 1, Math.floor(brightness * ramp.length))];
          output.globalAlpha = ramp.length === 1 ? brightness : 1;
          output.fillStyle = color === 'camera' ? `rgb(${r},${g},${b})` : solid;
          output.fillText(char, (x + 0.5) * cellWidth, (y + 0.5) * cellHeight, cellWidth);
        }
      }
      canvas.dataset.frame = String(++frames);
    };
    animation = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animation);
  }, [phase, visible, size, style, characters, color, customColor, mirror, invert, detail, stop]);

  return (
    <section className={styles.app} aria-label="ASCII camera" data-state={phase}>
      <div className={styles.workspace}>
        <aside className={styles.sidebar} data-open={settingsOpen} aria-label="Camera settings">
          <button type="button" className={styles.sidebarToggle} aria-label={settingsOpen ? 'Hide settings' : 'Show settings'}
            title={settingsOpen ? 'Hide settings' : 'Show settings'} aria-expanded={settingsOpen} aria-controls={settingsId}
            onClick={() => setSettingsOpen((open) => !open)}>
            {settingsOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            {settingsOpen && <span>Settings</span>}
          </button>
          <div id={settingsId} className={styles.settings} hidden={!settingsOpen}>
            <label>Style<select value={style} onChange={(event) => setStyle(event.target.value as Style)}>
              <option value="classic">Classic ASCII</option><option value="dots">Only dots</option>
              <option value="binary">Binary</option><option value="blocks">Blocks</option><option value="custom">Custom characters</option>
            </select></label>
            {style === 'custom' && <label>Characters<input type="text" value={characters} maxLength={32} placeholder=" .:-=+*#%@" onChange={(event) => setCharacters(event.target.value)} title="Use one character, or a sequence from light to dense. Empty input uses @." /></label>}
            <label>Color<select value={color} onChange={(event) => setColor(event.target.value)}>
              <option value="mint">Mint</option><option value="amber">Amber</option><option value="white">White</option>
              <option value="purple">Purple</option><option value="camera">Camera colors</option><option value="custom">Custom color</option>
            </select></label>
            {color === 'custom' && <label>Tint<input type="color" value={customColor} onChange={(event) => setCustomColor(event.target.value)} /></label>}
            <label>Detail<select value={detail} onChange={(event) => setDetail(Number(event.target.value))}>
              <option value={60}>Coarse</option><option value={100}>Balanced</option><option value={160}>Fine</option>
            </select></label>
            <label className={styles.toggle}><input type="checkbox" checked={mirror} onChange={(event) => setMirror(event.target.checked)} />Mirror</label>
            <label className={styles.toggle}><input type="checkbox" checked={invert} onChange={(event) => setInvert(event.target.checked)} />Invert</label>
          </div>
        </aside>
        <div ref={viewportRef} className={styles.viewport}>
          <video ref={videoRef} muted playsInline hidden aria-hidden="true" />
          <canvas ref={canvasRef} role="img" aria-label="Live webcam rendered as ASCII characters" hidden={phase !== 'live'} />
          {phase !== 'live' && <div className={styles.placeholder}>
            <pre aria-hidden="true">{'+------------------+\n|   . : + # @ # +   |\n|   [ ASCII-CAM ]  |\n|   + # @ # + : .   |\n+------------------+'}</pre>
            <p>{phase === 'requesting' ? 'Allow camera access in your browser to begin.' : 'Your webcam. A few thousand characters.'}</p>
            <p className={styles.note}>Start camera requests permission. Video stays in this browser.</p>
          </div>}
        </div>
      </div>
      <footer className={styles.footer}>
        <p className={styles.status} role="status">{message}</p>
        <button type="button" className={styles.cameraButton} onClick={phase === 'idle' ? start : () => stop()}>
          {phase === 'idle' ? 'Start camera' : phase === 'requesting' ? 'Cancel' : 'Stop camera'}
        </button>
      </footer>
    </section>
  );
}
