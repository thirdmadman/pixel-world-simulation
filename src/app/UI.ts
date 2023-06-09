/* eslint-disable class-methods-use-this */
import Point from './Point';
import { getUnitTypeByUnitTypeName } from './UnitTypes';

interface UIPixel {
  color: number;
  actionType: string | null;
}

interface ActionsObject {
  [propName: string]: () => void;
}

export class UI {
  private frameWidth = 1;

  private frameHeight = 1;

  private mousePosition = { x: 0, y: 0 } as Point;

  private UIState: Array<Array<UIPixel | null>> = Array.from(Array(1), () => new Array<UIPixel>(1));

  private actions: ActionsObject = {};

  constructor(actions: ActionsObject) {
    this.actions = actions;
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;
  }

  setMousedPosition(mousePosition: Point) {
    this.mousePosition = mousePosition;
  }

  dispatchAction(action: string) {
    const actionFunc = this.actions[action];
    if (actionFunc) {
      actionFunc();
    }
  }

  drawCursor() {
    if (this.mousePosition.x + 1 < this.frameWidth) {
      this.UIState[this.mousePosition.x + 1][this.mousePosition.y] = { color: 0xff000000, actionType: null };
    }

    if (this.mousePosition.x - 1 > 0) {
      this.UIState[this.mousePosition.x - 1][this.mousePosition.y] = { color: 0xff000000, actionType: null };
    }

    if (this.mousePosition.y + 1 < this.frameHeight) {
      this.UIState[this.mousePosition.x][this.mousePosition.y + 1] = { color: 0xff000000, actionType: null };
    }

    if (this.mousePosition.y - 1 > 0) {
      this.UIState[this.mousePosition.x][this.mousePosition.y - 1] = { color: 0xff000000, actionType: null };
    }
  }

  drawRectangle(pixelType: UIPixel, xStart: number, yStart: number, width: number, height: number) {
    const xEnd = xStart + width;
    const yEnd = yStart + height;
    if (xStart < this.frameWidth && yStart < this.frameHeight && xStart >= 0 && yStart >= 0) {
      for (let x = xStart; x < this.frameWidth && x <= xEnd; x += 1) {
        for (let y = yStart; y < this.frameHeight && y <= yEnd; y += 1) {
          this.UIState[x][y] = pixelType;
        }
      }
    }
  }

  drawCreationMenu() {
    const createWater: UIPixel = {
      color: getUnitTypeByUnitTypeName('pure-water').unitDefaultColor.baseColor,
      actionType: 'switch-create-pure-water',
    };

    const createSand: UIPixel = {
      color: getUnitTypeByUnitTypeName('yellow-sand').unitDefaultColor.baseColor,
      actionType: 'switch-create-yellow-sand',
    };

    const createRock: UIPixel = {
      color: getUnitTypeByUnitTypeName('gray-rock').unitDefaultColor.baseColor,
      actionType: 'switch-create-gray-rock',
    };

    const createGas: UIPixel = {
      color: getUnitTypeByUnitTypeName('flammable-gas').unitDefaultColor.baseColor,
      actionType: 'switch-create-flammable-gas',
    };

    const createBlood: UIPixel = {
      color: getUnitTypeByUnitTypeName('red-blood').unitDefaultColor.baseColor,
      actionType: 'switch-create-red-blood',
    };

    const createOil: UIPixel = {
      color: getUnitTypeByUnitTypeName('black-oil').unitDefaultColor.baseColor,
      actionType: 'switch-create-black-oil',
    };

    const createRockHard: UIPixel = {
      color: getUnitTypeByUnitTypeName('rock-hard').unitDefaultColor.baseColor,
      actionType: 'switch-create-rock-hard',
    };

    const createWoodWall: UIPixel = {
      color: getUnitTypeByUnitTypeName('wood-wall').unitDefaultColor.baseColor,
      actionType: 'switch-create-wood-wall',
    };

    const remove: UIPixel = {
      color: 0xff0000ff,
      actionType: 'switch-remove',
    };

    const ignite: UIPixel = {
      color: getUnitTypeByUnitTypeName('yellow-flame').unitDefaultColor.baseColor,
      actionType: 'switch-ignite',
    };

    this.drawRectangle(createWater, 160, 120, 4, 4);
    this.drawRectangle(createSand, 160, 112, 4, 4);
    this.drawRectangle(createRock, 160, 104, 4, 4);
    this.drawRectangle(createGas, 160, 96, 4, 4);
    this.drawRectangle(createBlood, 160, 88, 4, 4);
    this.drawRectangle(createOil, 160, 80, 4, 4);
    this.drawRectangle(createRockHard, 160, 72, 4, 4);
    this.drawRectangle(createWoodWall, 160, 64, 4, 4);
    this.drawRectangle(remove, 160, 56, 4, 4);
    this.drawRectangle(ignite, 160, 48, 4, 4);
  }

  drawUI() {
    this.drawCreationMenu();
    this.drawCursor();
  }

  handleClick(mousePosition: Point) {
    this.mousePosition = mousePosition;
    const action = this.UIState[mousePosition.x][mousePosition.y]?.actionType;
    console.log(this.UIState);
    if (action) {
      this.dispatchAction(action);
    } else {
      this.dispatchAction('default-action');
    }
  }

  extractFrame() {
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
