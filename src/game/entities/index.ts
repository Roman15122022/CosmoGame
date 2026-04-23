import { Graphics, Point, Sprite, type Texture } from 'pixi.js';
import {
  ASTEROID_BASE_SIZE,
  ASTEROID_ROTATION_SPEED,
  BOSS_HEIGHT,
  BOSS_HP,
  BOSS_IDLE_DURATION_MS,
  BOSS_LEFT_BOUND,
  BOSS_MOVE_DURATION_MS,
  BOSS_PROJECTILE_SPEED,
  BOSS_RIGHT_BOUND,
  BOSS_SHOT_COOLDOWN_MS,
  BOSS_SPEED,
  BOSS_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  MS_IN_SECOND,
  PLAYER_HEIGHT,
  PLAYER_PROJECTILE_SPEED,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  PROJECTILE_RADIUS,
} from '../data/config';
import type { BossState, Entity, Projectile, ProjectileOwner } from '../data/types';

const CENTER_ANCHOR = 0.5;
const FULL_WIDTH = 2;
const NORMALIZED_FALLBACK = 1;
const PLAYER_SHOT_OFFSET_RATIO = 0.48;
const BOSS_SHOT_OFFSET_RATIO = 0.34;
const HIT_SCALE_X = 1.03;
const HIT_SCALE_Y = 0.98;
const IDLE_SCALE_LERP = 0.18;
const POSITIVE_DIRECTION = 1;
const NEGATIVE_DIRECTION = -1;
const PROJECTILE_CULL_PADDING_X = 40;
const PROJECTILE_CULL_PADDING_TOP = 60;
const PROJECTILE_CULL_PADDING_BOTTOM = 60;

const PLAYER_PROJECTILE_SHAPE = {
  x: -PROJECTILE_RADIUS,
  y: -18,
  width: PROJECTILE_RADIUS * FULL_WIDTH,
  height: 36,
  strokeWidth: 1.5,
} as const;

const BOSS_PROJECTILE_SHAPE = {
  radius: PROJECTILE_RADIUS + 2,
  strokeWidth: 2,
  stemX: -3,
  stemY: -12,
  stemWidth: 6,
  stemHeight: 24,
  stemRadius: 3,
  stemAlpha: 0.9,
} as const;

export class PlayerEntity implements Entity {
  readonly sprite: Sprite;

  constructor(texture: Texture) {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(CENTER_ANCHOR);
    this.sprite.width = PLAYER_WIDTH;
    this.sprite.height = PLAYER_HEIGHT;
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  getShotOrigin() {
    return new Point(this.sprite.x, this.sprite.y - this.sprite.height * PLAYER_SHOT_OFFSET_RATIO);
  }

  move(axis: number, deltaMs: number) {
    this.sprite.x += axis * PLAYER_SPEED * (deltaMs / MS_IN_SECOND);

    const halfWidth = this.sprite.width * CENTER_ANCHOR;
    this.sprite.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, this.sprite.x));
  }

  update() {}
}

export class AsteroidEntity implements Entity {
  readonly sprite: Sprite;
  active = true;
  private readonly rotationSpeed: number;

  constructor(texture: Texture, x: number, y: number, scale: number, rotation: number) {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(CENTER_ANCHOR);
    this.sprite.width = ASTEROID_BASE_SIZE * scale;
    this.sprite.height = ASTEROID_BASE_SIZE * scale;
    this.sprite.position.set(x, y);
    this.sprite.rotation = rotation;
    this.rotationSpeed = ASTEROID_ROTATION_SPEED * (rotation >= 0 ? POSITIVE_DIRECTION : NEGATIVE_DIRECTION);
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  update(deltaMs: number) {
    this.sprite.rotation += this.rotationSpeed * (deltaMs / MS_IN_SECOND);
  }
}

export class ProjectileEntity implements Projectile {
  readonly sprite: Graphics;
  readonly owner: ProjectileOwner;
  readonly speed: number;
  active = true;

  private readonly velocity = new Point();

  constructor(owner: ProjectileOwner, originX: number, originY: number, directionX: number, directionY: number) {
    this.owner = owner;
    this.speed = owner === 'player' ? PLAYER_PROJECTILE_SPEED : BOSS_PROJECTILE_SPEED;
    this.sprite = new Graphics();
    this.sprite.position.set(originX, originY);

    const magnitude = Math.hypot(directionX, directionY) || NORMALIZED_FALLBACK;
    this.velocity.set((directionX / magnitude) * this.speed, (directionY / magnitude) * this.speed);

    if (owner === 'player') {
      this.sprite
        .roundRect(
          PLAYER_PROJECTILE_SHAPE.x,
          PLAYER_PROJECTILE_SHAPE.y,
          PLAYER_PROJECTILE_SHAPE.width,
          PLAYER_PROJECTILE_SHAPE.height,
          PROJECTILE_RADIUS,
        )
        .fill({ color: 0x9ae7ff })
        .stroke({ color: 0xffffff, width: PLAYER_PROJECTILE_SHAPE.strokeWidth });
    } else {
      this.sprite
        .circle(0, 0, BOSS_PROJECTILE_SHAPE.radius)
        .fill({ color: 0xff8d52 })
        .stroke({ color: 0x7a1000, width: BOSS_PROJECTILE_SHAPE.strokeWidth });
      this.sprite
        .roundRect(
          BOSS_PROJECTILE_SHAPE.stemX,
          BOSS_PROJECTILE_SHAPE.stemY,
          BOSS_PROJECTILE_SHAPE.stemWidth,
          BOSS_PROJECTILE_SHAPE.stemHeight,
          BOSS_PROJECTILE_SHAPE.stemRadius,
        )
        .fill({ color: 0xffcd5d, alpha: BOSS_PROJECTILE_SHAPE.stemAlpha });
    }
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  update(deltaMs: number) {
    this.sprite.x += this.velocity.x * (deltaMs / MS_IN_SECOND);
    this.sprite.y += this.velocity.y * (deltaMs / MS_IN_SECOND);

    if (
      this.sprite.x < -PROJECTILE_CULL_PADDING_X ||
      this.sprite.x > GAME_WIDTH + PROJECTILE_CULL_PADDING_X ||
      this.sprite.y < -PROJECTILE_CULL_PADDING_TOP ||
      this.sprite.y > GAME_HEIGHT + PROJECTILE_CULL_PADDING_BOTTOM
    ) {
      this.active = false;
    }
  }
}

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
      this.sprite.scale.x += (1 - this.sprite.scale.x) * IDLE_SCALE_LERP;
      this.sprite.scale.y += (1 - this.sprite.scale.y) * IDLE_SCALE_LERP;

      if (this.state.moveTimer <= 0) {
        this.state.moveMode = 'moving';
        this.state.moveTimer = BOSS_MOVE_DURATION_MS;
      }

      return;
    }

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

  canShoot() {
    return this.state.shotCooldown <= 0;
  }

  resetShotCooldown() {
    this.state.shotCooldown = BOSS_SHOT_COOLDOWN_MS;
  }
}
