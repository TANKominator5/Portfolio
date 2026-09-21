# Debajit Pal — Desktop Portfolio

An Arch Linux-inspired portfolio built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. It includes draggable, resizable windows for About Me, the résumé, projects, contact details, and an interactive Terminal.

## Development

Use Node.js 22.18+ and pnpm 10.26.2. From the repository root:

```bash
pnpm --dir arch-portfolio install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Next.js (normally http://localhost:3000). Root scripts forward to the application in `arch-portfolio`; dependencies and the application lockfile live there.

## Checks and production build

From the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --dir arch-portfolio exec playwright install chromium
pnpm test:e2e
pnpm build
pnpm start
```

Browser tests start a development server on port 3100. Stop other development servers before running browser tests or a production build, because Next.js 15 uses the same `.next` output directory for both. `next/font` downloads Inter during the first build, so the build requires access to Google Fonts.

To test an already-running development server, set `PLAYWRIGHT_BASE_URL` to its URL (for example, `http://localhost:3001`). The browser tests will use it without starting another server.

## Interaction

- Click/tap an icon, or focus it and press Enter/Space, to open an app.
- Drag a title bar or resize an edge/corner on desktop.
- Use the title bar controls to close, minimize, or maximize. Double-clicking the title bar also toggles maximization.
- Restore minimized apps from the taskbar; size, position, and scroll position are preserved.
- Press Escape while focused inside a window to close it.
- On narrow screens, windows fill the available area between the top bar and taskbar.

## Terminal

Open **Terminal** on the desktop to see its startup sequence and welcome banner. Type `help` for the command list:

`help`, `about`, `skills`, `education`, `certifications`, `projects`, `gui`, `contact`, `email`, `clear`, `whoami`, `welcome`, `resume`, `awards`.

- `gui` opens the desktop portfolio in a new tab; `email` launches the visitor's email client.
- ↑/↓ browse command history, preserving an unfinished draft. Tab completes a command or lists matching commands.
- Ctrl+L clears the display; Ctrl+C finishes animated output and cancels the current input. Escape in the command input clears the draft.
- Minimize/restore preserves the session. Closing the app starts a fresh session next time.
- Reduced-motion preferences skip the startup and typing animations.
- Profile, project, résumé, and terminal content share `src/data/portfolio.ts`. Certifications explicitly report that none are listed until real certification data is added.

### Easter eggs

Type `eastereggs` to discover:

- `neofetch` / `fastfetch`: a custom DebajitOS ASCII logo and fictional, coffee-powered system specs.
- `sudo rm -rf /`: a simulated kernel panic and reboot, returning to a fresh terminal in three seconds. The portfolio stays loaded.
- `matrix`: green ASCII rain. Exit with Esc, Ctrl+C, or the visible exit button.
- `cowsay "hire me"`: an ASCII cow with a custom, quoted message. `fortune | cowsay` gives it a random developer quote.
- `fortune`, `coffee`, `ls`, `pwd`, `uname [-a]`, and `uptime`: more Linux-inspired jokes.
- `sl`: a tiny steam locomotive passes the prompt, then returns control automatically. Esc/Ctrl+C or the stop button ends it early.

Effects stay inside the Terminal window. Reduced-motion mode uses a static Matrix scene and omits the panic glitch. The explicitly requested `sl` animation uses a slower, five-second glide in this mode and returns to the prompt when the train finishes crossing. Scrollback supports mouse, touch, and keyboard scrolling and preserves the reading position when minimized.

## Source map

- `src/app/page.tsx`: desktop and window ordering/state
- `src/components/Window.tsx`: window interactions and focus handling
- `src/components/windowGeometry.ts`: bounded drag/resize calculations
- `src/data/portfolio.ts`: shared profile, projects, education, skills, and awards
- `src/components/PortfolioContent.tsx`: About Me, project display, and contact links
- `src/components/ResumeContent.tsx`: résumé layout, education, skills, and awards
- `src/components/TerminalContent.tsx`: terminal session, animations, keyboard input, and history
- `src/components/terminalCommands.ts`: command responses and actions
- `src/components/terminalEasterEggs.ts`: quoted arguments, fortunes, ASCII output, and Easter-egg dispatch
- `src/components/TerminalEffects.tsx`: Matrix canvas, simulated reboot, and steam locomotive
- `src/app/globals.css`: Tailwind v4 theme, wallpaper, and accessibility styles
- `tests/`: geometry and browser regression tests

Project-specific repository/live-site URLs were not supplied in the original content. Projects link to the supplied GitHub profile rather than dead placeholder links.

The `pnpm.overrides` entries keep PostCSS and Next.js's optional Sharp dependency on patched releases while retaining Next.js 15.
