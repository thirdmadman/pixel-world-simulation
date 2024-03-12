export class InputController {
  private pressedKeys: { [key: string]: boolean } = {};

  private clickedKeys: Array<string> = [];

  pushKeyPressed(key: string) {
    this.pressedKeys[key] = true;
  }

  pushKeyReleased(key: string) {
    delete this.pressedKeys[key];
    if (this.clickedKeys.includes(key)) {
      return;
    }
    this.clickedKeys.push(key);
  }

  registerKeyListeners() {
    document.addEventListener('keydown', (e) => {
      this.pushKeyPressed(e.key);
    });
    document.addEventListener('keyup', (e) => {
      this.pushKeyReleased(e.key);
    });
  }

  getPressedKeys() {
    return this.pressedKeys;
  }

  getClickedKeys() {
    const copy = [...this.clickedKeys];
    this.clickedKeys = [];
    return copy;
  }
}
