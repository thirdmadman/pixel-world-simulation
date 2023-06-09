/* eslint-disable class-methods-use-this */
import Point from './Point';

interface UIPixel {
  color: number;
  actionType: string | null;
}

export class UI {
  private frameWidth = 1;

  private frameHeight = 1;

  private mousePosition = { x: 0, y: 0 } as Point;

  private UIState: Array<Array<UIPixel | null>> = Array.from(Array(1), () => new Array<UIPixel>(1));

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;
  }

  drawCursor() {
    this.UIState[this.mousePosition.x][this.mousePosition.y] = { color: 0xff000000, actionType: null };
  }

  setMousedPosition(mousePosition: Point) {
    this.mousePosition = mousePosition;
  }

  drawUI() {
    this.drawCursor();
  }

  extractFrame() {
    // this.UIState = Array(this.frameWidth);

    const nodes = new Array(this.frameWidth);
    const copy = new Array(this.frameHeight);
    for (let i = 0; i < this.frameHeight; i++) {
      copy[i] = null;
    }

    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = copy.slice(0);
    }

    this.UIState = nodes as Array<Array<UIPixel | null>>;

    this.drawUI();

    // const frame = new Uint32Array(this.frameWidth * this.frameHeight);
    // let frameIndex = (this.frameHeight - 1) * this.frameWidth;
    // for (let y = 0; y < this.frameHeight; y += 1) {
    //   for (let x = 0; x < this.frameWidth; x += 1) {
    //     if (UIState[x][y] != null) {
    //       const color = UIState[x][y]?.color;
    //       if (color) {
    //         frame[frameIndex] = color;
    //       }
    //     }
    //     frameIndex += 1;
    //   }
    //   frameIndex -= this.frameWidth * 2;
    // }

    return this.UIState;
  }
}
