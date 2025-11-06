export const MAX_ROWS = 6;
export const MAX_COLS = 6;
export const TILE_BASE_W = 24;
export const TILE_BASE_H = 24;

export const SNAPSHOT_TARGET = 432; // preferred canvas size (square)
export const SNAPSHOT_ALT = 576;    // premium
export const SNAPSHOT_MAX_BYTES = 180_000;
export const SNAPSHOT_GOAL_MAX = 80_000; // soft target
export const SNAPSHOT_GOAL_TYPICAL = 60_000;

export const COLLAGE_SIZE_CHOICES = [SNAPSHOT_TARGET, SNAPSHOT_ALT] as const;

