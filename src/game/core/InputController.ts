export class InputController {
  private pressedKeys = new Set<string>();
  private shootQueued = false;

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.reset);
  }

  get horizontalAxis() {
    const left = this.pressedKeys.has('ArrowLeft') ? -1 : 0;
    const right = this.pressedKeys.has('ArrowRight') ? 1 : 0;

    return left + right;
  }

  consumeShoot() {
    const shouldShoot = this.shootQueued;
    this.shootQueued = false;
    return shouldShoot;
  }

  reset = () => {
    this.pressedKeys.clear();
    this.shootQueued = false;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'Space') {
      event.preventDefault();
    }

    if (event.code === 'Space' && !this.pressedKeys.has('Space')) {
      this.shootQueued = true;
    }

    this.pressedKeys.add(event.code);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'Space') {
      event.preventDefault();
    }

    this.pressedKeys.delete(event.code);
  };
}
