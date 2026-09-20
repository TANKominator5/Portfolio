# Debajit Pal — Desktop Portfolio

An Arch Linux-inspired portfolio built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. It includes draggable, resizable windows for About Me, the résumé, projects, and contact details.

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

## Interaction

- Click/tap an icon, or focus it and press Enter/Space, to open an app.
- Drag a title bar or resize an edge/corner on desktop.
- Use the title bar controls to close, minimize, or maximize. Double-clicking the title bar also toggles maximization.
- Restore minimized apps from the taskbar; size, position, and scroll position are preserved.
- Press Escape while focused inside a window to close it.
- On narrow screens, windows fill the available area between the top bar and taskbar.

## Source map

- `src/app/page.tsx`: desktop and window ordering/state
- `src/components/Window.tsx`: window interactions and focus handling
- `src/components/windowGeometry.ts`: bounded drag/resize calculations
- `src/components/PortfolioContent.tsx`: shared profile/project content, About Me, and contact links
- `src/components/ResumeContent.tsx`: résumé layout, education, skills, and awards
- `src/app/globals.css`: Tailwind v4 theme, wallpaper, and accessibility styles
- `tests/`: geometry and browser regression tests

Project-specific repository/live-site URLs were not supplied in the original content. Projects link to the supplied GitHub profile rather than dead placeholder links.

The `pnpm.overrides` entries keep PostCSS and Next.js's optional Sharp dependency on patched releases while retaining Next.js 15.
