import { DataStorage } from './engine/DataStorage';
import { Engine } from './engine/Engine';
import { IPixelsLayer } from './interfaces/IPixelsLayer';
import { IPoint } from './interfaces/IPoint';
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

  private realMousePosition = { x: 0, y: 0 } as IPoint;

  private virtualMousePosition = { x: 0, y: 0 } as IPoint;

  private isPause = false;

  private dataStorage = new DataStorage();

  constructor() {
    this.canvas.classList.add('canvas-renderer');

    const appEl = document.body.querySelector('.app');
    if (appEl) {
      appEl.appendChild(this.canvas);
    }

    // const handleMouseLeftButton = (mPos: Point) => this.engine.handleMouseLeftButton(mPos);
    const handleMouseWheelUp = () => this.engine.handleMouseWheelUp();
    const handleMouseWheelDown = () => this.engine.handleMouseWheelDown();

    const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      } as IPoint;
    };

    const getTouchPos = (canvas: HTMLCanvasElement, e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    };

    const setCursorPos = (point: IPoint) => {
      this.realMousePosition = point;
      const pixelSize = this.renderer.getPixelSize();

      this.virtualMousePosition.x = this.framePositionX + Math.floor(point.x / pixelSize);
      this.virtualMousePosition.y = this.framePositionY + (this.frameHeight - 1 - Math.floor(point.y / pixelSize));

      this.engine.setMousedPosition(this.virtualMousePosition);
    };

    this.canvas.addEventListener(
      'mousemove',
      (e) => {
        const mousePos = getMousePos(this.canvas, e);
        setCursorPos(mousePos);
      },
      false,
    );

    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        const touchPos = getTouchPos(this.canvas, e);
        setCursorPos(touchPos);
      },
      false,
    );

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        if (-e.deltaY < 0) {
          handleMouseWheelDown();
        } else if (-e.deltaY > 0) {
          handleMouseWheelUp();
        }
      },
      false,
    );

    // const clickAndHold = (btnEl: HTMLCanvasElement, func: () => void) => {
    //   let timerId: number;
    //   const DURATION = 1;

    //   const onMouseDown = (e: MouseEvent | TouchEvent) => {
    //     if (e.type === 'mousedown' && e instanceof MouseEvent) {
    //       if (e.button === 0) {
    //         timerId = window.setInterval(func, DURATION);
    //       }
    //     } else if (e instanceof TouchEvent) {
    //       const touchPos = getTouchPos(this.canvas, e);
    //       setCursorPos(touchPos);
    //       timerId = window.setInterval(func, DURATION);
    //     }
    //   };

    //   const clearTimer = () => {
    //     if (timerId) {
    //       window.clearInterval(timerId);
    //     }
    //   };

    //   btnEl.addEventListener('mousedown', onMouseDown);
    //   btnEl.addEventListener('mouseup', clearTimer);
    //   btnEl.addEventListener('mouseout', clearTimer);
    //   btnEl.addEventListener('touchstart', onMouseDown);
    //   btnEl.addEventListener('touchend', clearTimer);

    //   return () => {
    //     btnEl.removeEventListener('mousedown', onMouseDown);
    //     btnEl.removeEventListener('mouseup', clearTimer);
    //     btnEl.removeEventListener('mouseout', clearTimer);
    //     btnEl.addEventListener('touchstart', onMouseDown, false);
    //     btnEl.addEventListener('touchend', clearTimer, false);
    //   };
    // };

    // clickAndHold(this.canvas, () => handleMouseLeftButton(this.virtualMousePosition));

    this.canvas.addEventListener(
      'mousedown',
      (e) => {
        switch (e.button) {
          case 0:
            this.engine.handleMouseLeftButtonDown(this.virtualMousePosition);
            break;
          default:
            console.error(e.button);
        }
      },
      false,
    );

    this.canvas.addEventListener(
      'mouseup',
      (e) => {
        switch (e.button) {
          case 0:
            this.engine.handleMouseLeftButtonUp(this.virtualMousePosition);
            break;
          default:
            console.error(e.button);
        }
      },
      false,
    );

    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        if (this.framePositionX < this.worldSideSize - this.frameWidth) {
          this.framePositionX += 1;
          this.engine.setFramePosition(this.framePositionX, this.framePositionY);
        }
      }
      if (event.key === 'ArrowLeft') {
        if (this.framePositionX > 0) {
          this.framePositionX -= 1;
          this.engine.setFramePosition(this.framePositionX, this.framePositionY);
        }
      }

      if (event.key === 'ArrowUp') {
        if (this.framePositionY < this.worldSideSize - this.frameHeight) {
          this.framePositionY += 1;
          this.engine.setFramePosition(this.framePositionX, this.framePositionY);
        }
      }
      if (event.key === 'ArrowDown') {
        if (this.framePositionY > 0) {
          this.framePositionY -= 1;
          this.engine.setFramePosition(this.framePositionX, this.framePositionY);
        }
      }
      if (event.key === 'Escape') {
        this.isPause = !this.isPause;
        this.engine.setPause(this.isPause);
      }
      if (event.key === 's') {
        const engineState = this.engine.getEngineState();
        this.dataStorage.saveToLocalStorage(engineState);
      }
      if (event.key === 'l') {
        const engineState = this.dataStorage.loadFromLocalStorage();
        this.engine.setEngineState(engineState);
      }
    });

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
    console.error(width, height);
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

      const newLayer: IPixelsLayer = {
        x: 0,
        y: 0,
        width: 2,
        height: 3,
        pixels: new Uint32Array(2 * 3),
      };

      newLayer.pixels[0] = 0xffff0000;
      newLayer.pixels[1] = 0xffff0000;
      newLayer.pixels[2] = 0xff00ff00;
      newLayer.pixels[3] = 0xff00ff00;
      newLayer.pixels[4] = 0xff0000ff;
      newLayer.pixels[5] = 0xff0000ff;

      const engineLayer: IPixelsLayer = {
        x: 0,
        y: 0,
        width: this.frameWidth,
        height: this.frameHeight,
        pixels: enginePixels,
      };

      const uiLayers = this.engine.getUi().getLayers();

      const pixelsToRender = this.renderer.blendPixelLayers(
        [engineLayer, ...uiLayers, newLayer],
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
