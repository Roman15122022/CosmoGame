import { Container, Graphics, Text, type FederatedPointerEvent } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../data/config';

type OverlayKind = 'menu' | 'result';
type GameResult = 'win' | 'lose';

const OVERLAY_LAYOUT = {
  menuWidth: 472,
  resultWidth: 430,
  menuHeight: 232,
  resultHeight: 214,
  offsetY: 22,
  panelRadius: 28,
  innerInset: 14,
  innerRadius: 22,
  buttonOffsetBottom: 36,
} as const;

const OVERLAY_STYLE = {
  menuVeilAlpha: 0.28,
  resultVeilAlpha: 0.4,
  panelAlpha: 0.78,
  panelStrokeWidth: 2,
  innerStrokeAlpha: 0.9,
  innerStrokeWidth: 1,
  eyebrowFontSize: 12,
  eyebrowLetterSpacing: 2.2,
  titleFontSizeMenu: 42,
  titleFontSizeResult: 50,
  titleLetterSpacingMenu: 1.2,
  titleLetterSpacingResult: 1.8,
  titleStrokeWidth: 5,
  titleShadowAlpha: 0.22,
  titleShadowBlur: 8,
  titleShadowDistance: 0,
  subtitleFontSizeMenu: 18,
  subtitleFontSizeResult: 20,
  subtitleLineHeightMenu: 28,
  subtitleLineHeightResult: 30,
} as const;

const OVERLAY_POSITION = {
  eyebrowY: 28,
  titleY: 82,
  subtitleY: 138,
  centerAnchor: 0.5,
} as const;

const BUTTON_LAYOUT = {
  x: -112,
  y: -24,
  width: 224,
  height: 48,
  radius: 24,
  fontSize: 20,
  letterSpacing: 1,
} as const;

const BUTTON_STYLE = {
  menuIdleAlpha: 0.96,
  resultIdleAlpha: 0.92,
  strokeWidth: 2,
} as const;

interface OverlayOptions {
  kind: OverlayKind;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onClick: () => void;
}

const startSubtitle = [
  'Move: Left / Right    Shoot: Space',
  '10 shots per wave. 60 seconds. Boss on level two.',
].join('\n');

export class OverlayLayer {
  readonly container = new Container();

  showStart(onStart: () => void) {
    this.render({
      kind: 'menu',
      title: 'COSMO STRIKE',
      subtitle: startSubtitle,
      buttonLabel: 'START GAME',
      onClick: onStart,
    });
  }

  showResult(result: GameResult, onRestart: () => void) {
    this.render({
      kind: 'result',
      title: result === 'win' ? 'YOU WIN' : 'YOU LOSE',
      subtitle:
        result === 'win'
          ? 'Sector secured. The boss fleet is gone.'
          : 'Mission failed. Try a different line of fire.',
      buttonLabel: 'PLAY AGAIN',
      onClick: onRestart,
    });
  }

  clear() {
    for (const child of this.container.removeChildren()) {
      child.destroy();
    }
  }

  private render({ kind, title, subtitle, buttonLabel, onClick }: OverlayOptions) {
    this.clear();

    const isMenu = kind === 'menu';
    const panelWidth = isMenu ? OVERLAY_LAYOUT.menuWidth : OVERLAY_LAYOUT.resultWidth;
    const panelHeight = isMenu ? OVERLAY_LAYOUT.menuHeight : OVERLAY_LAYOUT.resultHeight;
    const panelX = GAME_WIDTH / 2 - panelWidth / 2;
    const panelY = GAME_HEIGHT / 2 - panelHeight / 2 - OVERLAY_LAYOUT.offsetY;
    const centerX = GAME_WIDTH * OVERLAY_POSITION.centerAnchor;

    const veil = new Graphics();
    veil
      .rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .fill({ color: 0x02040b, alpha: isMenu ? OVERLAY_STYLE.menuVeilAlpha : OVERLAY_STYLE.resultVeilAlpha });

    const panel = new Graphics();
    panel
      .roundRect(panelX, panelY, panelWidth, panelHeight, OVERLAY_LAYOUT.panelRadius)
      .fill({ color: 0x040913, alpha: OVERLAY_STYLE.panelAlpha })
      .stroke({ color: 0x315fbe, width: OVERLAY_STYLE.panelStrokeWidth });

    const panelInner = new Graphics();
    panelInner
      .roundRect(
        panelX + OVERLAY_LAYOUT.innerInset,
        panelY + OVERLAY_LAYOUT.innerInset,
        panelWidth - OVERLAY_LAYOUT.innerInset * 2,
        panelHeight - OVERLAY_LAYOUT.innerInset * 2,
        OVERLAY_LAYOUT.innerRadius,
      )
      .stroke({ color: 0x0d1933, alpha: OVERLAY_STYLE.innerStrokeAlpha, width: OVERLAY_STYLE.innerStrokeWidth });

    const eyebrow = new Text({
      text: isMenu ? 'SPACE SHOOTER // PIXI.JS' : 'MISSION REPORT',
      style: {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: OVERLAY_STYLE.eyebrowFontSize,
        fill: 0x6f90d3,
        letterSpacing: OVERLAY_STYLE.eyebrowLetterSpacing,
      },
      anchor: OVERLAY_POSITION.centerAnchor,
    });
    eyebrow.position.set(centerX, panelY + OVERLAY_POSITION.eyebrowY);

    const titleText = new Text({
      text: title,
      style: {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: isMenu ? OVERLAY_STYLE.titleFontSizeMenu : OVERLAY_STYLE.titleFontSizeResult,
        fill: title === 'YOU LOSE' ? 0xff7aa4 : 0x8fd0ff,
        letterSpacing: isMenu ? OVERLAY_STYLE.titleLetterSpacingMenu : OVERLAY_STYLE.titleLetterSpacingResult,
        stroke: { color: 0x04101f, width: OVERLAY_STYLE.titleStrokeWidth },
        dropShadow: {
          color: 0x112c5b,
          alpha: OVERLAY_STYLE.titleShadowAlpha,
          blur: OVERLAY_STYLE.titleShadowBlur,
          distance: OVERLAY_STYLE.titleShadowDistance,
        },
      },
      anchor: OVERLAY_POSITION.centerAnchor,
    });
    titleText.position.set(centerX, panelY + OVERLAY_POSITION.titleY);

    const subtitleText = new Text({
      text: subtitle,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: isMenu ? OVERLAY_STYLE.subtitleFontSizeMenu : OVERLAY_STYLE.subtitleFontSizeResult,
        fill: 0xd8e8ff,
        align: 'center',
        lineHeight: isMenu ? OVERLAY_STYLE.subtitleLineHeightMenu : OVERLAY_STYLE.subtitleLineHeightResult,
      },
      anchor: OVERLAY_POSITION.centerAnchor,
    });
    subtitleText.position.set(centerX, panelY + OVERLAY_POSITION.subtitleY);

    const button = this.createButton(buttonLabel, onClick, isMenu);
    button.position.set(centerX, panelY + panelHeight - OVERLAY_LAYOUT.buttonOffsetBottom);

    this.container.addChild(veil, panel, panelInner, eyebrow, titleText, subtitleText, button);
  }

  private createButton(label: string, onClick: () => void, isMenu: boolean) {
    const container = new Container();
    const background = new Graphics();
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: BUTTON_LAYOUT.fontSize,
        fill: 0x74a8ff,
        letterSpacing: BUTTON_LAYOUT.letterSpacing,
      },
      anchor: OVERLAY_POSITION.centerAnchor,
    });

    const draw = (hovered: boolean) => {
      background.clear();
      background
        .roundRect(BUTTON_LAYOUT.x, BUTTON_LAYOUT.y, BUTTON_LAYOUT.width, BUTTON_LAYOUT.height, BUTTON_LAYOUT.radius)
        .fill({
          color: hovered ? 0x132c59 : 0x081326,
          alpha: isMenu ? BUTTON_STYLE.menuIdleAlpha : BUTTON_STYLE.resultIdleAlpha,
        })
        .stroke({ color: hovered ? 0x84b9ff : 0x3b6ed0, width: BUTTON_STYLE.strokeWidth });

      text.style.fill = hovered ? 0x9ed1ff : 0x74a8ff;
    };

    draw(false);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerover', () => draw(true));
    container.on('pointerout', () => draw(false));
    container.on('pointertap', (_event: FederatedPointerEvent) => {
      this.clear();
      onClick();
    });

    container.addChild(background, text);
    return container;
  }
}
