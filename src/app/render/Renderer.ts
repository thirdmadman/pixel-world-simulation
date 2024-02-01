import { mixColors } from '../utils/utils';

export class Renderer {
  private canvas: HTMLCanvasElement;

  private width: number;

  private height: number;

  private desiredWidth: number;

  private desiredHeight: number;

  private ctx: CanvasRenderingContext2D;

  private imageData: ImageData;

  private realPixels: Uint32Array;

  private pixelSize = 1;

  private virtualPixels: Uint32Array;

  private wallColor = 0xff000000;

  private lastFrameTime = new Date().getTime();

  constructor(parentCanvas: HTMLCanvasElement) {
    this.canvas = parentCanvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.desiredWidth = this.canvas.width;
    this.desiredHeight = this.canvas.height;
    this.ctx = this.canvas.getContext('2d') || new CanvasRenderingContext2D();

    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.realPixels = new Uint32Array(this.imageData.data.buffer);
    this.virtualPixels = new Uint32Array((this.width / this.pixelSize) * (this.height / this.pixelSize));
  }

  setScreenSize(width: number, height: number) {
    this.desiredWidth = width;
    this.desiredHeight = height;

    this.width = Math.floor(width / this.pixelSize) * this.pixelSize;
    this.height = Math.floor(height / this.pixelSize) * this.pixelSize;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.realPixels = new Uint32Array(this.imageData.data.buffer);
    this.virtualPixels = new Uint32Array((this.width / this.pixelSize) * (this.height / this.pixelSize));
  }

  getScreenSizeX = () => this.width;

  getScreenSizeY = () => this.height;

  setPixelSize(size: number) {
    this.pixelSize = size;
    this.setScreenSize(this.desiredWidth, this.desiredHeight);
  }

  getPixelsCount = () => (this.width * this.height) / this.pixelSize ** 2;

  getPixelSize = () => this.pixelSize;

  getLastFrameTime = () => this.lastFrameTime;

  blendPixelLayers(layers: Array<Array<Array<number>>>) {
    if (!layers || layers.length === 0) return null;

    if (!layers.every((el) => el.length === this.width)) {
      return null;
    }

    if (layers.length === 1) {
      return layers[0];
    }

    const resultOfBlend: Array<Array<number | null>> = [];

    for (let row = 0; row < this.height / this.pixelSize; row++) {
      const blendedPixelsRow: Array<number | null> = [];
      for (let col = 0; col < this.width / this.pixelSize; col++) {
        let tmpColorBlend: null | number = null;
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
          if (layers[layerIndex][row][col] !== undefined && layers[layerIndex][row][col] !== null) {
            if (layerIndex === 0) {
              tmpColorBlend = layers[layerIndex][row][col];
            } else if (tmpColorBlend !== null) {
              tmpColorBlend = Number(mixColors(tmpColorBlend, layers[layerIndex][row][col]));
            }
            blendedPixelsRow[col] = tmpColorBlend;
          }
          resultOfBlend[row] = blendedPixelsRow;
        }
      }
    }

    return resultOfBlend;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(time: number) {
    const toLinearArrayIndex = (x: number, y: number, width: number, height: number) => (height - y - 1) * width + x;

    const {
      width, height, pixelSize, realPixels, virtualPixels, ctx, imageData, lastFrameTime,
    } = this;

    performance.mark('start');

    const widthPixelsRatio = width / pixelSize;
    const heightPixelsRatio = height / pixelSize;

    for (let row = 0; row < heightPixelsRatio; row++) {
      const rowPixelOffset = row * pixelSize;
      for (let col = 0; col < widthPixelsRatio; col++) {
        const colPixelOffset = col * pixelSize;

        const virtualPixelIndex = toLinearArrayIndex(col, row, widthPixelsRatio, heightPixelsRatio);

        const virtualPixel = virtualPixels[virtualPixelIndex];

        for (let realPixelX = 0; realPixelX < pixelSize; realPixelX++) {
          const realPixelXConstant = colPixelOffset + realPixelX;
          for (let realPixelY = 0; realPixelY < pixelSize; realPixelY++) {
            const realPixelIndex = toLinearArrayIndex(realPixelXConstant, rowPixelOffset + realPixelY, width, height);

            realPixels[realPixelIndex] = virtualPixel;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    performance.mark('end');
    const perf = performance.measure('Measurement', 'start', 'end');

    if (1000 / (performance.now() - lastFrameTime) === Infinity) {
      this.lastFrameTime = performance.now();
    }

    ctx.font = '10px serif';
    ctx.fillStyle = 'red';
    ctx.fillText(`FPS: ${String(1000 / (performance.now() - lastFrameTime)).slice(0, 6)}`, 0, 10);
    ctx.fillText(`render: ${String(perf.duration).slice(0, 4)}`, 0, 30);
    this.lastFrameTime = performance.now();
  }

  getPixels() {
    return this.virtualPixels;
  }

  setPixels(pixels: Uint32Array) {
    this.virtualPixels = pixels;
  }
}
