import type { Container } from 'pixi.js';

export type GameState = 'start' | 'level1' | 'level2' | 'win' | 'lose';
export type ProjectileOwner = 'player' | 'boss';
export type BossMoveMode = 'idle' | 'moving';

export interface BoundsLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity {
  sprite: Container;
  readonly bounds: BoundsLike;
  update(deltaMs: number): void;
}

export interface Projectile extends Entity {
  owner: ProjectileOwner;
  speed: number;
  active: boolean;
}

export interface BossState {
  hp: number;
  maxHp: number;
  moveMode: BossMoveMode;
  shotCooldown: number;
  moveTimer: number;
  direction: number;
}

export interface LevelConfig {
  key: 'level1' | 'level2';
  label: string;
  maxShots: number;
  durationMs: number;
}

export interface AsteroidSpawn {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface StartPreviewAsteroid {
  x: number;
  y: number;
  scale: number;
  alpha: number;
}
