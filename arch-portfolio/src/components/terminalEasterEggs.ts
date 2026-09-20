import type { TerminalResult } from './terminalCommands';

export type TerminalEffect = 'panic' | 'matrix' | 'train';

export const easterEggCommands = [
  ['neofetch', 'DebajitOS system specs, suspiciously caffeinated'],
  ['fastfetch', 'Same specs. Now with imaginary speed gains'],
  ['matrix', 'Enter the green ASCII rain (Esc to leave)'],
  ['cowsay', 'Let a cow speak: cowsay "hire me"'],
  ['fortune', 'A random developer fortune; try fortune | cowsay'],
  ['sl', 'A steam locomotive. You probably meant ls'],
  ['sudo', 'Try sudo rm -rf / for a 3-second fake reboot'],
  ['coffee', 'Refill the most important system dependency'],
  ['ls', 'List the contents of a student’s home directory'],
  ['pwd', 'Locate the source of procrastination'],
  ['uname', 'Identify this extremely real operating system'],
  ['uptime', 'Check caffeine uptime and deadline load'],
] as const;

const FORTUNES = [
  'It works on my machine. The machine is powered by coffee.',
  'There are 10 types of people: those who understand binary and those who do not.',
  'A bug is just an undocumented plot twist.',
  'Hire me before my side projects become sentient.',
  'The code is self-documenting. Unfortunately, it speaks in riddles.',
  'Sleep is a deprecated dependency. Coffee is the hotfix.',
  'Behind every great developer is a browser with 47 open tabs.',
  'My code has no bugs. It has surprise features.',
];

const SYSTEM_LOGO = String.raw`        /\
       /  \
      / /\ \
     / /  \ \
    / / D  \ \
   / /______\ \
  /  ________  \
 /  /        \  \
/__/ DEBAJIT   \__\
       OS 1.0`;

const SYSTEM_SPECS = [
  ['OS', 'DebajitOS v1.0 x86_64'],
  ['Host', 'RCCIIT CSE Lab'],
  ['Kernel', 'React.js / Next.js'],
  ['Uptime', '3 cups of coffee'],
  ['Shell', 'BTech_Student_v2026'],
  ['CPU', '8 cores, 1 functioning brain cell'],
  ['GPU', 'Integrated Imagination Graphics'],
  ['Memory', '15.9 GiB / 16 GiB (Chrome is hungry)'],
  ['Packages', '404 (sleep not found)'],
  ['WM', 'ProcrastinationWM'],
  ['Theme', 'Purple Haze [Dark]'],
  ['Battery', '3% social energy, 100% caffeine'],
  ['Disk', '98% node_modules, 2% hope'],
];

interface Token { value: string; pipe?: boolean }

// A tiny argument lexer, not a shell: only the commands below are interpreted.
function tokenize(input: string): Token[] | string {
  const tokens: Token[] = [];
  let word = '';
  let started = false;
  let quote = '';
  let escaped = false;
  const flush = () => {
    if (started) tokens.push({ value: word });
    word = '';
    started = false;
  };

  for (const char of input.trim()) {
    if (escaped) {
      word += char;
      escaped = false;
    } else if (char === '\\' && quote !== "'") {
      escaped = true;
      started = true;
    } else if (quote) {
      if (char === quote) quote = '';
      else word += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (char === '|') {
      flush();
      tokens.push({ value: '|', pipe: true });
    } else if (/\s/.test(char)) {
      flush();
    } else {
      word += char;
      started = true;
    }
  }
  if (quote) return 'Unclosed quote. Try: cowsay "hire me"';
  if (escaped) return 'Missing character after the final backslash.';
  flush();
  return tokens;
}

function fortune() {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
}

function cow(message: string): TerminalResult {
  const clean = message.replace(/\s+/g, ' ').trim() || 'hire me';
  const lines: string[] = [];
  let line = '';
  for (const word of clean.split(' ')) {
    const chunks = Array.from(word);
    if (line && Array.from(line).length + chunks.length + 1 > 28) {
      lines.push(line);
      line = '';
    }
    while (chunks.length > 28) lines.push(chunks.splice(0, 28).join(''));
    const rest = chunks.join('');
    line = line ? `${line} ${rest}` : rest;
  }
  if (line) lines.push(line);
  const width = Math.max(...lines.map((text) => Array.from(text).length));
  const bubble = lines.map((text, index) => {
    const padded = text + ' '.repeat(width - Array.from(text).length);
    if (lines.length === 1) return `< ${padded} >`;
    if (index === 0) return `/ ${padded} \\`;
    if (index === lines.length - 1) return `\\ ${padded} /`;
    return `| ${padded} |`;
  });
  return {
    preformatted: true,
    announcement: `A cow says: ${clean}`,
    text: [` ${'_'.repeat(width + 2)}`, ...bubble, ` ${'-'.repeat(width + 2)}`, String.raw`        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||`].join('\n'),
  };
}

const usage = (command: string): TerminalResult => ({ error: true, text: `Usage: ${command}` });

export function runEasterEggCommand(input: string): TerminalResult | null {
  const tokens = tokenize(input);
  if (typeof tokens === 'string') return { error: true, text: tokens };
  if (tokens.some((token) => token.pipe)) {
    if (tokens.length === 3 && tokens[1].pipe && !tokens[0].pipe && !tokens[2].pipe
      && tokens[0].value.toLowerCase() === 'fortune' && tokens[2].value.toLowerCase() === 'cowsay') {
      return cow(fortune());
    }
    return { error: true, text: 'This tiny shell only supports one pipe: fortune | cowsay' };
  }
  const [first, ...args] = tokens.map((token) => token.value);
  const command = first?.toLowerCase();
  if (!command) return null;

  if (command === 'cowsay') return cow(args.length === 1 && args[0].toLowerCase() === 'fortune' ? fortune() : args.join(' '));
  if (command === 'sudo') {
    const invocation = args.join(' ');
    if (/^rm -(?:rf|fr) \/(?: --no-preserve-root)?$/.test(invocation)) {
      return { text: 'Removing procrastination...\nError: procrastination is a system dependency.', effect: 'panic' };
    }
    return { error: true, text: 'sudo: visitor is not in the caffeineers file.\nThis incident will be reported to the nearest coffee machine.\nTry: sudo rm -rf /' };
  }
  if (command === 'uname') {
    return args.length === 0 || (args.length === 1 && args[0] === '-a')
      ? { text: 'DebajitOS v1.0 x86_64\nKernel: React.js / Next.js\nBuilt with caffeine. Compiled under deadline pressure.' }
      : usage('uname [-a]');
  }
  if (args.length && easterEggCommands.some(([name]) => name === command)) return usage(command);

  switch (command) {
    case 'eastereggs':
      return { text: 'Secret-ish commands\n\n' + easterEggCommands.map(([name, description]) => `${name.padEnd(12)} ${description}`).join('\n') + '\n\nTry these:\n  cowsay "hire me"\n  fortune | cowsay\n  sudo rm -rf /\n\nEsc / Ctrl+C exits Matrix or stops the train.' };
    case 'neofetch':
    case 'fastfetch':
      return { art: SYSTEM_LOGO, text: 'visitor@DebajitOS\n----------------\n' + SYSTEM_SPECS.map(([label, value]) => `${label}: ${value}`).join('\n') };
    case 'fortune':
      return { text: fortune() };
    case 'matrix':
      return { text: 'Follow the purple rabbit.\nEntering the Matrix... Esc / Ctrl+C to return.', effect: 'matrix' };
    case 'sl':
      return { text: 'You typed sl, not ls. All aboard the deadline express!', effect: 'train' };
    case 'coffee':
      return { preformatted: true, announcement: 'Coffee refilled. Focus +10. Sleep postponed.', text: String.raw`       ( (
        ) )
      ........
      |      |]
      \      /
       '----'

Coffee refilled.
Focus +10. Sleep postponed.
Dependency injection complete.` };
    case 'ls':
      return { text: 'projects/\nresume.pdf\nassignments/\ntotally-not-bugs/\nnode_modules/  (visible from space)\nsleep -> /dev/null' };
    case 'pwd':
      return { text: '/home/debajit/procrastination/portfolio\nYou are here. Your assignments are elsewhere.' };
    case 'uptime':
      return { text: 'up 3 cups of coffee, 1 developer\nload average: 0.42, 4.20, 42.00\nSleep: process not found\nNext reboot: after the semester ends' };
    default:
      return null;
  }
}
