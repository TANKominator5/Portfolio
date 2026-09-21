import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    cameraStreams: MediaStream[];
    cameraRequests: number;
    drawnCharacters: string[];
    drawnColors: string[];
    resolveCamera?: () => Promise<void>;
  }
}

test.use({
  channel: 'chromium',
  permissions: ['camera'],
  launchOptions: { args: ['--use-fake-device-for-media-stream'] },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.cameraStreams = [];
    window.cameraRequests = 0;
    window.drawnCharacters = [];
    window.drawnColors = [];
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      window.cameraRequests++;
      const stream = await getUserMedia(constraints);
      window.cameraStreams.push(stream);
      return stream;
    };
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      if (!window.drawnCharacters.includes(args[0])) window.drawnCharacters.push(args[0]);
      if (typeof this.fillStyle === 'string' && window.drawnColors.length < 100 && !window.drawnColors.includes(this.fillStyle)) window.drawnColors.push(this.fillStyle);
      fillText.apply(this, args);
    };
  });
});

async function openCamera(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open ASCII-Cam', exact: true }).click();
  const app = page.getByRole('dialog', { name: 'ASCII-Cam', exact: true });
  const canvas = app.getByRole('img', { name: 'Live webcam rendered as ASCII characters' });
  return { app, canvas };
}

test('camera starts only on request and renders real frames as configurable characters', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const { app, canvas } = await openCamera(page);
  expect(await page.evaluate(() => window.cameraRequests)).toBe(0);
  await app.getByRole('button', { name: 'Start camera', exact: true }).click();
  await expect(app.getByRole('status')).toContainText('LIVE', { timeout: 15000 });
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(2);
  expect(await page.evaluate(() => window.cameraStreams[0].getAudioTracks().length)).toBe(0);
  expect(await canvas.evaluate((element: HTMLCanvasElement) => {
    const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data;
    return pixels.some((value, index) => index % 4 === 1 && value > 60);
  })).toBe(true);

  await app.getByRole('button', { name: 'Show settings', exact: true }).click();
  await app.getByRole('combobox', { name: 'Style', exact: true }).selectOption('dots');
  await page.evaluate(() => { window.drawnCharacters = []; });
  await expect.poll(() => page.evaluate(() => window.drawnCharacters)).toEqual(['.']);
  await app.getByRole('combobox', { name: 'Style', exact: true }).selectOption('custom');
  await app.getByLabel('Characters', { exact: true }).fill('X');
  await page.evaluate(() => { window.drawnCharacters = []; });
  await expect.poll(() => page.evaluate(() => window.drawnCharacters)).toEqual(['X']);
  await app.getByRole('combobox', { name: 'Color', exact: true }).selectOption('custom');
  await app.getByLabel('Tint', { exact: true }).fill('#ef4444');
  await page.evaluate(() => { window.drawnColors = []; });
  await expect.poll(() => page.evaluate(() => window.drawnColors)).toEqual(['#ef4444']);
  await app.getByRole('combobox', { name: 'Color', exact: true }).selectOption('camera');
  await app.getByRole('combobox', { name: 'Style', exact: true }).selectOption('binary');
  await page.evaluate(() => { window.drawnCharacters = []; window.drawnColors = []; });
  await expect.poll(() => page.evaluate(() => window.drawnCharacters.includes('1'))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.drawnColors.length)).toBeGreaterThan(1);
  await app.getByLabel('Mirror', { exact: true }).uncheck();
  await app.getByLabel('Invert', { exact: true }).check();
  await app.getByRole('combobox', { name: 'Detail', exact: true }).selectOption('160');
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(2);
  await app.getByRole('button', { name: 'Stop camera' }).click();
  await expect(canvas).toBeHidden();
  expect(await page.evaluate(() => window.cameraStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended')))).toBe(true);
  expect(errors).toEqual([]);
});

test('minimizing, hiding the tab, and closing release the camera and require explicit restart', async ({ page }) => {
  const { app } = await openCamera(page);
  await app.getByRole('button', { name: 'Start camera' }).click();
  await expect(app.getByRole('status')).toContainText('LIVE', { timeout: 15000 });
  await app.getByRole('button', { name: 'Minimize window' }).click();
  await expect.poll(() => page.evaluate(() => window.cameraStreams[0].getVideoTracks()[0].readyState)).toBe('ended');
  await page.getByRole('button', { name: 'Restore ASCII-Cam' }).click();
  await expect(app.getByRole('button', { name: 'Start camera' })).toBeVisible();
  expect(await page.evaluate(() => window.cameraRequests)).toBe(1);
  await app.getByRole('button', { name: 'Start camera' }).click();
  await expect(app.getByRole('status')).toContainText('LIVE', { timeout: 15000 });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(app.getByRole('status')).toContainText('tab was hidden');
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; });
  await app.getByRole('button', { name: 'Start camera' }).click();
  await expect(app.getByRole('status')).toContainText('LIVE', { timeout: 15000 });
  await app.getByRole('button', { name: 'Close window' }).click();
  await expect.poll(() => page.evaluate(() => window.cameraStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended')))).toBe(true);
});

test('denied, unavailable, and busy cameras show an actionable error with retry', async ({ page }) => {
  const { app } = await openCamera(page);
  for (const [name, message] of [
    ['NotAllowedError', 'Camera access denied'],
    ['NotFoundError', 'No camera found'],
    ['NotReadableError', 'in use by another application'],
  ]) {
    await page.evaluate((name) => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Camera error', name));
    }, name);
    await app.getByRole('button', { name: 'Start camera' }).click();
    await expect(app.getByRole('status')).toContainText(message);
    await expect(app.getByRole('button', { name: 'Start camera' })).toBeEnabled();
  }
});

test('closing while permission is pending releases a late-arriving stream', async ({ page }) => {
  const { app } = await openCamera(page);
  await page.evaluate(() => {
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints) => new Promise((resolve, reject) => {
      window.resolveCamera = async () => {
        try { resolve(await getUserMedia(constraints)); } catch (error) { reject(error); }
      };
    });
  });
  await app.getByRole('button', { name: 'Start camera' }).click();
  await expect(app.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  await app.getByRole('button', { name: 'Close window' }).click();
  await page.evaluate(() => window.resolveCamera!());
  await expect.poll(() => page.evaluate(() => window.cameraStreams[0]?.getVideoTracks()[0].readyState)).toBe('ended');
});

test('camera preview and appearance settings fit a narrow screen and resize', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { app, canvas } = await openCamera(page);
  await app.getByRole('button', { name: 'Start camera' }).click();
  await expect(app.getByRole('status')).toContainText('LIVE', { timeout: 15000 });
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(2);
  await expect(canvas).toBeInViewport({ ratio: 1 });
  await app.getByRole('button', { name: 'Show settings', exact: true }).click();
  await app.getByRole('combobox', { name: 'Style', exact: true }).selectOption('custom');
  await app.getByLabel('Characters', { exact: true }).fill('.');
  await app.getByRole('combobox', { name: 'Color', exact: true }).selectOption('custom');
  await app.getByRole('button', { name: 'Hide settings', exact: true }).click();
  await expect(app.getByRole('combobox', { name: 'Style', exact: true })).toBeHidden();
  await expect(app.getByRole('button', { name: 'Show settings', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await app.getByRole('button', { name: 'Show settings', exact: true }).click();
  await expect(app.getByLabel('Characters', { exact: true })).toHaveValue('.');
  expect(await page.evaluate(() => window.cameraRequests)).toBe(1);
  await app.getByRole('button', { name: 'Hide settings', exact: true }).click();
  expect(await app.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.setViewportSize({ width: 1200, height: 800 });
  await app.getByRole('button', { name: 'Maximize window' }).click();
  await expect(canvas).toBeInViewport({ ratio: 1 });
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(2);
});
