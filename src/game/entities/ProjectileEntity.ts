import { Graphics, Point } from 'pixi.js';
import {
  BOSS_PROJECTILE_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  MS_IN_SECOND,
  PLAYER_PROJECTILE_SPEED,
  PROJECTILE_RADIUS,
} from '@data/config';
import type { Projectile, ProjectileOwner } from '@data/types';
import {
  BOSS_PROJECTILE_SHAPE,
  NORMALIZED_FALLBACK,
  PLAYER_PROJECTILE_SHAPE,
  PROJECTILE_CULL_PADDING_BOTTOM,
  PROJECTILE_CULL_PADDING_TOP,
  PROJECTILE_CULL_PADDING_X,
} from './entity.constants';

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
      this.drawPlayerProjectile();
    } else {
      this.drawBossProjectile();
    }
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  update(deltaMs: number) {
    this.sprite.x += this.velocity.x * (deltaMs / MS_IN_SECOND);
    this.sprite.y += this.velocity.y * (deltaMs / MS_IN_SECOND);

    if (this.isOutOfBounds()) {
      this.active = false;
    }
  }

  private drawPlayerProjectile() {
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
  }

  private drawBossProjectile() {
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

  private isOutOfBounds() {
    return (
      this.sprite.x < -PROJECTILE_CULL_PADDING_X ||
      this.sprite.x > GAME_WIDTH + PROJECTILE_CULL_PADDING_X ||
      this.sprite.y < -PROJECTILE_CULL_PADDING_TOP ||
      this.sprite.y > GAME_HEIGHT + PROJECTILE_CULL_PADDING_BOTTOM
    );
  }
}
