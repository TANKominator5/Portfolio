import { expect, test, type Locator, type Page } from '@playwright/test';

async function openApp(page: Page, name: string) {
  await page.getByRole('button', { name: `Open ${name}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function expectInWorkspace(dialog: Locator, page: Page) {
  const viewport = page.viewportSize()!;
  const workspaceTop = viewport.width < 1024 ? 95 : 63;
  await expect.poll(async () => {
    const box = await dialog.boundingBox();
    return !!box && box.x >= 7 && box.y >= workspaceTop && box.x + box.width <= viewport.width - 7 && box.y + box.height <= viewport.height - 7;
  }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('all desktop icons fit on screen without scrolling at desktop and mobile sizes', async ({ page }) => {
  const desktop = page.getByRole('navigation', { name: 'Desktop applications', exact: true });
  const icons = desktop.getByRole('button');
  await expect(icons).toHaveCount(7);
  for (const viewport of [
    { width: 1366, height: 715 },
    { width: 1280, height: 600 },
    { width: 1920, height: 1080 },
    { width: 320, height: 568 },
    { width: 568, height: 320 },
    { width: 320, height: 320 },
    { width: 320, height: 256 },
    { width: 640, height: 320 },
    { width: 800, height: 400 },
  ]) {
    await page.setViewportSize(viewport);
    for (const icon of await icons.all()) await expect(icon).toBeInViewport({ ratio: 1 });
    expect(await desktop.evaluate((element) => (
      element.scrollHeight <= element.clientHeight && element.scrollWidth <= element.clientWidth
    ))).toBe(true);
    expect(await page.locator('body').evaluate((element) => (
      element.scrollWidth <= window.innerWidth && element.scrollHeight <= window.innerHeight
    ))).toBe(true);
  }
});

test('keyboard launch, focus, minimize, restore, and Escape close', async ({ page }) => {
  const launcher = page.getByRole('button', { name: 'Open About Me', exact: true });
  await launcher.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'About Me', exact: true });
  await expect(dialog).toBeFocused();
  await page.getByRole('button', { name: 'Show About Me', exact: true }).click();
  await expect(dialog).toBeFocused();
  await dialog.getByRole('button', { name: 'Minimize window' }).click();
  await expect(dialog).toBeHidden();
  const restore = page.getByRole('button', { name: 'Restore About Me' });
  await expect(restore).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test('drag, resize and résumé scroll survive minimize/restore; maximization uses the reclaimed bottom space', async ({ page }) => {
  const dialog = await openApp(page, 'My Resume');
  const title = dialog.locator('.window-title-bar');
  const titleBox = (await title.boundingBox())!;
  await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + 20);
  await page.mouse.down();
  await page.mouse.move(titleBox.x + titleBox.width / 2 + 60, titleBox.y + 50, { steps: 5 });
  await page.mouse.up();
  const corner = dialog.locator('.window-resize-handle').last();
  const cornerBox = (await corner.boundingBox())!;
  await page.mouse.move(cornerBox.x + 5, cornerBox.y + 5);
  await page.mouse.down();
  await page.mouse.move(cornerBox.x - 90, cornerBox.y - 90, { steps: 5 });
  await page.mouse.up();
  const before = (await dialog.boundingBox())!;
  expect(before.width).toBeLessThan(800);
  const scroll = dialog.locator('.custom-scroll');
  await scroll.evaluate((element) => { element.scrollTop = 450; });
  await dialog.getByRole('button', { name: 'Minimize window' }).click();
  await page.getByRole('button', { name: 'Restore My Resume' }).click();
  expect(await dialog.boundingBox()).toEqual(before);
  expect(await scroll.evaluate((element) => element.scrollTop)).toBe(450);
  await dialog.getByRole('button', { name: 'Maximize window' }).click();
  await expectInWorkspace(dialog, page);
  const taskbar = page.getByRole('navigation', { name: 'Open applications' });
  const taskbarBox = (await taskbar.boundingBox())!;
  const maxBox = (await dialog.boundingBox())!;
  expect(taskbarBox.x).toBeLessThanOrEqual(17);
  expect(taskbarBox.y).toBeLessThanOrEqual(17);
  expect(taskbarBox.y + taskbarBox.height).toBeLessThanOrEqual(maxBox.y);
  expect(maxBox.y + maxBox.height).toBeGreaterThan(page.viewportSize()!.height - 10);
  await dialog.getByRole('button', { name: 'Minimize window' }).click();
  await page.getByRole('button', { name: 'Restore My Resume' }).click();
  await expect(dialog.getByRole('button', { name: 'Restore window' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Restore window' }).click();
  expect(await dialog.boundingBox()).toEqual(before);
});

test('windows stay reachable after extreme dragging and viewport changes', async ({ page }) => {
  const dialog = await openApp(page, 'My Projects');
  const box = (await dialog.locator('.window-title-bar').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(-500, -500, { steps: 5 });
  await page.mouse.up();
  await expectInWorkspace(dialog, page);
  await page.setViewportSize({ width: 680, height: 430 });
  await expectInWorkspace(dialog, page);
  await dialog.getByRole('button', { name: 'Maximize window' }).click();
  await page.setViewportSize({ width: 1000, height: 700 });
  await expectInWorkspace(dialog, page);
  await dialog.getByRole('button', { name: 'Restore window' }).click();
  await expectInWorkspace(dialog, page);
});

test('repeated window activation keeps the taskbar clickable and content populated', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const name of ['About Me', 'My Resume', 'My Projects', 'Contact Me']) await openApp(page, name);
  for (let index = 0; index < 16; index++) {
    const name = index % 2 ? 'My Resume' : 'Contact Me';
    await page.getByRole('button', { name: `Show ${name}`, exact: true }).click();
    await expect(page.getByRole('button', { name: `Show ${name}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  const contact = page.getByRole('dialog', { name: 'Contact Me', exact: true });
  await expect(contact.getByRole('link', { name: 'debajitpal.380718@gmail.com' })).toHaveAttribute('href', 'mailto:debajitpal.380718@gmail.com');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('all open-app buttons stay clear of the header at intermediate widths', async ({ page }) => {
  for (const name of ['About Me', 'My Resume', 'My Projects', 'Contact Me', 'Terminal', 'BlockStack', 'ASCII-Cam']) {
    const dialog = await openApp(page, name);
    await dialog.getByRole('button', { name: 'Minimize window' }).click();
  }
  for (const width of [320, 640, 800, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const taskbar = page.getByRole('navigation', { name: 'Open applications' });
    const dock = (await taskbar.boundingBox())!;
    for (const element of await page.locator('main > header > *').all()) {
      const box = await element.boundingBox();
      if (!box || !await element.innerText()) continue;
      expect(dock.x + dock.width <= box.x || dock.x >= box.x + box.width || dock.y >= box.y + box.height || dock.y + dock.height <= box.y).toBe(true);
    }
    for (const button of await taskbar.getByRole('button').all()) await expect(button).toBeInViewport({ ratio: 1 });
  }
});

test('date and minute clock update across midnight without per-second polling', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 21, 23, 59, 58) });
  await page.reload();
  await expect(page.locator('main > header')).toContainText('21 Sep 2026');
  await page.clock.fastForward(3000);
  await expect(page.locator('main > header')).toContainText('22 Sep 2026');
  const time = await page.evaluate(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  await expect(page.locator('main > header')).toContainText(time);
});

test('narrow touch screens can read the entire résumé without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Open My Resume', exact: true }).tap();
  const dialog = page.getByRole('dialog', { name: 'My Resume', exact: true });
  await expectInWorkspace(dialog, page);
  await expect(dialog.getByRole('button', { name: 'Maximize window' })).toHaveCount(0);
  const scroll = dialog.locator('.custom-scroll');
  expect(await scroll.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(dialog.getByText('Game Dev Subcore Member')).toBeInViewport();
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
  await dialog.getByRole('button', { name: 'Minimize window' }).tap();
  await page.getByRole('button', { name: 'Restore My Resume' }).tap();
  await expect(dialog.getByText('Game Dev Subcore Member')).toBeInViewport();
  await page.setViewportSize({ width: 568, height: 320 });
  await expectInWorkspace(dialog, page);
  await context.close();
});

test('unsupported and rejected battery APIs fall back without runtime errors', async ({ browser }) => {
  for (const available of [false, true]) {
    const context = await browser.newContext();
    await context.addInitScript((available) => {
      Object.defineProperty(navigator, 'getBattery', {
        value: available ? () => Promise.reject(new Error('Battery unavailable')) : undefined,
        configurable: true,
      });
    }, available);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByLabel('Battery information unavailable')).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  }
});

test('battery updates are validated and Strict Mode keeps one subscription', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const battery = new EventTarget();
    let level = 0.6;
    const listeners = new Set<EventListenerOrEventListenerObject>();
    const add = battery.addEventListener.bind(battery);
    const remove = battery.removeEventListener.bind(battery);
    battery.addEventListener = (type, listener, options) => {
      if (type === 'levelchange' && listener) listeners.add(listener);
      add(type, listener, options);
    };
    battery.removeEventListener = (type, listener, options) => {
      if (type === 'levelchange' && listener) listeners.delete(listener);
      remove(type, listener, options);
    };
    Object.defineProperty(battery, 'level', { get: () => level });
    Object.defineProperty(navigator, 'getBattery', { value: async () => battery, configurable: true });
    window.addEventListener('test-battery-level', (event) => {
      level = (event as CustomEvent<number>).detail;
      battery.dispatchEvent(new Event('levelchange'));
      document.documentElement.dataset.batteryListeners = String(listeners.size);
    });
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByLabel('Battery: 60%')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-battery-level', { detail: 0.42 })));
  await expect(page.getByLabel('Battery: 42%')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-battery-listeners', '1');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-battery-level', { detail: NaN })));
  await expect(page.getByLabel('Battery information unavailable')).toBeVisible();
  await context.close();
});

test('closing during resize restores global pointer styles', async ({ page }) => {
  const dialog = await openApp(page, 'About Me');
  const corner = (await dialog.locator('.window-resize-handle').last().boundingBox())!;
  await page.mouse.move(corner.x + 5, corner.y + 5);
  await page.mouse.down();
  expect(await page.locator('body').evaluate((element) => element.style.userSelect)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await page.locator('body').evaluate((element) => element.style.userSelect)).toBe('');
  expect(await page.locator('body').evaluate((element) => element.style.cursor)).toBe('');
  await page.mouse.up();
});
