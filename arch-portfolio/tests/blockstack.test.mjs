import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BOARD_HEIGHT, BOARD_WIDTH, PIECE_TYPES, canPlace, createGame, emptyBoard, fallInterval, gameReducer, getGhostPiece, getPieceCells, isGrounded, spawnPiece } from '../src/games/blockstack.ts';

test('seeded seven-bag generation is reproducible and each bag contains every piece', () => {
  assert.deepEqual(createGame(1234), createGame(1234));
  let state = createGame(1234);
  const sequence = [];
  for (let index = 0; index < 28; index++) {
    sequence.push(state.piece.type);
    state = gameReducer({ ...state, board: emptyBoard() }, { type: 'hardDrop' });
  }
  for (let index = 0; index < sequence.length; index += 7) {
    assert.deepEqual([...sequence.slice(index, index + 7)].sort(), [...PIECE_TYPES].sort());
  }
});

test('movement respects walls and locked cells without mutating the previous board', () => {
  const state = { ...createGame(1), piece: { type: 'O', rotation: 0, x: -1, y: 2 } };
  assert.ok(canPlace(state.board, state.piece));
  assert.equal(gameReducer(state, { type: 'move', direction: -1 }), state);
  const moved = gameReducer(state, { type: 'move', direction: 1 });
  assert.equal(moved.piece.x, 0);
  assert.equal(state.piece.x, -1);
  const board = emptyBoard();
  board[2][3] = 'J';
  const blocked = { ...moved, board };
  assert.equal(gameReducer(blocked, { type: 'move', direction: 1 }), blocked);
  assert.equal(canPlace(board, { type: 'O', rotation: 0, x: 3, y: 19 }), false);
});

test('wall and floor kicks rotate T and I pieces while blocked rotations fail', () => {
  const state = createGame(1);
  const atWall = { ...state, piece: { type: 'T', rotation: 1, x: -1, y: 5 } };
  const wallKick = gameReducer(atWall, { type: 'rotate', direction: 1 });
  assert.equal(wallKick.piece.rotation, 2);
  assert.equal(wallKick.piece.x, 0);
  assert.ok(canPlace(wallKick.board, wallKick.piece));

  const floorKick = gameReducer({ ...state, piece: { type: 'T', rotation: 0, x: 3, y: 18 } }, { type: 'rotate', direction: 1 });
  assert.equal(floorKick.piece.rotation, 1);
  assert.equal(floorKick.piece.y, 17);
  assert.ok(canPlace(floorKick.board, floorKick.piece));

  const iKick = gameReducer({ ...state, piece: { type: 'I', rotation: 1, x: 7, y: 4 } }, { type: 'rotate', direction: 1 });
  assert.equal(iKick.piece.x, 6);
  assert.equal(iKick.piece.rotation, 2);
  const trapped = { ...state, board: emptyBoard().map((row) => row.map(() => 'J')), piece: { type: 'T', rotation: 0, x: 3, y: 6 } };
  getPieceCells(trapped.piece).forEach(({ x, y }) => { trapped.board[y][x] = null; });
  assert.ok(canPlace(trapped.board, trapped.piece));
  assert.equal(gameReducer(trapped, { type: 'rotate', direction: 1 }), trapped);
});

test('soft and hard drops score distance; the landing guide matches the locked cells', () => {
  const state = { ...createGame(2), piece: spawnPiece('T') };
  const soft = gameReducer(state, { type: 'softDrop' });
  assert.equal(soft.score, 1);
  assert.equal(soft.piece.y, state.piece.y + 1);
  const ghost = getGhostPiece(soft);
  assert.ok(!canPlace(soft.board, { ...ghost, y: ghost.y + 1 }));
  const dropped = gameReducer(soft, { type: 'hardDrop' });
  assert.equal(dropped.score, 1 + (ghost.y - soft.piece.y) * 2);
  assert.equal(dropped.lockedPieces, 1);
  getPieceCells(ghost).forEach(({ x, y }) => assert.equal(dropped.board[y][x], 'T'));
  assert.ok(state.board.flat().every((cell) => cell === null));
});

test('line clears collapse rows and level up every ten lines with correct scoring', () => {
  const board = emptyBoard();
  board[19] = Array.from({ length: BOARD_WIDTH }, (_, x) => x >= 3 && x <= 6 ? null : 'J');
  board[18][0] = 'S';
  const state = { ...createGame(3), board, piece: { type: 'I', rotation: 0, x: 3, y: 18 }, lines: 9 };
  const cleared = gameReducer(state, { type: 'hardDrop' });
  assert.equal(cleared.lines, 10);
  assert.equal(cleared.level, 2);
  assert.equal(cleared.score, 100);
  assert.equal(cleared.lastClear, 1);
  assert.equal(cleared.board[19][0], 'S');
  assert.ok(cleared.board[0].every((cell) => cell === null));
  assert.equal(cleared.board.length, BOARD_HEIGHT);
  assert.ok(fallInterval(2) < fallInterval(1));
  assert.ok(fallInterval(100) >= 80);

  const fourRows = emptyBoard();
  for (let y = 16; y < 20; y++) fourRows[y] = Array.from({ length: BOARD_WIDTH }, (_, x) => x === 4 ? null : 'L');
  const four = gameReducer({ ...createGame(4), board: fourRows, piece: { type: 'I', rotation: 1, x: 2, y: 16 } }, { type: 'hardDrop' });
  assert.equal(four.lines, 4);
  assert.equal(four.score, 800);
  assert.ok(four.board.flat().every((cell) => cell === null));
});

test('hold is limited to once per piece and swapping resets the held piece orientation', () => {
  const state = { ...createGame(5), piece: { type: 'T', rotation: 2, x: 5, y: 7 } };
  const held = gameReducer(state, { type: 'hold' });
  assert.equal(held.held, 'T');
  assert.equal(held.piece.type, state.queue[0]);
  assert.equal(held.canHold, false);
  assert.equal(gameReducer(held, { type: 'hold' }), held);
  const locked = gameReducer(held, { type: 'hardDrop' });
  assert.equal(locked.canHold, true);
  const swapped = gameReducer(locked, { type: 'hold' });
  assert.deepEqual(swapped.piece, spawnPiece('T'));
  assert.deepEqual(swapped.queue, locked.queue);
});

test('grounded pieces wait for lock, and movement lock-delay resets are capped', () => {
  let state = { ...createGame(6), piece: { type: 'O', rotation: 0, x: 3, y: 18 } };
  assert.ok(isGrounded(state));
  assert.equal(gameReducer(state, { type: 'gravity' }), state);
  assert.equal(gameReducer(createGame(6), { type: 'lock' }).lockedPieces, 0);
  for (let index = 0; index < 30; index++) state = gameReducer(state, { type: 'move', direction: index % 2 ? 1 : -1 });
  assert.equal(state.lockResets, 15);
  assert.equal(gameReducer(state, { type: 'lock' }).lockedPieces, 1);
});

test('blocked spawns and locking above the board end the game; paused games ignore moves', () => {
  const board = emptyBoard();
  board[0][4] = 'J';
  const state = { ...createGame(7), board, queue: ['T', ...createGame(7).queue], piece: { type: 'O', rotation: 0, x: 3, y: 18 } };
  const over = gameReducer(state, { type: 'hardDrop' });
  assert.equal(over.status, 'gameover');
  assert.equal(gameReducer(over, { type: 'hardDrop' }), over);
  const topBoard = emptyBoard();
  topBoard[1][3] = 'J';
  const top = { ...createGame(8), board: topBoard, piece: { type: 'T', rotation: 0, x: 3, y: -1 } };
  assert.ok(isGrounded(top));
  assert.equal(gameReducer(top, { type: 'lock' }).status, 'gameover');
  const paused = gameReducer(createGame(9), { type: 'pause', reason: 'away' });
  assert.equal(paused.pauseReason, 'away');
  assert.equal(gameReducer(paused, { type: 'gravity' }), paused);
  assert.equal(gameReducer(paused, { type: 'move', direction: 1 }), paused);
  assert.equal(gameReducer(paused, { type: 'resume' }).status, 'playing');
});
