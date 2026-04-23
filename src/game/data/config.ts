import type { AsteroidSpawn, LevelConfig, StartPreviewAsteroid } from './types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MS_IN_SECOND = 1000;

export const PLAYER_WIDTH = 112;
export const PLAYER_HEIGHT = 166;
export const PLAYER_SPEED = 520;
export const PLAYER_START_Y = GAME_HEIGHT - 105;
export const PLAYER_PREVIEW_SCALE = 0.92;

export const PROJECTILE_RADIUS = 6;
export const PLAYER_PROJECTILE_SPEED = 820;
export const BOSS_PROJECTILE_SPEED = 360;
export const PLAYER_PROJECTILE_DIRECTION = { x: 0, y: -1 } as const;

export const ASTEROID_BASE_SIZE = 150;
export const ASTEROID_ROTATION_SPEED = 0.22;

export const LEVEL_ONE_CONFIG: LevelConfig = {
  key: 'level1',
  label: 'LEVEL 1',
  maxShots: 10,
  durationMs: 60_000,
};

export const LEVEL_TWO_CONFIG: LevelConfig = {
  key: 'level2',
  label: 'LEVEL 2 - BOSS',
  maxShots: 10,
  durationMs: 60_000,
};

export const ASTEROID_LAYOUT: AsteroidSpawn[] = [
  { x: 250, y: 290, scale: 1.06, rotation: -0.18 },
  { x: 405, y: 240, scale: 0.96, rotation: -0.08 },
  { x: 505, y: 185, scale: 1.03, rotation: 0.2 },
  { x: 840, y: 302, scale: 0.92, rotation: 0.09 },
  { x: 980, y: 205, scale: 0.98, rotation: -0.14 },
];

export const START_PREVIEW_ASTEROIDS: StartPreviewAsteroid[] = [
  { x: 140, y: 246, scale: 0.86, alpha: 0.78 },
  { x: 372, y: 176, scale: 0.74, alpha: 0.58 },
  { x: 530, y: 112, scale: 0.8, alpha: 0.6 },
  { x: 1000, y: 248, scale: 0.7, alpha: 0.42 },
  { x: 1180, y: 150, scale: 0.82, alpha: 0.76 },
];

export const START_PREVIEW_ANIMATION = {
  timeScale: 0.0022,
  rotationAmplitude: 0.03,
  floatFrequency: 0.8,
  floatAmplitude: 5,
} as const;

export const BACKGROUND_ANIMATION = {
  baseScrollSpeed: 8,
  glowScrollSpeedY: 18,
  glowScrollSpeedX: -6,
  glowAlpha: 0.08,
  glowScale: 0.92,
  glowOffsetX: 110,
  glowOffsetY: 56,
} as const;

export const BOSS_WIDTH = 300;
export const BOSS_HEIGHT = 176;
export const BOSS_START_Y = 132;
export const BOSS_HP = 4;
export const BOSS_SPEED = 210;
export const BOSS_SHOT_COOLDOWN_MS = 2_000;
export const BOSS_IDLE_DURATION_MS = 1_000;
export const BOSS_MOVE_DURATION_MS = 1_600;
export const BOSS_LEFT_BOUND = 220;
export const BOSS_RIGHT_BOUND = GAME_WIDTH - 220;
