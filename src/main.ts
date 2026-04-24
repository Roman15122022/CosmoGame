import { Application } from 'pixi.js';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from '@data/config';
import { GameController } from '@game';

const DEFAULT_RESOLUTION = 1;
const APP_BACKGROUND_COLOR = '#030711';
const CANVAS_ARIA_LABEL = 'Space shooter game canvas';

async function bootstrap() {
  const root = document.querySelector<HTMLDivElement>('#app');

  if (!root) {
    throw new Error('Application root was not found.');
  }

  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || DEFAULT_RESOLUTION,
    background: APP_BACKGROUND_COLOR,
  });

  app.canvas.setAttribute('aria-label', CANVAS_ARIA_LABEL);
  root.appendChild(app.canvas);

  await GameController.create(app);
}

void bootstrap();
