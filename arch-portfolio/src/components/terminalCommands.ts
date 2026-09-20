import { awards, education, profile, projects, skills } from '@/data/portfolio';

export const TERMINAL_PROMPT = 'visitor@portfolio:~$';

export const TERMINAL_BANNER = [
  '██████╗ ███████╗██████╗  █████╗      ██╗██╗████████╗',
  '██╔══██╗██╔════╝██╔══██╗██╔══██╗     ██║██║╚══██╔══╝',
  '██║  ██║█████╗  ██████╔╝███████║     ██║██║   ██║',
  '██║  ██║██╔══╝  ██╔══██╗██╔══██║██   ██║██║   ██║',
  '██████╔╝███████╗██████╔╝██║  ██║╚█████╔╝██║   ██║',
  '╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝ ╚════╝ ╚═╝   ╚═╝',
  '',
  '██████╗  █████╗ ██╗',
  '██╔══██╗██╔══██╗██║',
  '██████╔╝███████║██║',
  '██╔═══╝ ██╔══██║██║',
  '██║     ██║  ██║███████╗',
  '╚═╝     ╚═╝  ╚═╝╚══════╝',
].join('\n');

export const terminalCommands = [
  ['help', 'Show available commands'],
  ['about', 'About me'],
  ['skills', 'Technical skills'],
  ['education', 'Educational background'],
  ['certifications', 'Certifications'],
  ['projects', 'Portfolio projects'],
  ['gui', 'Open the desktop portfolio in a new tab'],
  ['contact', 'Contact information'],
  ['email', 'Send me an email'],
  ['clear', 'Clear the terminal'],
  ['whoami', 'Current user info'],
  ['welcome', 'Show the welcome banner'],
  ['resume', 'View my résumé PDF'],
  ['awards', 'Awards and achievements'],
] as const;

export interface TerminalResult {
  text: string;
  banner?: boolean;
  error?: boolean;
  action?: 'clear' | 'gui' | 'email';
  links?: { label: string; href: string }[];
}

export function runTerminalCommand(input: string): TerminalResult {
  const command = input.trim().toLowerCase();
  switch (command) {
    case 'help':
      return { text: 'Available commands:\n\n' + terminalCommands.map(([name, description]) => `${name.padEnd(15)} ${description}`).join('\n') + '\n\n↑ / ↓  Command history\nTab    Complete a command\nCtrl+L Clear the screen\nCtrl+C Finish output / cancel input' };
    case 'welcome':
      return { banner: true, text: 'BTech CSE Student | RCC Institute of Information Technology\n\nWelcome to my interactive Portfolio Terminal!\nType "help" to explore available commands.' };
    case 'about':
      return { text: `${profile.name}\n${profile.location}\n\nI’m a Computer Science & Engineering student at RCC Institute of Information Technology.\n\nI build web and mobile applications with React, Next.js, Flutter, and Supabase. I also take part in competitive programming, CTFs, and hackathons, and contribute to technical clubs and the FOSS community.` };
    case 'skills':
      return { text: 'Technical skills\n\n' + skills.map(([label, value]) => `${label}\n  ${value}`).join('\n\n') };
    case 'education':
      return { text: 'Education\n\n' + education.map(({ title, date, school }) => `${title} (${date})\n  ${school}`).join('\n\n') };
    case 'certifications':
      return { text: 'No certifications are listed in my portfolio yet.\nType "awards" to see my achievements or "skills" for my technical skills.' };
    case 'projects':
      return {
        text: 'Portfolio projects\n\n' + projects.map(({ name, description, details }, index) => `${index + 1}. ${name}\n${description}\n${details.map((detail) => `  • ${detail}`).join('\n')}`).join('\n\n'),
        links: [{ label: 'Browse my GitHub profile', href: profile.github }],
      };
    case 'gui':
      return { text: 'Opening desktop portfolio...\nLaunching in a new tab. You can also use the link below.', action: 'gui', links: [{ label: 'Open desktop portfolio ↗', href: '/' }] };
    case 'contact':
      return {
        text: `Let’s get in touch.\n\nLocation: ${profile.location}\nEmail:    ${profile.email}\nPhone:    ${profile.phone}`,
        links: [
          { label: 'Email', href: `mailto:${profile.email}` },
          { label: 'Call', href: profile.phoneHref },
          { label: 'GitHub', href: profile.github },
          { label: 'LinkedIn', href: profile.linkedin },
        ],
      };
    case 'email':
      return { text: `Opening your email app...\nTo: ${profile.email}`, action: 'email', links: [{ label: `Write to ${profile.email}`, href: `mailto:${profile.email}` }] };
    case 'clear':
      return { text: '', action: 'clear' };
    case 'whoami':
      return { text: `visitor\n\nYou’re exploring ${profile.name}’s portfolio.\nType "about" to meet the developer, or "help" to explore.` };
    case 'resume':
      return { text: `${profile.name} — Résumé\nOpen the PDF using the link below.`, links: [{ label: 'Open résumé PDF ↗', href: profile.resume }] };
    case 'awards':
      return { text: 'Awards & achievements\n\n' + awards.map(([award, description]) => `${award}\n  ${description}`).join('\n\n') };
    default:
      return { error: true, text: `Command not found: ${input.trim()}\nType "help" to see available commands.` };
  }
}
