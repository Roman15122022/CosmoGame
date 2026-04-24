import type { Texture } from 'pixi.js';
import {
  ASTEROID_LAYOUT,
  BOSS_START_Y,
  GAME_WIDTH,
  PLAYER_PREVIEW_SCALE,
  PLAYER_START_Y,
  START_PREVIEW_ASTEROIDS,
} from '@data/config';
import { AsteroidEntity, BossEntity, PlayerEntity } from '@entities';

interface StartPreviewScene {
  player: PlayerEntity;
  asteroids: AsteroidEntity[];
}

const HORIZONTAL_CENTER = 0.5;

export class LevelManager {
  createPlayer(texture: Texture) {
    const player = new PlayerEntity(texture);
    player.sprite.position.set(GAME_WIDTH * HORIZONTAL_CENTER, PLAYER_START_Y);
    return player;
  }

  createStartPreview(shipTexture: Texture, asteroidTexture: Texture): StartPreviewScene {
    const player = this.createPlayer(shipTexture);
    const asteroids = this.createAsteroids(asteroidTexture);

    player.sprite.scale.set(PLAYER_PREVIEW_SCALE);

    START_PREVIEW_ASTEROIDS.forEach((layout, index) => {
      const asteroid = asteroids[index];

      if (!asteroid) {
        return;
      }

      asteroid.sprite.position.set(layout.x, layout.y);
      asteroid.sprite.scale.set(asteroid.sprite.scale.x * layout.scale, asteroid.sprite.scale.y * layout.scale);
      asteroid.sprite.alpha = layout.alpha;
    });

    return { player, asteroids };
  }

  createAsteroids(texture: Texture) {
    return ASTEROID_LAYOUT.map(({ x, y, scale, rotation }) => new AsteroidEntity(texture, x, y, scale, rotation));
  }

  createBoss(texture: Texture) {
    const boss = new BossEntity(texture);
    boss.sprite.position.set(GAME_WIDTH * HORIZONTAL_CENTER, BOSS_START_Y);
    return boss;
  }
}
