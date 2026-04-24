import { Point, Sprite, type Texture } from 'pixi.js';
import {
  BOSS_HEIGHT,
  BOSS_HP,
  BOSS_IDLE_DURATION_MS,
  BOSS_LEFT_BOUND,
  BOSS_MOVE_DURATION_MS,
  BOSS_RIGHT_BOUND,
  BOSS_SHOT_COOLDOWN_MS,
  BOSS_SPEED,
  BOSS_WIDTH,
  MS_IN_SECOND,
} from '@data/config';
import type { BossState, Entity } from '@data/types';
import {
  BOSS_SHOT_OFFSET_RATIO,
  CENTER_ANCHOR,
  HIT_SCALE_X,
  HIT_SCALE_Y,
  IDLE_SCALE_LERP,
  NEGATIVE_DIRECTION,
  POSITIVE_DIRECTION,
} from './entity.constants';

export class BossEntity implements Entity {
  readonly sprite: Sprite;
  readonly state: BossState = {
    hp: BOSS_HP,
    maxHp: BOSS_HP,
    moveMode: 'idle',
    shotCooldown: BOSS_SHOT_COOLDOWN_MS,
    moveTimer: BOSS_IDLE_DURATION_MS,
    direction: POSITIVE_DIRECTION,
  };

  constructor(texture: Texture) {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(CENTER_ANCHOR);
    this.sprite.width = BOSS_WIDTH;
    this.sprite.height = BOSS_HEIGHT;
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  get hp() {
    return this.state.hp;
  }

  get maxHp() {
    return this.state.maxHp;
  }

  getShotOrigin() {
    return new Point(this.sprite.x, this.sprite.y + this.sprite.height * BOSS_SHOT_OFFSET_RATIO);
  }

  takeHit() {
    this.state.hp = Math.max(0, this.state.hp - 1);
    this.sprite.scale.set(HIT_SCALE_X, HIT_SCALE_Y);
  }

  update(deltaMs: number) {
    this.state.shotCooldown -= deltaMs;
    this.state.moveTimer -= deltaMs;

    if (this.state.moveMode === 'idle') {
      this.updateIdle();
      return;
    }

    this.updateMovement(deltaMs);
  }

  canShoot() {
    return this.state.shotCooldown <= 0;
  }

  resetShotCooldown() {
    this.state.shotCooldown = BOSS_SHOT_COOLDOWN_MS;
  }

  private updateIdle() {
    this.sprite.scale.x += (1 - this.sprite.scale.x) * IDLE_SCALE_LERP;
    this.sprite.scale.y += (1 - this.sprite.scale.y) * IDLE_SCALE_LERP;

    if (this.state.moveTimer <= 0) {
      this.state.moveMode = 'moving';
      this.state.moveTimer = BOSS_MOVE_DURATION_MS;
    }
  }

  private updateMovement(deltaMs: number) {
    this.sprite.x += this.state.direction * BOSS_SPEED * (deltaMs / MS_IN_SECOND);

    if (this.sprite.x <= BOSS_LEFT_BOUND) {
      this.sprite.x = BOSS_LEFT_BOUND;
      this.state.direction = POSITIVE_DIRECTION;
    } else if (this.sprite.x >= BOSS_RIGHT_BOUND) {
      this.sprite.x = BOSS_RIGHT_BOUND;
      this.state.direction = NEGATIVE_DIRECTION;
    }

    if (this.state.moveTimer <= 0) {
      this.state.moveMode = 'idle';
      this.state.moveTimer = BOSS_IDLE_DURATION_MS;
      this.state.direction *= NEGATIVE_DIRECTION;
    }
  }
}
