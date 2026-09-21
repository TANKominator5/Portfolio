import { expect, test, type Locator, type Page } from '@playwright/test';

async function openTerminal(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
  const terminal = page.getByRole('dialog', { name: 'Terminal', exact: true });
  await expect(terminal.getByRole('textbox', { name: 'Terminal command' })).toBeVisible();
  return terminal;
}

async function command(terminal: Locator, text: string) {
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await input.fill(text);
  await input.press('Enter');
}

async function canvasChecksum(canvas: Locator) {
  return canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('2d')!;
    return context.getImageData(0, 0, 80, 80).data.reduce((sum, value, index) => (sum + value * (index + 1)) % 10000019, 0);
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('fetch, quoted cowsay, fortunes, and bonus commands render correctly', async ({ page }) => {
  const terminal = await openTerminal(page);
  await command(terminal, 'neofetch');
  await expect(terminal.getByRole('img', { name: 'DebajitOS ASCII logo' })).toBeVisible();
  await expect(terminal.locator('.terminal-output').last()).toContainText('OS: DebajitOS v1.0 x86_64');
  await command(terminal, 'cowsay "Hire Me | Please"');
  await expect(terminal.locator('.terminal-output').last()).toContainText('< Hire Me | Please >');
  await command(terminal, 'fortune | cowsay');
  await expect(terminal.locator('.terminal-output').last()).toContainText('^__^');
  for (const [text, expected] of [['coffee', 'Dependency injection complete'], ['ls', 'node_modules/'], ['pwd', '/home/debajit'], ['uname -a', 'DebajitOS'], ['uptime', '3 cups of coffee'], ['eastereggs', 'sudo rm -rf /']]) {
    await command(terminal, text);
    await expect(terminal.locator('.terminal-output').last()).toContainText(expected);
  }
});

test('fake panic reboots in three seconds and leaves the portfolio open', async ({ page }) => {
  const terminal = await openTerminal(page);
  const url = page.url();
  await terminal.getByRole('textbox').fill('sudo rm -rf /');
  const started = Date.now();
  await terminal.getByRole('textbox').press('Enter');
  const panic = terminal.getByRole('region', { name: 'Simulated kernel panic' });
  await expect(panic).toBeVisible();
  await expect(panic.getByRole('heading', { name: 'KERNEL PANIC' })).toBeVisible();
  await expect(panic.getByRole('status')).toContainText('Rebooting...', { timeout: 2000 });
  await expect(panic).toHaveCount(0, { timeout: 3500 });
  const elapsed = Date.now() - started;
  expect(elapsed).toBeGreaterThanOrEqual(2800);
  expect(elapsed).toBeLessThan(4500);
  await expect(terminal.getByRole('textbox')).toBeFocused();
  await expect(terminal.locator('.terminal-output').last()).toContainText('Reboot complete. All projects survived.');
  await expect(page).toHaveURL(url);
  await command(terminal, 'about');
  await expect(terminal.locator('.terminal-output').last()).toContainText('Debajit Pal');
});

test('Matrix animates, pauses when minimized, and exits with keyboard or touch controls', async ({ page }) => {
  const terminal = await openTerminal(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await command(terminal, 'matrix');
  const matrix = terminal.getByRole('region', { name: 'Matrix rain' });
  await expect(matrix).toBeFocused();
  const canvas = page.locator('#window-terminal canvas');
  const first = await canvasChecksum(canvas);
  await expect.poll(() => canvasChecksum(canvas)).not.toBe(first);
  await terminal.getByRole('button', { name: 'Minimize window' }).click();
  await expect(terminal).toBeHidden();
  const paused = await canvasChecksum(canvas);
  await page.waitForTimeout(250);
  expect(await canvasChecksum(canvas)).toBe(paused);
  await page.getByRole('button', { name: 'Restore Terminal', exact: true }).click();
  await expect(matrix).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(matrix).toHaveCount(0);
  await expect(terminal.getByRole('textbox')).toBeFocused();
  await command(terminal, 'matrix');
  await page.keyboard.press('Control+c');
  await expect(matrix).toHaveCount(0);
  await command(terminal, 'matrix');
  await matrix.getByRole('button', { name: 'Exit Matrix' }).click();
  await expect(terminal.getByRole('textbox')).toBeFocused();
});

test('the train crosses the prompt, finishes, and can be stopped', async ({ page }) => {
  const terminal = await openTerminal(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await command(terminal, 'sl');
  const region = terminal.getByRole('region', { name: 'Steam locomotive' });
  const train = region.getByRole('img');
  await expect(train).toBeVisible();
  const startX = (await train.boundingBox())!.x;
  await expect.poll(async () => (await train.boundingBox())!.x).toBeLessThan(startX - 50);
  await expect(region).toHaveCount(0, { timeout: 4500 });
  await expect(terminal.getByRole('textbox')).toBeFocused();
  await command(terminal, 'sl');
  await region.getByRole('button', { name: 'Stop train' }).click();
  await expect(region).toHaveCount(0);
});

test('reduced-motion effects and fetch fit a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const terminal = await openTerminal(page);
  await command(terminal, 'fastfetch');
  const scroll = terminal.getByLabel('Terminal scrollback', { exact: true });
  expect(await scroll.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await command(terminal, `cowsay "${'hire me '.repeat(20)}"`);
  expect(await scroll.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await command(terminal, 'matrix');
  const matrix = terminal.getByRole('region', { name: 'Matrix rain' });
  await expect(matrix).toContainText('paused for reduced motion');
  const first = await canvasChecksum(matrix.locator('canvas'));
  await page.waitForTimeout(250);
  expect(await canvasChecksum(matrix.locator('canvas'))).toBe(first);
  await matrix.getByRole('button', { name: 'Exit Matrix' }).click();
  await command(terminal, 'sl');
  const train = terminal.getByRole('region', { name: 'Steam locomotive' });
  const locomotive = train.getByRole('img');
  await expect(locomotive).toHaveCSS('animation-name', 'terminal-train-trip');
  await expect(locomotive).toHaveCSS('animation-duration', '5s');
  const startX = (await locomotive.boundingBox())!.x;
  await expect.poll(async () => (await locomotive.boundingBox())!.x).toBeLessThan(startX - 30);
  await expect(train).toHaveCount(0, { timeout: 6000 });
  await expect(terminal.getByRole('textbox')).toBeFocused();
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
});

test('closing an effect cleans up and reopening starts a fresh terminal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const terminal = await openTerminal(page);
  for (const text of ['matrix', 'sl', 'sudo rm -rf /']) {
    await command(terminal, text);
    await expect(terminal.locator('.terminal-effect')).toBeVisible();
    await terminal.getByRole('button', { name: 'Close window' }).click();
    await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
    await expect(terminal.getByRole('textbox')).toBeFocused();
    await expect(terminal.locator('.terminal-effect')).toHaveCount(0);
  }
  await command(terminal, 'skills');
  await page.waitForTimeout(3200);
  await expect(terminal.locator('.terminal-output').last()).toContainText('Technical skills');
  expect(errors).toEqual([]);
});
