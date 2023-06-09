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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(time: number) {
    const toLinearArrayIndex = (x: number, y: number, width: number, height: number) => (height - y - 1) * width + x;

    for (let row = 0; row < this.height / this.pixelSize; row++) {
      for (let col = 0; col < this.width / this.pixelSize; col++) {
        for (let realPixelX = 0; realPixelX < this.pixelSize; realPixelX++) {
          for (let realPixelY = 0; realPixelY < this.pixelSize; realPixelY++) {
            const realPixelIndex = toLinearArrayIndex(
              col * this.pixelSize + realPixelX,
              row * this.pixelSize + realPixelY,
              this.width,
              this.height,
            );
            const virtualPixelIndex = toLinearArrayIndex(
              col,
              row,
              this.width / this.pixelSize,
              this.height / this.pixelSize,
            );
            this.realPixels[realPixelIndex] = this.virtualPixels[virtualPixelIndex];
          }
        }
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);

    if (1000 / (performance.now() - this.lastFrameTime) === Infinity) {
      this.lastFrameTime = performance.now();
    }

    this.ctx.font = '10px serif';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText(`FPS: ${String(1000 / (performance.now() - this.lastFrameTime))}`, 0, 10);
    this.lastFrameTime = performance.now();
  }

  getPixels() {
    return this.virtualPixels;
  }

  setPixels(pixels: Uint32Array) {
    this.virtualPixels = pixels;
  }
}
