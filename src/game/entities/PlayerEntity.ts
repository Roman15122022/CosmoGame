import { Point, Sprite, type Texture } from 'pixi.js';
import { GAME_WIDTH, MS_IN_SECOND, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_WIDTH } from '@data/config';
import type { Entity } from '@data/types';
import { CENTER_ANCHOR, PLAYER_SHOT_OFFSET_RATIO } from './entity.constants';

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

  update() {
    return;
  }
}
