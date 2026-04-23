import { Assets, type Texture } from 'pixi.js';

const assetBaseUrl = import.meta.env.BASE_URL;

const assetUrls = {
  background: `${assetBaseUrl}assets/space-background.svg`,
  ship: `${assetBaseUrl}assets/ship.svg`,
  asteroid: `${assetBaseUrl}assets/asteroid.svg`,
  boss: `${assetBaseUrl}assets/boss.svg`,
} as const;

export interface GameTextures {
  background: Texture;
  ship: Texture;
  asteroid: Texture;
  boss: Texture;
}

export async function loadGameTextures(): Promise<GameTextures> {
  const loaded = await Assets.load<Texture>(Object.values(assetUrls));

  return {
    background: loaded[assetUrls.background],
    ship: loaded[assetUrls.ship],
    asteroid: loaded[assetUrls.asteroid],
    boss: loaded[assetUrls.boss],
  };
}
