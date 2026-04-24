import { Container, TilingSprite, type Application } from 'pixi.js';
import {
  BACKGROUND_ANIMATION,
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVEL_ONE_CONFIG,
  LEVEL_TWO_CONFIG,
  MS_IN_SECOND,
  PLAYER_PROJECTILE_DIRECTION,
  PLAYER_START_Y,
  START_PREVIEW_ANIMATION,
} from '@data/config';
import { loadGameTextures, type GameTextures } from '@data/assets';
import type { GameState, LevelConfig } from '@data/types';
import { ProjectileEntity } from '@entities';
import type { AsteroidEntity, BossEntity, PlayerEntity } from '@entities';
import { CollisionSystem } from '@core/CollisionSystem';
import { InputController } from '@core/InputController';
import { LevelManager } from '@core/LevelManager';
import { HudLayer } from '@ui/HudLayer';
import { OverlayLayer } from '@ui/OverlayLayer';

type ResultState = Extract<GameState, 'win' | 'lose'>;
const ZERO = 0;

export class GameController {
  private readonly app: Application;
  private readonly input = new InputController();
  private readonly levelManager = new LevelManager();
  private readonly worldLayer = new Container();
  private readonly hud = new HudLayer();
  private readonly overlay = new OverlayLayer();
  private readonly background: TilingSprite;
  private readonly backgroundGlow: TilingSprite;

  private state: GameState = 'start';
  private currentLevel: LevelConfig = LEVEL_ONE_CONFIG;
  private remainingTimeMs = LEVEL_ONE_CONFIG.durationMs;
  private shotsRemaining = LEVEL_ONE_CONFIG.maxShots;

  private player: PlayerEntity | null = null;
  private previewPlayer: PlayerEntity | null = null;
  private boss: BossEntity | null = null;
  private asteroids: AsteroidEntity[] = [];
  private previewAsteroids: AsteroidEntity[] = [];
  private playerProjectiles: ProjectileEntity[] = [];
  private bossProjectiles: ProjectileEntity[] = [];

  private constructor(
    app: Application,
    private readonly textures: GameTextures,
  ) {
    this.app = app;

    this.background = new TilingSprite({
      texture: textures.background,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    });

    this.backgroundGlow = new TilingSprite({
      texture: textures.background,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      alpha: BACKGROUND_ANIMATION.glowAlpha,
    });

    this.backgroundGlow.tileScale.set(BACKGROUND_ANIMATION.glowScale);
    this.backgroundGlow.tilePosition.set(BACKGROUND_ANIMATION.glowOffsetX, BACKGROUND_ANIMATION.glowOffsetY);

    this.app.stage.addChild(
      this.background,
      this.backgroundGlow,
      this.worldLayer,
      this.hud.container,
      this.overlay.container,
    );

    this.app.ticker.add((ticker) => this.update(ticker.deltaMS));
    this.restartGame();
  }

  static async create(app: Application) {
    const textures = await loadGameTextures();
    return new GameController(app, textures);
  }

  startGame() {
    this.startLevel1();
  }

  restartGame() {
    this.input.reset();
    this.state = 'start';
    this.hud.setVisible(false);
    this.overlay.clear();
    this.clearScene();
    this.showStartPreview();
    this.overlay.showStart(() => this.startGame());
  }

  startLevel1() {
    this.openLevel(LEVEL_ONE_CONFIG);
    this.player = this.levelManager.createPlayer(this.textures.ship);
    this.asteroids = this.levelManager.createAsteroids(this.textures.asteroid);

    this.worldLayer.addChild(this.player.sprite);

    for (const asteroid of this.asteroids) {
      this.worldLayer.addChild(asteroid.sprite);
    }
  }

  startLevel2() {
    this.openLevel(LEVEL_TWO_CONFIG);
    this.player = this.levelManager.createPlayer(this.textures.ship);
    this.boss = this.levelManager.createBoss(this.textures.boss);

    this.worldLayer.addChild(this.boss.sprite, this.player.sprite);
    this.hud.showBossHp(this.boss.hp, this.boss.maxHp);
  }

  setResult(result: ResultState) {
    if (this.hasResultState()) {
      return;
    }

    this.state = result;
    this.input.reset();
    this.hud.hideBossHp();
    this.overlay.showResult(result, () => this.startGame());
  }

  private update(deltaMs: number) {
    this.scrollBackground(deltaMs);

    if (this.state === 'start') {
      this.updateStartPreview(deltaMs);
      return;
    }

    if (this.hasResultState()) {
      return;
    }

    this.updateTimer(deltaMs);
    this.updatePlayer(deltaMs);
    this.updateProjectiles(deltaMs);
    this.updateBoss(deltaMs);
    this.resolveCollisions();
    this.cleanupEntities();
    this.checkLevelState();
  }

  private scrollBackground(deltaMs: number) {
    const frame = deltaMs / MS_IN_SECOND;

    this.background.tilePosition.y += BACKGROUND_ANIMATION.baseScrollSpeed * frame;
    this.backgroundGlow.tilePosition.y += BACKGROUND_ANIMATION.glowScrollSpeedY * frame;
    this.backgroundGlow.tilePosition.x += BACKGROUND_ANIMATION.glowScrollSpeedX * frame;
  }

  private updateStartPreview(deltaMs: number) {
    for (const asteroid of this.previewAsteroids) {
      asteroid.update(deltaMs);
    }

    if (!this.previewPlayer) {
      return;
    }

    const t = performance.now() * START_PREVIEW_ANIMATION.timeScale;

    this.previewPlayer.sprite.rotation = Math.sin(t) * START_PREVIEW_ANIMATION.rotationAmplitude;
    this.previewPlayer.sprite.y =
      PLAYER_START_Y + Math.sin(t * START_PREVIEW_ANIMATION.floatFrequency) * START_PREVIEW_ANIMATION.floatAmplitude;
  }

  private updateTimer(deltaMs: number) {
    this.remainingTimeMs = Math.max(ZERO, this.remainingTimeMs - deltaMs);
    this.hud.setTimer(Math.ceil(this.remainingTimeMs / MS_IN_SECOND));
  }

  private updatePlayer(deltaMs: number) {
    if (!this.player) {
      return;
    }

    const axis = this.input.horizontalAxis;

    if (axis !== ZERO) {
      this.player.move(axis, deltaMs);
    }

    if (this.input.consumeShoot()) {
      this.firePlayerProjectile();
    }
  }

  private updateProjectiles(deltaMs: number) {
    for (const projectile of this.playerProjectiles) {
      projectile.update(deltaMs);
    }

    for (const projectile of this.bossProjectiles) {
      projectile.update(deltaMs);
    }

    for (const asteroid of this.asteroids) {
      asteroid.update(deltaMs);
    }
  }

  private updateBoss(deltaMs: number) {
    if (!this.boss) {
      return;
    }

    this.boss.update(deltaMs);
    this.hud.showBossHp(this.boss.hp, this.boss.maxHp);

    if (!this.player || !this.boss.canShoot()) {
      return;
    }

    const origin = this.boss.getShotOrigin();
    const target = this.player.getShotOrigin();
    const projectile = new ProjectileEntity('boss', origin.x, origin.y, target.x - origin.x, target.y - origin.y);

    this.bossProjectiles.push(projectile);
    this.worldLayer.addChild(projectile.sprite);
    this.boss.resetShotCooldown();
  }

  private resolveCollisions() {
    if (this.state === 'level1') {
      this.resolveAsteroidHits();
      return;
    }

    this.resolveBossStageHits();
  }

  private resolveAsteroidHits() {
    for (const projectile of this.playerProjectiles) {
      if (!projectile.active) {
        continue;
      }

      for (const asteroid of this.asteroids) {
        if (!asteroid.active || !CollisionSystem.intersects(projectile, asteroid)) {
          continue;
        }

        projectile.active = false;
        asteroid.active = false;
        break;
      }
    }
  }

  private resolveBossStageHits() {
    if (!this.player || !this.boss) {
      return;
    }

    for (const playerShot of this.playerProjectiles) {
      if (!playerShot.active) {
        continue;
      }

      for (const bossShot of this.bossProjectiles) {
        if (!bossShot.active || !CollisionSystem.intersects(playerShot, bossShot)) {
          continue;
        }

        playerShot.active = false;
        bossShot.active = false;
        break;
      }

      if (!playerShot.active) {
        continue;
      }

      if (CollisionSystem.intersects(playerShot, this.boss)) {
        playerShot.active = false;
        this.boss.takeHit();
      }
    }

    for (const bossShot of this.bossProjectiles) {
      if (!bossShot.active) {
        continue;
      }

      if (CollisionSystem.intersects(bossShot, this.player)) {
        bossShot.active = false;
        this.setResult('lose');
        return;
      }
    }
  }

  private firePlayerProjectile() {
    if (!this.player || this.shotsRemaining <= 0) {
      return;
    }

    const origin = this.player.getShotOrigin();
    const projectile = new ProjectileEntity(
      'player',
      origin.x,
      origin.y,
      PLAYER_PROJECTILE_DIRECTION.x,
      PLAYER_PROJECTILE_DIRECTION.y,
    );

    this.playerProjectiles.push(projectile);
    this.worldLayer.addChild(projectile.sprite);

    this.shotsRemaining -= 1;
    this.hud.setBullets(this.shotsRemaining, this.currentLevel.maxShots);
  }

  private cleanupEntities() {
    this.playerProjectiles = this.playerProjectiles.filter((projectile) => this.keepActiveEntity(projectile));
    this.bossProjectiles = this.bossProjectiles.filter((projectile) => this.keepActiveEntity(projectile));
    this.asteroids = this.asteroids.filter((asteroid) => this.keepActiveEntity(asteroid));
  }

  private keepActiveEntity(entity: AsteroidEntity | ProjectileEntity) {
    if (entity.active) {
      return true;
    }

    entity.sprite.removeFromParent();
    entity.sprite.destroy();
    return false;
  }

  private checkLevelState() {
    if (this.hasResultState()) {
      return;
    }

    if (this.remainingTimeMs <= ZERO) {
      this.setResult('lose');
      return;
    }

    if (this.state === 'level1' && this.asteroids.length === ZERO) {
      this.startLevel2();
      return;
    }

    if (this.state === 'level2' && this.boss?.hp === ZERO) {
      this.setResult('win');
      return;
    }

    if (this.shotsRemaining === ZERO && this.playerProjectiles.length === ZERO && this.hasObjectivesLeft()) {
      this.setResult('lose');
    }
  }

  private hasObjectivesLeft() {
    if (this.state === 'level1') {
      return this.asteroids.length > ZERO;
    }

    return Boolean(this.boss && this.boss.hp > ZERO);
  }

  private openLevel(level: LevelConfig) {
    this.overlay.clear();
    this.clearScene();

    this.state = level.key;
    this.currentLevel = level;
    this.remainingTimeMs = level.durationMs;
    this.shotsRemaining = level.maxShots;

    this.hud.setVisible(true);
    this.hud.setLevelLabel(level.label);
    this.hud.setBullets(this.shotsRemaining, level.maxShots);
    this.hud.setTimer(Math.ceil(this.remainingTimeMs / MS_IN_SECOND));
    this.hud.hideBossHp();
  }

  private showStartPreview() {
    const preview = this.levelManager.createStartPreview(this.textures.ship, this.textures.asteroid);

    this.previewPlayer = preview.player;
    this.previewAsteroids = preview.asteroids;

    this.worldLayer.addChild(this.previewPlayer.sprite);

    for (const asteroid of this.previewAsteroids) {
      this.worldLayer.addChild(asteroid.sprite);
    }
  }

  private clearScene() {
    for (const child of this.worldLayer.removeChildren()) {
      child.destroy();
    }

    this.player = null;
    this.previewPlayer = null;
    this.boss = null;
    this.asteroids = [];
    this.previewAsteroids = [];
    this.playerProjectiles = [];
    this.bossProjectiles = [];
  }

  private hasResultState() {
    return this.state === 'win' || this.state === 'lose';
  }
}
