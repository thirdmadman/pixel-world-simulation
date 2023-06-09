/* eslint-disable class-methods-use-this */
import { IPoint } from '../../interfaces/IPoint';
import { getUnitTypeByUnitTypeName } from '../../data/UnitTypes';
import { getNotTransparent } from '../../utils/utils';

interface UIPixel {
  color: number;
  actionType: string | null;
}

interface ActionsObject {
  [propName: string]: (mousePosition: IPoint) => void;
}

export class UI {
  private frameWidth = 1;

  private frameHeight = 1;

  private mousePosition: IPoint = { x: 0, y: 0 };

  private mouseUIPosition: IPoint = { x: 0, y: 0 };

  private framePosition: IPoint = { x: 0, y: 0 };

  private UIState: Array<Array<UIPixel | null>> = Array.from(Array(1), () => new Array<UIPixel>(1));

  private actions: ActionsObject = {};

  private isMouseDown = false;

  private eventsStack: Array<() => void> = [];

  constructor(actions: ActionsObject) {
    this.actions = actions;
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;
  }

  setMousePosition(mousePosition: IPoint) {
    this.mousePosition = mousePosition;
    this.mouseUIPosition.x = mousePosition.x - this.framePosition.x;
    this.mouseUIPosition.y = mousePosition.y - this.framePosition.y;
  }

  setFramePosition(framePosition: IPoint) {
    this.framePosition = framePosition;
    this.mouseUIPosition.x = this.mousePosition.x - this.framePosition.x;
    this.mouseUIPosition.y = this.mousePosition.y - this.framePosition.y;
  }

  findAction(action: string) {
    const actionFunc = this.actions[action];
    if (actionFunc) {
      return actionFunc;
    }
    return () => {};
  }

  drawCursor() {
    if (this.mouseUIPosition.x + 1 < this.frameWidth) {
      this.UIState[this.mouseUIPosition.x + 1][this.mouseUIPosition.y] = { color: 0xff000000, actionType: null };
    }

    if (this.mouseUIPosition.x - 1 > 0) {
      this.UIState[this.mouseUIPosition.x - 1][this.mouseUIPosition.y] = { color: 0xff000000, actionType: null };
    }

    if (this.mouseUIPosition.y + 1 < this.frameHeight) {
      this.UIState[this.mouseUIPosition.x][this.mouseUIPosition.y + 1] = { color: 0xff000000, actionType: null };
    }

    if (this.mouseUIPosition.y - 1 > 0) {
      this.UIState[this.mouseUIPosition.x][this.mouseUIPosition.y - 1] = { color: 0xff000000, actionType: null };
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

  drawCreationMenu(menuStartX: number, menuStartY: number) {
    const buttonsPixels: Array<UIPixel> = [
      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('pure-water').unitDefaultColor.baseColor),
        actionType: 'switch-create-pure-water',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('yellow-sand').unitDefaultColor.baseColor),
        actionType: 'switch-create-yellow-sand',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('gray-rock').unitDefaultColor.baseColor),
        actionType: 'switch-create-gray-rock',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('flammable-gas').unitDefaultColor.baseColor),
        actionType: 'switch-create-flammable-gas',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('red-blood').unitDefaultColor.baseColor),
        actionType: 'switch-create-red-blood',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('black-oil').unitDefaultColor.baseColor),
        actionType: 'switch-create-black-oil',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('rock-hard').unitDefaultColor.baseColor),
        actionType: 'switch-create-rock-hard',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('wood-wall').unitDefaultColor.baseColor),
        actionType: 'switch-create-wood-wall',
      },

      {
        color: 0xff0000ff,
        actionType: 'switch-remove',
      },

      {
        color: getNotTransparent(getUnitTypeByUnitTypeName('yellow-flame').unitDefaultColor.baseColor),
        actionType: 'switch-ignite',
      },
    ];

    const drawCreationMenuButtons = (
      buttons: Array<UIPixel>,
      startX: number,
      startY: number,
      buttonSize: number,
      buttonSpace: number,
    ) => {
      const currentX = startX;
      let currentY = startY;
      buttons.forEach((element) => {
        this.drawRectangle(element, currentX, currentY, buttonSize, buttonSize);
        currentY -= (buttonSize + buttonSpace);
      });
    };

    drawCreationMenuButtons(buttonsPixels, menuStartX, menuStartY, 4, 4);
  }

  drawUI() {
    this.drawCreationMenu(4, 120);
    this.drawCursor();
  }

  handleClickDown(mousePosition: IPoint) {
    this.setMousePosition(mousePosition);
    this.isMouseDown = true;
  }

  handleClickUp(mousePosition: IPoint) {
    this.setMousePosition(mousePosition);
    this.isMouseDown = false;
  }

  collectActions() {
    if (this.isMouseDown) {
      const actionType = this.UIState[this.mouseUIPosition.x][this.mouseUIPosition.y]?.actionType;
      if (actionType) {
        const action = this.findAction(actionType);
        this.eventsStack.push(() => action(this.mousePosition));
      } else {
        const action = this.findAction('default-action');
        this.eventsStack.push(() => action(this.mousePosition));
      }
    }

    const result = this.eventsStack;
    this.eventsStack = [];
    return result;
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

    return this.UIState;
  }
}
