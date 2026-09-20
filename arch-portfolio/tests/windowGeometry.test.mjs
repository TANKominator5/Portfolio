import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fitWindow, resizeWindow } from '../src/components/windowGeometry.ts';

test('oversized and off-screen windows fit a smaller workspace, even below minimum size', () => {
  assert.deepEqual(fitWindow({ x: 900, y: -100, w: 800, h: 600 }, { w: 280, h: 180 }), {
    x: 0, y: 0, w: 280, h: 180,
  });
  assert.deepEqual(fitWindow({ x: 900, y: 600, w: 320, h: 220 }, { w: 1000, h: 700 }), {
    x: 680, y: 480, w: 320, h: 220,
  });
});

test('north/west resizing preserves the opposite edge at minimum size and workspace boundaries', () => {
  const rect = { x: 100, y: 100, w: 600, h: 400 };
  const bounds = { w: 1000, h: 700 };
  assert.deepEqual(resizeWindow(rect, 'nw', 1000, 1000, bounds), { x: 380, y: 280, w: 320, h: 220 });
  assert.deepEqual(resizeWindow(rect, 'nw', -1000, -1000, bounds), { x: 0, y: 0, w: 700, h: 500 });
});

test('all resize directions keep the window inside its workspace', () => {
  const bounds = { w: 1000, h: 700 };
  for (const direction of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
    for (const dx of [-2000, -100, 0, 100, 2000]) {
      for (const dy of [-2000, -100, 0, 100, 2000]) {
        const rect = resizeWindow({ x: 100, y: 100, w: 600, h: 400 }, direction, dx, dy, bounds);
        assert.ok(rect.x >= 0 && rect.y >= 0);
        assert.ok(rect.w >= 320 && rect.h >= 220);
        assert.ok(rect.x + rect.w <= bounds.w && rect.y + rect.h <= bounds.h);
      }
    }
  }
});
