import { Container, Graphics, Text } from 'pixi.js';
import { GAME_WIDTH } from '@data/config';

const HUD_LAYOUT = {
  bulletsX: 28,
  bulletsY: 24,
  timerRight: 24,
  timerY: 18,
  levelY: 26,
  bossHpContainerY: 58,
  bossHpFrameX: 170,
  bossHpFrameY: 28,
  bossHpFillX: 166,
  bossHpFillY: 32,
} as const;

const HUD_TEXT_STYLE = {
  bulletsFontSize: 26,
  timerFontSize: 48,
  levelFontSize: 18,
  bossHpFontSize: 16,
  bulletsLetterSpacing: 1.2,
  levelLetterSpacing: 2.4,
  bossHpLetterSpacing: 1.8,
  shadowAlpha: 0.22,
  shadowBlur: 8,
  shadowDistance: 0,
  bulletsStrokeWidth: 5,
  timerStrokeWidth: 6,
  levelStrokeWidth: 4,
  bossHpStrokeWidth: 4,
} as const;

const HUD_ANCHOR = {
  right: 1,
  center: 0.5,
  top: 0,
} as const;

const BOSS_HP_BAR = {
  maxWidth: 332,
  frameWidth: 340,
  frameHeight: 22,
  frameRadius: 11,
  fillHeight: 14,
  fillRadius: 7,
  criticalThreshold: 0.4,
  frameAlpha: 0.88,
  frameStrokeWidth: 2,
} as const;

export class HudLayer {
  readonly container = new Container();

  private readonly bulletsText = new Text({
    text: 'bullets: 10 / 10',
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: HUD_TEXT_STYLE.bulletsFontSize,
      fill: 0xff4d8f,
      letterSpacing: HUD_TEXT_STYLE.bulletsLetterSpacing,
      stroke: { color: 0x22010d, width: HUD_TEXT_STYLE.bulletsStrokeWidth },
      dropShadow: {
        color: 0xff4d8f,
        alpha: HUD_TEXT_STYLE.shadowAlpha,
        blur: HUD_TEXT_STYLE.shadowBlur,
        distance: HUD_TEXT_STYLE.shadowDistance,
      },
    },
  });

  private readonly timerText = new Text({
    text: '60',
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: HUD_TEXT_STYLE.timerFontSize,
      fill: 0xff4d8f,
      stroke: { color: 0x22010d, width: HUD_TEXT_STYLE.timerStrokeWidth },
      dropShadow: {
        color: 0xff4d8f,
        alpha: HUD_TEXT_STYLE.shadowAlpha,
        blur: HUD_TEXT_STYLE.shadowBlur,
        distance: HUD_TEXT_STYLE.shadowDistance,
      },
    },
  });

  private readonly levelText = new Text({
    text: 'LEVEL 1',
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: HUD_TEXT_STYLE.levelFontSize,
      fill: 0xa4c5ff,
      letterSpacing: HUD_TEXT_STYLE.levelLetterSpacing,
      stroke: { color: 0x071225, width: HUD_TEXT_STYLE.levelStrokeWidth },
    },
  });

  private readonly bossHpContainer = new Container();
  private readonly bossHpFrame = new Graphics();
  private readonly bossHpFill = new Graphics();
  private readonly bossHpLabel = new Text({
    text: 'BOSS HP',
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: HUD_TEXT_STYLE.bossHpFontSize,
      fill: 0xfde488,
      letterSpacing: HUD_TEXT_STYLE.bossHpLetterSpacing,
      stroke: { color: 0x241700, width: HUD_TEXT_STYLE.bossHpStrokeWidth },
    },
  });

  constructor() {
    this.bulletsText.position.set(HUD_LAYOUT.bulletsX, HUD_LAYOUT.bulletsY);
    this.timerText.anchor.set(HUD_ANCHOR.right, HUD_ANCHOR.top);
    this.timerText.position.set(GAME_WIDTH - HUD_LAYOUT.timerRight, HUD_LAYOUT.timerY);
    this.levelText.anchor.set(HUD_ANCHOR.center, HUD_ANCHOR.top);
    this.levelText.position.set(GAME_WIDTH * HUD_ANCHOR.center, HUD_LAYOUT.levelY);

    this.bossHpLabel.anchor.set(HUD_ANCHOR.center, HUD_ANCHOR.top);
    this.bossHpLabel.position.set(GAME_WIDTH * HUD_ANCHOR.center, 0);

    this.bossHpContainer.position.set(0, HUD_LAYOUT.bossHpContainerY);
    this.bossHpFrame.position.set(GAME_WIDTH * HUD_ANCHOR.center - HUD_LAYOUT.bossHpFrameX, HUD_LAYOUT.bossHpFrameY);
    this.bossHpFill.position.set(GAME_WIDTH * HUD_ANCHOR.center - HUD_LAYOUT.bossHpFillX, HUD_LAYOUT.bossHpFillY);

    this.bossHpContainer.addChild(this.bossHpLabel, this.bossHpFrame, this.bossHpFill);
    this.bossHpContainer.visible = false;

    this.container.addChild(this.bulletsText, this.timerText, this.levelText, this.bossHpContainer);
  }

  setVisible(visible: boolean) {
    this.container.visible = visible;
  }

  setBullets(current: number, max: number) {
    this.bulletsText.text = `bullets: ${current} / ${max}`;
  }

  setTimer(secondsLeft: number) {
    this.timerText.text = `${secondsLeft}`;
  }

  setLevelLabel(label: string) {
    this.levelText.text = label;
  }

  showBossHp(current: number, max: number) {
    const ratio = Math.max(0, Math.min(1, current / max));

    this.bossHpContainer.visible = true;
    this.bossHpFrame.clear();
    this.bossHpFrame
      .roundRect(0, 0, BOSS_HP_BAR.frameWidth, BOSS_HP_BAR.frameHeight, BOSS_HP_BAR.frameRadius)
      .fill({ color: 0x250618, alpha: BOSS_HP_BAR.frameAlpha })
      .stroke({ color: 0xff6a9f, width: BOSS_HP_BAR.frameStrokeWidth });

    this.bossHpFill.clear();
    this.bossHpFill
      .roundRect(0, 0, BOSS_HP_BAR.maxWidth * ratio, BOSS_HP_BAR.fillHeight, BOSS_HP_BAR.fillRadius)
      .fill({ color: ratio > BOSS_HP_BAR.criticalThreshold ? 0xff7e53 : 0xff4f7d });
  }

  hideBossHp() {
    this.bossHpContainer.visible = false;
  }
}
