import { expect, test, type Locator, type Page } from '@playwright/test';

async function openTerminal(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
  const terminal = page.getByRole('dialog', { name: 'Terminal', exact: true });
  await expect(terminal.getByRole('textbox', { name: 'Terminal command' })).toBeVisible();
  return terminal;
}

async function run(terminal: Locator, command: string) {
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await input.fill(command);
  await input.press('Enter');
  const entry = terminal.locator('.terminal-entry').last();
  await expect(entry).toHaveAttribute('data-command', command.trim());
  await expect(entry.locator('.terminal-result')).toHaveAttribute('data-typing', 'false');
  return entry;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('startup animation, personal banner, and typed help output', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
  const terminal = page.getByRole('dialog', { name: 'Terminal', exact: true });
  await expect(terminal.getByRole('status', { name: 'Starting terminal' })).toBeVisible();
  await terminal.getByRole('button', { name: 'Skip startup' }).click();
  await expect(terminal.getByRole('img', { name: 'Debajit Pal' })).toBeVisible();
  await expect(terminal.getByRole('textbox', { name: 'Terminal command' })).toBeFocused();
  const help = await run(terminal, 'help');
  await expect(help.locator('.terminal-output')).toContainText('Available commands:');
  for (const command of ['about', 'skills', 'education', 'certifications', 'projects', 'gui', 'contact', 'email', 'clear', 'whoami']) {
    await expect(help.locator('.terminal-output')).toContainText(command);
  }
});

test('portfolio commands use the existing profile, résumé, and project data', async ({ page }) => {
  const terminal = await openTerminal(page);
  const checks = [
    ['  ABOUT  ', 'Debajit Pal'],
    ['skills', 'TypeScript'],
    ['education', "St. Joan's School"],
    ['certifications', 'No certifications are listed'],
    ['projects', 'Tickease'],
    ['awards', 'HackFest 2025'],
    ['whoami', 'visitor'],
  ];
  for (const [command, expected] of checks) {
    const entry = await run(terminal, command);
    await expect(entry.locator('.terminal-output')).toContainText(expected);
  }
  const contact = await run(terminal, 'contact');
  await expect(contact.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute('href', 'mailto:debajitpal.380718@gmail.com');
  await expect(contact.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/TANKominator5');
  const resume = await run(terminal, 'resume');
  await expect(resume.getByRole('link', { name: 'Open résumé PDF' })).toHaveAttribute('href', /drive\.google\.com/);
});

test('history preserves drafts; Tab completion and clear work without trapping keyboard navigation', async ({ page }) => {
  const terminal = await openTerminal(page);
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await run(terminal, 'about');
  await run(terminal, 'skills');
  await input.fill('unfinished draft');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('skills');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('about');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('unfinished draft');
  await input.fill('pro');
  await input.press('Tab');
  await expect(input).toHaveValue('projects');
  await expect(input).toBeFocused();
  await input.press('Tab');
  await expect(terminal.getByRole('button', { name: 'Run command', exact: true })).toBeFocused();
  await input.fill('c');
  await input.press('Tab');
  await expect(terminal.getByRole('status')).toContainText('certifications');
  await input.fill('clear');
  await input.press('Enter');
  await expect(terminal.locator('.terminal-entry')).toHaveCount(0);
  await input.press('ArrowUp');
  await expect(input).toHaveValue('clear');
  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(terminal).toBeVisible();
  await run(terminal, 'whoami');
  await input.press('Control+l');
  await expect(terminal.locator('.terminal-entry')).toHaveCount(0);
});

test('minimizing retains output, input, history, and maximized state', async ({ page }) => {
  const terminal = await openTerminal(page);
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await run(terminal, 'projects');
  await input.fill('my draft');
  await terminal.getByRole('button', { name: 'Maximize window' }).click();
  await terminal.getByRole('button', { name: 'Minimize window' }).click();
  await expect(terminal).toBeHidden();
  await page.getByRole('button', { name: 'Restore Terminal', exact: true }).click();
  await expect(input).toHaveValue('my draft');
  await expect(input).toBeFocused();
  await expect(terminal.getByRole('button', { name: 'Restore window' })).toBeVisible();
  await expect(terminal.locator('.terminal-output').last()).toContainText('School Management System');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('projects');
});

test('long output scrolls with the mouse and preserves manual scrollback across restore', async ({ page }) => {
  const terminal = await openTerminal(page);
  await run(terminal, 'projects');
  const scrollback = terminal.getByLabel('Terminal scrollback', { exact: true });
  const bottom = await scrollback.evaluate((element) => ({ top: element.scrollTop, height: element.clientHeight, content: element.scrollHeight }));
  expect(bottom.height).toBeGreaterThan(0);
  expect(bottom.content).toBeGreaterThan(bottom.height);
  expect(bottom.top).toBeGreaterThan(0);
  await scrollback.hover();
  await page.mouse.wheel(0, -2000);
  await expect.poll(() => scrollback.evaluate((element) => element.scrollTop)).toBe(0);
  await page.waitForTimeout(1100);
  expect(await scrollback.evaluate((element) => element.scrollTop)).toBe(0);
  await terminal.getByRole('button', { name: 'Minimize window' }).click();
  await page.getByRole('button', { name: 'Restore Terminal', exact: true }).click();
  expect(await scrollback.evaluate((element) => element.scrollTop)).toBe(0);
  await scrollback.hover();
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => scrollback.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test('cancel and clear clean up in-flight output without breaking the next command', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const terminal = await openTerminal(page);
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('projects');
  await input.press('Enter');
  await input.fill('unfinished');
  await input.press('Control+c');
  await expect(input).toHaveValue('');
  await expect(terminal.locator('.terminal-entry').last()).toHaveAttribute('data-command', 'unfinished^C');
  await expect(terminal.locator('[data-command="projects"] .terminal-result')).toHaveAttribute('data-typing', 'false');
  await input.fill('awards');
  await input.press('Enter');
  await input.fill('clear');
  await input.press('Enter');
  await expect(terminal.locator('.terminal-entry')).toHaveCount(0);
  const identity = await run(terminal, 'whoami');
  await expect(identity.locator('.terminal-output')).toContainText('visitor');
  expect(errors).toEqual([]);
});

test('unknown commands render as text, and gui opens the desktop in another tab', async ({ page, context }) => {
  const terminal = await openTerminal(page);
  const unknown = await run(terminal, '<img src=x onerror=alert(1)>');
  await expect(unknown.locator('.terminal-output')).toContainText('Command not found: <img');
  await expect(unknown.locator('img')).toHaveCount(0);
  const newPage = context.waitForEvent('page');
  await run(terminal, 'gui');
  const desktop = await newPage;
  await expect(desktop.getByRole('button', { name: 'Open Terminal', exact: true })).toBeVisible();
  await expect(desktop.getByRole('dialog')).toHaveCount(0);
  await desktop.close();
  await expect(terminal).toBeVisible();
});

test('narrow touch screens can run commands without horizontal overflow', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).tap();
  const terminal = page.getByRole('dialog', { name: 'Terminal', exact: true });
  await expect(terminal.getByRole('img', { name: 'Debajit Pal' })).toBeVisible();
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await input.tap();
  await run(terminal, 'projects');
  await expect(input).toBeInViewport();
  expect(await terminal.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const scrollback = terminal.getByLabel('Terminal scrollback', { exact: true });
  expect(await scrollback.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
  await terminal.getByRole('button', { name: 'Minimize window' }).tap();
  await page.getByRole('button', { name: 'Restore Terminal', exact: true }).tap();
  await expect(input).toBeVisible();
  await run(terminal, 'contact');
  await expect(terminal.getByRole('link', { name: 'Email', exact: true })).toBeInViewport();
  await context.close();
});
