import { mixColors } from '../utils/utils';

interface IPixelsLayer {
  width: number;
  height: number;
  x: number;
  y: number;
  pixels: Uint32Array;
}

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

  // eslint-disable-next-line class-methods-use-this
  blendPixelLayers(layers: Array<IPixelsLayer>, width: number, height: number) {
    const toLinearArrayIndex = (x: number, y: number, w: number, h: number) => (h - y - 1) * w + x;

    if (!layers || layers.length === 0) return null;

    if (layers.length === 1) {
      return layers[0].pixels;
    }

    const resultOfBlend = new Uint32Array(width * height);

    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];

      // if (layerIndex === layers.length - 1) {
      //   console.error(layerIndex);
      // }

      const layerWidth = layer.width;
      const layerHeight = layer.height;
      const layerX = layer.x;
      const layerY = layer.y;

      for (let layerRow = 0; layerRow < layerHeight; layerRow++) {
        const cyclicCol = (layerHeight - 1 - layerRow) * layerWidth;
        for (let layerCol = cyclicCol; layerCol < cyclicCol + layerWidth; layerCol++) {
          const normalizedCol = layerCol - cyclicCol;

          const pixelPositionX = layerX + normalizedCol;
          const pixelPositionY = layerY + layerRow;

          const realPositionOfPixel = toLinearArrayIndex(pixelPositionX, pixelPositionY, width, height);

          const blendResultPixel = resultOfBlend[realPositionOfPixel];
          const layerPixel = layer.pixels[layerCol];

          if (blendResultPixel === null || blendResultPixel === undefined || blendResultPixel === 0) {
            resultOfBlend[realPositionOfPixel] = layerPixel;
          } else if (layerPixel !== null && layerPixel !== undefined) {
            resultOfBlend[realPositionOfPixel] = Number(mixColors(blendResultPixel, layerPixel));
          }
        }
      }
    }

    // for (let row = 0; row < this.height / this.pixelSize; row++) {
    //   const blendedPixelsRow: Array<number | null> = [];
    //   for (let col = 0; col < this.width / this.pixelSize; col++) {
    //     let tmpColorBlend: null | number = null;
    //     for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
    //       if (layers[layerIndex][row][col] !== undefined && layers[layerIndex][row][col] !== null) {
    //         if (layerIndex === 0) {
    //           tmpColorBlend = layers[layerIndex][row][col];
    //         } else if (tmpColorBlend !== null) {
    //           tmpColorBlend = Number(mixColors(tmpColorBlend, layers[layerIndex][row][col]));
    //         }
    //         blendedPixelsRow[col] = tmpColorBlend;
    //       }
    //       resultOfBlend[row] = blendedPixelsRow;
    //     }
    //   }
    // }

    return resultOfBlend;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(time: number) {
    const toLinearArrayIndex = (x: number, y: number, width: number, height: number) => (height - y - 1) * width + x;

    const {
      width, height, pixelSize, realPixels, virtualPixels, ctx, imageData, lastFrameTime,
    } = this;

    const newLayer: IPixelsLayer = {
      x: 10,
      y: 10,
      width: 1,
      height: 3,
      pixels: new Uint32Array(1 * 3),
    };

    newLayer.pixels[0] = 0x22000000;
    newLayer.pixels[1] = 0x22000000;
    newLayer.pixels[2] = 0x22000000;

    const virtualPixelsLayer: IPixelsLayer = {
      x: 0,
      y: 0,
      width: width / pixelSize,
      height: height / pixelSize,
      pixels: virtualPixels,
    };

    const resultVirtualPixels = this.blendPixelLayers(
      [virtualPixelsLayer, newLayer],
      width / pixelSize,
      height / pixelSize,
    );

    if (!resultVirtualPixels) {
      console.error('gefdg');
      return;
    }

    performance.mark('start');

    const widthPixelsRatio = width / pixelSize;
    const heightPixelsRatio = height / pixelSize;

    for (let row = 0; row < heightPixelsRatio; row++) {
      const rowPixelOffset = row * pixelSize;
      for (let col = 0; col < widthPixelsRatio; col++) {
        const colPixelOffset = col * pixelSize;

        const virtualPixelIndex = toLinearArrayIndex(col, row, widthPixelsRatio, heightPixelsRatio);

        const virtualPixel = resultVirtualPixels[virtualPixelIndex];

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
