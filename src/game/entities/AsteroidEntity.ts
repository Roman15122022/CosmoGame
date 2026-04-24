import { Sprite, type Texture } from 'pixi.js';
import { ASTEROID_BASE_SIZE, ASTEROID_ROTATION_SPEED, MS_IN_SECOND } from '@data/config';
import type { Entity } from '@data/types';
import { CENTER_ANCHOR, NEGATIVE_DIRECTION, POSITIVE_DIRECTION } from './entity.constants';

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
