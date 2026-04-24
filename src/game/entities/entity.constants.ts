import { PROJECTILE_RADIUS } from '@data/config';

export const CENTER_ANCHOR = 0.5;
export const FULL_WIDTH = 2;
export const NORMALIZED_FALLBACK = 1;
export const PLAYER_SHOT_OFFSET_RATIO = 0.48;
export const BOSS_SHOT_OFFSET_RATIO = 0.34;
export const HIT_SCALE_X = 1.03;
export const HIT_SCALE_Y = 0.98;
export const IDLE_SCALE_LERP = 0.18;
export const POSITIVE_DIRECTION = 1;
export const NEGATIVE_DIRECTION = -1;
export const PROJECTILE_CULL_PADDING_X = 40;
export const PROJECTILE_CULL_PADDING_TOP = 60;
export const PROJECTILE_CULL_PADDING_BOTTOM = 60;

export const PLAYER_PROJECTILE_SHAPE = {
  x: -PROJECTILE_RADIUS,
  y: -18,
  width: PROJECTILE_RADIUS * FULL_WIDTH,
  height: 36,
  strokeWidth: 1.5,
} as const;

export const BOSS_PROJECTILE_SHAPE = {
  radius: PROJECTILE_RADIUS + 2,
  strokeWidth: 2,
  stemX: -3,
  stemY: -12,
  stemWidth: 6,
  stemHeight: 24,
  stemRadius: 3,
  stemAlpha: 0.9,
} as const;
