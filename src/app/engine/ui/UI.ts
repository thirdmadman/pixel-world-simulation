/* eslint-disable class-methods-use-this */
import { IPoint } from '../../interfaces/IPoint';
import { getUnitTypeByUnitTypeName } from '../../data/UnitTypes';
import { getNotTransparent } from '../../utils/utils';
import { IPixelsLayer } from '../../interfaces/IPixelsLayer';

interface UIPixel {
  color: number;
  actionType: string | null;
}

interface UIPixelsLayer {
  pixelsLayer: IPixelsLayer;
  actionToPixels: Array<Array<string | null>> | null;
  isVisible: boolean;
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

  // private UIState: Array<Array<UIPixel | null>> = Array.from(Array(1), () => new Array<UIPixel>(1));

  private actions: ActionsObject = {};

  private isMouseDown = false;

  private eventsStack: Array<() => void> = [];

  private layers: Array<UIPixelsLayer> = [];

  constructor(actions: ActionsObject) {
    this.actions = actions;
    this.initLayers();
  }

  getCursorPixels() {
    const pixels = new Uint32Array(9);
    pixels[1] = 0xff000000;
    pixels[3] = 0xff000000;
    pixels[5] = 0xff000000;
    pixels[7] = 0xff000000;
    return pixels;
  }

  initLayers() {
    this.layers.push(
      {
        pixelsLayer: {
          width: 4,
          height: 80,
          x: 4,
          y: 40,
          pixels: new Uint32Array(4 * 80),
        },
        actionToPixels: null,
        isVisible: true,
      },
      {
        pixelsLayer: {
          width: 3,
          height: 3,
          x: 0,
          y: 0,
          pixels: this.getCursorPixels(),
        },
        actionToPixels: null,
        isVisible: true,
      },
    );

    this.drawUI();
  }

  getLayers() {
    this.layers[1].pixelsLayer.x = this.mouseUIPosition.x - 1;
    this.layers[1].pixelsLayer.y = this.mouseUIPosition.y - 1;

    const pixelLayers: Array<IPixelsLayer> = [];

    // Using for loop copy all pixelsLayer from layers which are visible
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].isVisible) {
        pixelLayers.push(this.layers[i].pixelsLayer);
      }
    }

    return pixelLayers;
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

  drawRectangleOnLayer(
    layer: UIPixelsLayer,
    color: number,
    xStart: number,
    yStart: number,
    width: number,
    height: number,
    actionType: null | string = null,
  ) {
    const xEnd = xStart + width;
    const yEnd = yStart + height;

    const { pixelsLayer, actionToPixels } = layer;
    const { pixels } = pixelsLayer;

    const pixelsLayerWidth = pixelsLayer.width;
    const pixelsLayerHeight = pixelsLayer.height;

    if (xStart < pixelsLayerWidth && yStart < pixelsLayerHeight && xStart >= 0 && yStart >= 0) {
      for (let layerRow = yStart; layerRow < yEnd; layerRow++) {
        const cyclicCol = (pixelsLayerHeight - 1 - layerRow) * pixelsLayerWidth;
        for (let layerCol = cyclicCol + xStart; layerCol < cyclicCol + width; layerCol++) {
          pixels[layerCol] = color;
        }
      }

      if (actionType !== null) {
        if (actionToPixels === null) {
          const nodes = new Array(pixelsLayerWidth);
          const copy = new Array(pixelsLayerHeight);
          // Problematic code
          for (let i = 0; i < pixelsLayerHeight; i++) {
            copy[i] = null;
          }

          for (let i = 0; i < nodes.length; i++) {
            nodes[i] = copy.slice(0);
          }

          layer.actionToPixels = nodes;
        }

        for (let x = xStart; x < xEnd; x += 1) {
          for (let y = yStart; y < yEnd; y += 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            layer.actionToPixels![x][y] = actionType;
          }
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
        // this.drawRectangle(element, currentX, currentY, buttonSize, buttonSize);
        this.drawRectangleOnLayer(
          this.layers[0],
          element.color,
          currentX,
          currentY,
          buttonSize,
          buttonSize,
          element.actionType,
        );
        currentY += buttonSize + buttonSpace;
      });
    };

    drawCreationMenuButtons(buttonsPixels, menuStartX, menuStartY, 4, 4);
  }

  drawUI() {
    this.drawCreationMenu(0, 0);
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
      const mousePosX = this.mousePosition.x;
      const mousePosY = this.mousePosition.y;

      let isAnyActionEmitted = false;

      for (let layerIndex = this.layers.length - 1; layerIndex >= 0; layerIndex--) {
        const layer = this.layers[layerIndex];

        if (!layer.actionToPixels || layer.actionToPixels === null) {
          // eslint-disable-next-line no-continue
          continue;
        }

        let isXInBounds = false;
        let isYInBounds = false;

        if (mousePosX >= layer.pixelsLayer.x && mousePosX < layer.pixelsLayer.x + layer.pixelsLayer.width) {
          isXInBounds = true;
        }

        if (mousePosY >= layer.pixelsLayer.y && mousePosY < layer.pixelsLayer.y + layer.pixelsLayer.height) {
          isYInBounds = true;
        }

        if (!isXInBounds || !isYInBounds) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const mouseInLayerX = mousePosX - layer.pixelsLayer.x;
        const mouseInLayerY = mousePosY - layer.pixelsLayer.y;

        const actionType = layer.actionToPixels[mouseInLayerX][mouseInLayerY];

        if (actionType) {
          const action = this.findAction(actionType);
          this.eventsStack.push(() => action(this.mousePosition));
          isAnyActionEmitted = true;
        }
      }

      if (!isAnyActionEmitted) {
        const action = this.findAction('default-action');
        this.eventsStack.push(() => action(this.mousePosition));
      }
    }

    const result = this.eventsStack;
    this.eventsStack = [];
    return result;
  }
}
