import { expect, test, type Page } from '@playwright/test';

async function openGame(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open BlockStack', exact: true }).click();
  const game = page.getByRole('dialog', { name: 'BlockStack', exact: true });
  const board = game.getByRole('application', { name: 'BlockStack game board' });
  await expect(board).toBeVisible();
  return { game, board, state: game.locator('[data-state]') };
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('keyboard launch, movement, rotation, hard drop, and gravity work', async ({ page }) => {
  const { game, board, state } = await openGame(page);
  await expect(board).toBeFocused();
  await board.press('Enter');
  await expect(state).toHaveAttribute('data-state', 'playing');
  await expect(board.locator('[data-cell="active"]')).toHaveCount(4);
  await expect(board.locator('[data-cell="ghost"]')).toHaveCount(4);
  await board.press('ArrowLeft');
  await expect(board).toHaveAttribute('data-x', '2');
  await board.press('ArrowRight');
  await expect(board).toHaveAttribute('data-x', '3');
  if (await board.getAttribute('data-piece') === 'O') await board.press('c');
  await board.press('ArrowUp');
  await expect(board).toHaveAttribute('data-rotation', '1');
  await board.press('z');
  await expect(board).toHaveAttribute('data-rotation', '0');
  await board.press('ArrowDown');
  await expect(game.getByTestId('blockstack-score')).toHaveText('000001');
  await board.press('Space');
  await expect(board).toHaveAttribute('data-locked', '1');
  await expect(board.locator('[data-cell="locked"]')).toHaveCount(4);
  expect(Number(await game.getByTestId('blockstack-score').innerText())).toBeGreaterThan(1);
  await expect.poll(async () => Number(await board.getAttribute('data-y'))).toBeGreaterThan(0);
});

test('hold is limited per piece and Escape pauses the game instead of closing its window', async ({ page }) => {
  const { game, board, state } = await openGame(page);
  await game.getByRole('button', { name: 'Start game', exact: true }).click();
  const original = await board.getAttribute('data-piece');
  await board.press('c');
  await expect(game.getByRole('img', { name: `Held piece: ${original}` })).toBeVisible();
  await expect(game.getByRole('button', { name: 'Hold piece' })).toBeDisabled();
  const next = await board.getAttribute('data-piece');
  await board.press('c');
  await expect(board).toHaveAttribute('data-piece', next!);
  await board.press('Escape');
  await expect(game).toBeVisible();
  await expect(state).toHaveAttribute('data-state', 'paused');
  const y = await board.getAttribute('data-y');
  await page.waitForTimeout(1000);
  await expect(board).toHaveAttribute('data-y', y!);
  await board.press('Space');
  await expect(board).toHaveAttribute('data-locked', '0');
  await board.press('p');
  await expect(state).toHaveAttribute('data-state', 'playing');
  await board.press('Space');
  await expect(game.getByRole('button', { name: 'Hold piece' })).toBeEnabled();
});

test('minimize, app switching, and browser blur pause safely without losing the stack', async ({ page }) => {
  const { game, board, state } = await openGame(page);
  await board.press('Enter');
  await board.press('Space');
  const score = await game.getByTestId('blockstack-score').innerText();
  await game.getByRole('button', { name: 'Minimize window' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Restore BlockStack', exact: true }).click();
  await expect(state).toHaveAttribute('data-state', 'paused');
  await expect(board).toHaveAttribute('data-locked', '1');
  await expect(game.getByTestId('blockstack-score')).toHaveText(score);
  await game.getByRole('button', { name: 'Continue game', exact: true }).click();
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
  const terminal = page.getByRole('dialog', { name: 'Terminal', exact: true });
  const input = terminal.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('about');
  await input.press('Enter');
  await expect(state).toHaveAttribute('data-state', 'paused');
  await expect(board).toHaveAttribute('data-locked', '1');
  await page.getByRole('button', { name: 'Show BlockStack', exact: true }).click();
  await game.getByRole('button', { name: 'Continue game', exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(state).toHaveAttribute('data-state', 'paused');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await game.getByRole('button', { name: 'Continue game', exact: true }).click();
  await expect(state).toHaveAttribute('data-state', 'playing');
});

test('game over can be restarted and the best score survives reopening', async ({ page }) => {
  const { game, board, state } = await openGame(page);
  await board.press('Enter');
  for (let piece = 0; piece < 40 && await state.getAttribute('data-state') === 'playing'; piece++) {
    await board.press('Space');
  }
  await expect(state).toHaveAttribute('data-state', 'gameover');
  const score = Number(await game.getByTestId('blockstack-score').innerText());
  expect(score).toBeGreaterThan(0);
  await expect.poll(async () => Number(await game.getByTestId('blockstack-best').innerText())).toBeGreaterThanOrEqual(score);
  await game.getByRole('button', { name: 'Play again', exact: true }).click();
  await expect(state).toHaveAttribute('data-state', 'playing');
  await expect(board).toHaveAttribute('data-locked', '0');
  await expect(game.getByTestId('blockstack-score')).toHaveText('000000');
  await game.getByRole('button', { name: 'Close window' }).click();
  await page.getByRole('button', { name: 'Open BlockStack', exact: true }).click();
  await expect(state).toHaveAttribute('data-state', 'ready');
  expect(Number(await game.getByTestId('blockstack-best').innerText())).toBeGreaterThanOrEqual(score);
});

test('holding a movement button repeats and releasing it stops horizontal movement', async ({ page }) => {
  const { game, board } = await openGame(page);
  await board.press('Enter');
  const button = game.getByRole('button', { name: 'Move left', exact: true });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(400);
  await page.mouse.up();
  const x = Number(await board.getAttribute('data-x'));
  expect(x).toBeLessThan(2);
  await page.waitForTimeout(200);
  await expect(board).toHaveAttribute('data-x', String(x));
  await game.getByRole('button', { name: 'Restart game', exact: true }).click();
  await expect(board).toHaveAttribute('data-x', '3');
  await expect(game.getByTestId('blockstack-score')).toHaveText('000000');
});

test('a narrow touch screen can play, pause, and restore without horizontal overflow', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const { game, board, state } = await openGame(page);
  await game.getByRole('button', { name: 'Start game', exact: true }).tap();
  const hardDrop = game.getByRole('button', { name: 'Hard drop', exact: true });
  await expect(hardDrop).toBeInViewport();
  await game.getByRole('button', { name: 'Move left', exact: true }).tap();
  await expect(board).toHaveAttribute('data-x', '2');
  await hardDrop.tap();
  await expect(board).toHaveAttribute('data-locked', '1');
  await game.getByRole('button', { name: 'Pause game', exact: true }).tap();
  await expect(state).toHaveAttribute('data-state', 'paused');
  await game.getByRole('button', { name: 'Minimize window' }).tap();
  await page.getByRole('button', { name: 'Restore BlockStack', exact: true }).tap();
  await expect(board).toHaveAttribute('data-locked', '1');
  await game.getByRole('button', { name: 'Continue game', exact: true }).tap();
  expect(await game.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 568, height: 320 });
  await expect(hardDrop).toBeEnabled();
  await hardDrop.tap();
  await expect(board).toHaveAttribute('data-locked', '2');
  await context.close();
});

test('blocked browser storage does not prevent a game from starting or scoring', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'blockstack:best:v1') throw new Error('Storage unavailable');
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'blockstack:best:v1') throw new Error('Storage unavailable');
      return set.call(this, key, value);
    };
  });
  const { game, board } = await openGame(page);
  await board.press('Enter');
  await board.press('Space');
  expect(Number(await game.getByTestId('blockstack-best').innerText())).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
