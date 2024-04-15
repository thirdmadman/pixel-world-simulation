import { InputController } from './engine/InputController';
import { DataStorage } from './engine/DataStorage';
import { Engine } from './engine/Engine';
import { IPixelsLayer } from './interfaces/IPixelsLayer';
import { Renderer } from './render/Renderer';

export class App {
  public renderer: Renderer;

  public worldSideSize = 500;

  private engine = new Engine(this.worldSideSize);

  private canvas = document.createElement('canvas');

  private isStarted = false;

  private frameHeight = 10;

  private frameWidth = 10;

  private framePositionX = 0;

  private framePositionY = 0;

  private dataStorage = new DataStorage();

  private inputController = new InputController();

  private clickKeyToAction = {
    Escape: () => {
      this.engine.setIsPause(!this.engine.getIsPause());
    },
    p: () => {
      const engineState = this.engine.getEngineState();
      this.dataStorage.saveToLocalStorage(engineState);
    },
    l: () => {
      const engineState = this.dataStorage.loadFromLocalStorage();
      this.engine.setEngineState(engineState);
    },
  };

  private pressKeyToAction = {
    ArrowRight: () => this.moveFramePosition(1, 0),
    ArrowLeft: () => this.moveFramePosition(-1, 0),
    ArrowUp: () => this.moveFramePosition(0, 1),
    ArrowDown: () => this.moveFramePosition(0, -1),
    a: () => this.engine.pushPlayerMoveEvent('left'),
    s: () => this.engine.pushPlayerMoveEvent('down'),
    w: () => {
      this.engine.pushPlayerMoveEvent('up');
      this.engine.pushPlayerMoveEvent('up');
    },
    d: () => this.engine.pushPlayerMoveEvent('right'),
  };

  private pressMouseButtonToAction = {
    0: () => this.engine.handleMouseLeftButtonDown(),
  };

  constructor() {
    this.canvas.classList.add('canvas-renderer');

    const appEl = document.body.querySelector('.app');
    if (appEl) {
      appEl.appendChild(this.canvas);
    }

    this.inputController.registerKeyListeners();
    this.inputController.registerMouseButtonListeners(this.canvas);
    this.inputController.registerMouseMoveListeners(this.canvas);
    this.inputController.registerMouseWheelListener(this.canvas);
    this.renderer = new Renderer(this.canvas);
  }

  setScreenSize(width: number, height: number) {
    this.renderer.setScreenSize(width, height);

    const newWidth = Math.floor(width / this.renderer.getPixelSize());
    const newHeight = Math.floor(height / this.renderer.getPixelSize());

    this.engine.setRendererSize(newWidth, newHeight);
    this.frameWidth = Math.floor(newWidth);
    this.frameHeight = Math.floor(newHeight);
  }

  setPixelSize(size: number) {
    this.renderer.setPixelSize(size);

    const width = Math.floor(this.renderer.getScreenSizeX() / this.renderer.getPixelSize());
    const height = Math.floor(this.renderer.getScreenSizeY() / this.renderer.getPixelSize());
    this.engine.setRendererSize(width, height);
    this.frameWidth = width;
    this.frameHeight = height;
  }

  start() {
    if (!this.isStarted) {
      this.isStarted = true;
      this.startRender();
    }
  }

  moveFramePosition(x: number, y: number) {
    if (this.framePositionX + x <= this.worldSideSize - this.frameWidth && this.framePositionX + x >= 0) {
      this.framePositionX += x;
      this.engine.setFramePosition(this.framePositionX, this.framePositionY);
    }

    if (this.framePositionY + y <= this.worldSideSize - this.frameHeight && this.framePositionY + y >= 0) {
      this.framePositionY += y;
      this.engine.setFramePosition(this.framePositionX, this.framePositionY);
    }
  }

  startRender() {
    const pixels = this.renderer.getPixels();
    this.renderer.setPixels(pixels.fill(0xff000000));

    const callRender = (time: number) => {
      const enginePixels = this.engine.requestFrame(
        this.frameWidth,
        this.frameHeight,
        this.framePositionX,
        this.framePositionY,
      );

      const engineLayer: IPixelsLayer = {
        x: 0,
        y: 0,
        width: this.frameWidth,
        height: this.frameHeight,
        pixels: enginePixels,
      };

      const cursorPosition = this.inputController.getCursorRealPosition();

      const pixelSize = this.renderer.getPixelSize();

      const virtualCursorPositionX = this.framePositionX + Math.floor(cursorPosition.x / pixelSize);
      const virtualCursorPositionY = this.framePositionY
      + (this.frameHeight - 1 - Math.floor(cursorPosition.y / pixelSize));

      const virtualCursorPosition = { x: virtualCursorPositionX, y: virtualCursorPositionY };

      this.engine.setCursorPosition(virtualCursorPosition);

      const mouseWheelDelta = this.inputController.getMouseWheelDelta();
      if (mouseWheelDelta !== 0) {
        this.engine.handleMouseWheelDelta(mouseWheelDelta);
      }

      const clickedKeys = this.inputController.getClickedKeys();
      const pressedKeys = this.inputController.getPressedKeys();

      const pressedMouseButtons = this.inputController.getPressedMouseButtons();

      if (Object.keys(pressedMouseButtons).length > 0) {
        const { pressMouseButtonToAction } = this;

        Object.keys(pressedMouseButtons).forEach((el) => {
          const action = pressMouseButtonToAction[el as unknown as keyof typeof pressMouseButtonToAction];
          if (!action || action === undefined || action === null) {
            return;
          }
          action();
        });
      }

      if (Object.keys(pressedKeys).length > 0) {
        const { pressKeyToAction } = this;

        Object.keys(pressedKeys).forEach((el) => {
          const action = pressKeyToAction[el as keyof typeof pressKeyToAction];
          if (!action || action === undefined || action === null) {
            return;
          }
          action();
        });
      }

      if (clickedKeys.length > 0) {
        const { clickKeyToAction } = this;

        clickedKeys.forEach((el) => {
          const action = clickKeyToAction[el as keyof typeof clickKeyToAction];
          if (!action || action === undefined || action === null) {
            return;
          }
          action();
        });
      }

      const uiLayers = this.engine.getUi().getLayers();
      const playersEngineLayers = this.engine.getPlayersEngine().getLayers();

      const pixelsToRender = this.renderer.blendPixelLayers(
        [engineLayer, ...playersEngineLayers, ...uiLayers],
        this.renderer.getScreenSizeX() / this.renderer.getPixelSize(),
        this.renderer.getScreenSizeY() / this.renderer.getPixelSize(),
      );

      if (pixelsToRender !== null) {
        this.renderer.setPixels(pixelsToRender);
      }

      this.renderer.render(time);

      window.requestAnimationFrame(callRender);
    };

    callRender(0);
  }
}
