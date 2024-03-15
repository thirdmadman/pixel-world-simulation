import { IPoint } from '../interfaces/IPoint';

export class InputController {
  private pressedKeys: { [key: string]: boolean } = {};

  private clickedKeys: Array<string> = [];

  private pressedMouseButtons: { [key: string]: boolean } = {};

  private clickedMouseButtons: Array<string> = [];

  private cursorRealPosition:IPoint = { x: 0, y: 0 };

  private mouseWheelDelta = 0;

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

  pushMouseButtonPressed(mouseButtonNumber: string) {
    this.pressedMouseButtons[mouseButtonNumber] = true;
  }

  pushMouseButtonReleased(mouseButtonNumber: string) {
    delete this.pressedMouseButtons[mouseButtonNumber];
    if (this.clickedMouseButtons.includes(mouseButtonNumber)) {
      return;
    }
    this.clickedMouseButtons.push(mouseButtonNumber);
  }

  registerMouseButtonListeners(node: HTMLElement) {
    node.addEventListener(
      'mousedown',
      (e) => { this.pushMouseButtonPressed(String(e.button)); },
      false,
    );

    node.addEventListener(
      'mouseup',
      (e) => { this.pushMouseButtonReleased(String(e.button)); },
      false,
    );
  }

  setCursorPosition(position: IPoint) {
    const { x, y } = position;
    this.cursorRealPosition = { x, y };
  }

  registerMouseMoveListeners(node: HTMLElement) {
    node.addEventListener(
      'mousemove',
      (e) => {
        const rect = node.getBoundingClientRect();
        const cursorPosition = {
          x: (e.clientX - rect.left),
          y: (e.clientY - rect.top),
        } as IPoint;
        this.setCursorPosition(cursorPosition);
      },
      false,
    );

    node.addEventListener(
      'touchmove',
      (e) => {
        const rect = node.getBoundingClientRect();
        const touch = e.touches[0];
        const cursorPosition = {
          x: (touch.clientX - rect.left),
          y: (touch.clientY - rect.top),
        };
        this.setCursorPosition(cursorPosition);
      },
      false,
    );
  }

  registerMouseWheelListener(node: HTMLElement) {
    node.addEventListener(
      'wheel',
      (e) => {
        this.mouseWheelDelta = e.deltaY;
      },
      false,
    );
  }

  getPressedKeys() {
    return this.pressedKeys;
  }

  getClickedKeys() {
    const copy = [...this.clickedKeys];
    this.clickedKeys = [];
    return copy;
  }

  getPressedMouseButtons() {
    return this.pressedMouseButtons;
  }

  getClickedMouseButtons() {
    const copy = [...this.clickedMouseButtons];
    this.clickedMouseButtons = [];
    return copy;
  }

  getCursorRealPosition() {
    return this.cursorRealPosition;
  }

  getMouseWheelDelta() {
    const delta = this.mouseWheelDelta;
    this.mouseWheelDelta = 0;
    return delta;
  }
}
