export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const LOCK_DELAY = 450;
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
export type PieceType = typeof PIECE_TYPES[number];
export type Cell = PieceType | null;
export type Board = Cell[][];
export type Rotation = 0 | 1 | 2 | 3;
export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';
export interface Point { x: number; y: number }
export interface Piece extends Point { type: PieceType; rotation: Rotation }

export interface GameState {
  board: Board;
  piece: Piece;
  queue: PieceType[];
  seed: number;
  held: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  lockedPieces: number;
  pieceId: number;
  lockResets: number;
  lastClear: number;
  status: GameStatus;
  pauseReason: 'manual' | 'away' | null;
}

export type GameAction =
  | { type: 'start'; seed: number }
  | { type: 'move'; direction: -1 | 1 }
  | { type: 'rotate'; direction: -1 | 1 }
  | { type: 'gravity' | 'softDrop' | 'hardDrop' | 'hold' | 'lock' | 'resume' }
  | { type: 'pause'; reason?: 'manual' | 'away' };

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#67e8f9', O: '#fde68a', T: '#c084fc', S: '#86efac',
  Z: '#fda4af', J: '#93c5fd', L: '#fdba74',
};

const SHAPES: Record<PieceType, readonly (readonly [number, number])[]> = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]],
  O: [[1, 0], [2, 0], [1, 1], [2, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};

type Kicks = Record<string, readonly (readonly [number, number])[]>;
// Standard rotation-system kicks, expressed in screen coordinates (positive y is down).
const NORMAL_KICKS: Kicks = {
  '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};
const I_KICKS: Kicks = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(null));
}

function refillQueue(queue: PieceType[], initialSeed: number) {
  let seed = initialSeed >>> 0 || 1;
  if (queue.length >= 7) return { queue, seed };
  const bag: PieceType[] = [...PIECE_TYPES];
  for (let index = bag.length - 1; index > 0; index--) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    const swap = Math.floor(seed / 0x100000000 * (index + 1));
    [bag[index], bag[swap]] = [bag[swap], bag[index]];
  }
  return { queue: [...queue, ...bag], seed };
}

export function spawnPiece(type: PieceType): Piece {
  return { type, x: 3, y: 0, rotation: 0 };
}

export function createGame(seed: number, status: GameStatus = 'playing'): GameState {
  const firstBag = refillQueue([], seed);
  return {
    board: emptyBoard(), piece: spawnPiece(firstBag.queue[0]),
    ...refillQueue(firstBag.queue.slice(1), firstBag.seed),
    held: null, canHold: true, score: 0, lines: 0, level: 1,
    lockedPieces: 0, pieceId: 0, lockResets: 0, lastClear: 0, status, pauseReason: null,
  };
}

export function getPieceCells(piece: Piece): Point[] {
  return SHAPES[piece.type].map(([originalX, originalY]) => {
    let x = originalX;
    let y = originalY;
    const size = piece.type === 'I' ? 4 : 3;
    if (piece.type !== 'O') {
      for (let turn = 0; turn < piece.rotation; turn++) [x, y] = [size - 1 - y, x];
    }
    return { x: piece.x + x, y: piece.y + y };
  });
}

export function canPlace(board: Board, piece: Piece) {
  return getPieceCells(piece).every(({ x, y }) => x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT && (y < 0 || board[y][x] === null));
}

export function isGrounded(state: GameState) {
  return !canPlace(state.board, { ...state.piece, y: state.piece.y + 1 });
}

export function getGhostPiece(state: GameState): Piece {
  let piece = state.piece;
  while (canPlace(state.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 };
  return piece;
}

export function fallInterval(level: number) {
  return Math.max(80, Math.round(800 * Math.pow(0.8, level - 1)));
}

function reposition(state: GameState, piece: Piece): GameState {
  if (!canPlace(state.board, piece)) return state;
  return { ...state, piece, lockResets: isGrounded(state) ? Math.min(15, state.lockResets + 1) : state.lockResets };
}

function lockPiece(state: GameState): GameState {
  const cells = getPieceCells(state.piece);
  if (cells.some(({ y }) => y < 0)) return { ...state, status: 'gameover' };
  const board = state.board.map((row) => [...row]);
  cells.forEach(({ x, y }) => { board[y][x] = state.piece.type; });
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - remaining.length;
  const nextBoard = [...Array.from({ length: cleared }, () => Array<Cell>(BOARD_WIDTH).fill(null)), ...remaining];
  const piece = spawnPiece(state.queue[0]);
  const lines = state.lines + cleared;
  return {
    ...state, board: nextBoard, piece, ...refillQueue(state.queue.slice(1), state.seed),
    lines, level: Math.floor(lines / 10) + 1,
    score: state.score + [0, 100, 300, 500, 800][cleared] * state.level,
    lockedPieces: state.lockedPieces + 1, pieceId: state.pieceId + 1,
    lockResets: 0, canHold: true, lastClear: cleared,
    status: canPlace(nextBoard, piece) ? 'playing' : 'gameover',
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'start') return createGame(action.seed);
  if (action.type === 'pause') return state.status === 'playing' ? { ...state, status: 'paused', pauseReason: action.reason ?? 'manual' } : state;
  if (action.type === 'resume') return state.status === 'paused' ? { ...state, status: 'playing', pauseReason: null } : state;
  if (state.status !== 'playing') return state;

  switch (action.type) {
    case 'move':
      return reposition(state, { ...state.piece, x: state.piece.x + action.direction });
    case 'rotate': {
      if (state.piece.type === 'O') return state;
      const rotation = (state.piece.rotation + action.direction + 4) % 4 as Rotation;
      const kicks = (state.piece.type === 'I' ? I_KICKS : NORMAL_KICKS)[`${state.piece.rotation}>${rotation}`];
      for (const [x, y] of kicks) {
        const candidate = { ...state.piece, rotation, x: state.piece.x + x, y: state.piece.y + y };
        if (canPlace(state.board, candidate)) return reposition(state, candidate);
      }
      return state;
    }
    case 'gravity':
    case 'softDrop': {
      const piece = { ...state.piece, y: state.piece.y + 1 };
      return canPlace(state.board, piece) ? { ...state, piece, score: state.score + (action.type === 'softDrop' ? 1 : 0) } : state;
    }
    case 'hardDrop': {
      const piece = getGhostPiece(state);
      return lockPiece({ ...state, piece, score: state.score + (piece.y - state.piece.y) * 2 });
    }
    case 'lock':
      return isGrounded(state) ? lockPiece(state) : state;
    case 'hold': {
      if (!state.canHold) return state;
      const piece = spawnPiece(state.held ?? state.queue[0]);
      return {
        ...state, ...(state.held ? {} : refillQueue(state.queue.slice(1), state.seed)),
        piece, held: state.piece.type, canHold: false, pieceId: state.pieceId + 1, lockResets: 0,
        status: canPlace(state.board, piece) ? 'playing' : 'gameover',
      };
    }
  }
}
