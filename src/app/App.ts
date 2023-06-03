import Engine from './Engine';
import Point from './Point';
import { Renderer } from './Renderer';

export class App {
  public renderer: Renderer;

  public worldSideSize = 1000;

  private engine = new Engine(this.worldSideSize);

  private canvas = document.createElement('canvas');

  private isStarted = false;

  private frameHeight = 10;

  private frameWidth = 10;

  private framePositionX = 0;

  private framePositionY = 0;

  private realMousePosition = { x: 0, y: 0 } as Point;

  private virtualMousePosition = { x: 0, y: 0 } as Point;

  private matterType = 0;

  private pointerSquareSize = 0;

  private isPause = false;

  private gameMaxCountMaterials = 5;

  constructor() {
    document.body.appendChild(this.canvas);

    const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      } as Point;
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

    const setCursorPos = (point: Point) => {
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
          if (this.pointerSquareSize > 0) {
            this.pointerSquareSize -= 1;
          }
        } else if (-e.deltaY > 0) {
          if (this.pointerSquareSize < this.frameHeight * 2) {
            this.pointerSquareSize += 1;
          }
        }
      },
      false,
    );

    const clickAndHold = (btnEl: HTMLCanvasElement, func: () => void) => {
      let timerId: number;
      const DURATION = 1;

      const onMouseDown = (e: MouseEvent | TouchEvent) => {
        if (e.type === 'mousedown' && e instanceof MouseEvent) {
          if (e.button === 0) {
            timerId = window.setInterval(func, DURATION);
          }
        } else if (e instanceof TouchEvent) {
          const touchPos = getTouchPos(this.canvas, e);
          setCursorPos(touchPos);
          timerId = window.setInterval(func, DURATION);
        }
      };

      const clearTimer = () => {
        if (timerId) {
          window.clearInterval(timerId);
        }
      };

      btnEl.addEventListener('mousedown', onMouseDown);
      btnEl.addEventListener('mouseup', clearTimer);
      btnEl.addEventListener('mouseout', clearTimer);
      btnEl.addEventListener('touchstart', onMouseDown);
      btnEl.addEventListener('touchend', clearTimer);

      return () => {
        btnEl.removeEventListener('mousedown', onMouseDown);
        btnEl.removeEventListener('mouseup', clearTimer);
        btnEl.removeEventListener('mouseout', clearTimer);
        btnEl.addEventListener('touchstart', onMouseDown, false);
        btnEl.addEventListener('touchend', clearTimer, false);
      };
    };

    // eslint-disable-next-line max-len
    const createUnit = () => this.engine.createUnitAtPoint(this.virtualMousePosition, this.matterType, this.pointerSquareSize);

    clickAndHold(this.canvas, createUnit);

    this.canvas.addEventListener(
      'mousedown',
      (e) => {
        if (e.button === 1) {
          if (this.matterType < this.gameMaxCountMaterials) {
            this.matterType += 1;
          } else {
            this.matterType = 0;
          }
        }
      },
      false,
    );

    this.renderer = new Renderer(this.canvas);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        if (this.framePositionX < this.worldSideSize - this.frameWidth) {
          this.framePositionX += 1;
        }
      }
      if (event.key === 'ArrowLeft') {
        if (this.framePositionX > 0) {
          this.framePositionX -= 1;
        }
      }

      if (event.key === 'ArrowUp') {
        if (this.framePositionY < this.worldSideSize - this.frameHeight) {
          this.framePositionY += 1;
        }
      }
      if (event.key === 'ArrowDown') {
        if (this.framePositionY > 0) {
          this.framePositionY -= 1;
        }
      }
      if (event.key === ' ') {
        this.isPause = !this.isPause;
      }
    });
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
      const pixels = this.renderer.getPixels();
      pixels.fill(0xff000000);
      this.isStarted = true;

      this.startRender();
    }
  }

  startRender() {
    const callRender = (time: number) => {
      if (!this.isPause) {
        this.renderer.setPixels(
          this.engine.requestFrame(this.frameWidth, this.frameHeight, this.framePositionX, this.framePositionY),
        );

        this.renderer.render(time);
      }

      window.requestAnimationFrame(callRender);
    };

    callRender(0);
  }
}