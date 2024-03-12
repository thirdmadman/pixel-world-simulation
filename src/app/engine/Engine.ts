import { PlayersEngine } from './PlayersEngine';
/* eslint-disable class-methods-use-this */
import { PhysicEngine } from './PhysicEngine';
import { IPoint } from '../interfaces/IPoint';
import { UI } from './ui/UI';
import { Unit } from '../models/Unit';
import { mixColors } from '../utils/utils';
import { WorldState } from '../interfaces/WorldState';
import { IGameState } from '../interfaces/IGameState';
import { IVector } from '../interfaces/IVector';
import { IUnitState } from '../interfaces/IUnitState';

export class Engine {
  private frameWidth = 0;

  private frameHeight = 0;

  private framePositionX = 0;

  private framePositionY = 0;

  private physicEngine = new PhysicEngine();

  private worldSquareSide = 2;

  private mousePosition: IPoint = { x: 0, y: 0 };

  private lastMousePosition: IPoint = { x: 0, y: 0 };

  private lastUnitId = 0;

  private isPhysicsEnginePause = false;

  private unitCreationType = 0;

  private unitCreationSquareSize = 0;

  private gameMaxCountMaterials = 9;

  private ui = new UI({});

  private playersEngine = new PlayersEngine();

  private eventsStack: Array<() => void> = [];

  private gameWorldState: WorldState = Array.from(Array(4), () => new Array<Unit | null>(4));

  constructor(worldSquareSide: number, engineState: IGameState | null = null) {
    if (engineState) {
      this.setEngineState(engineState);
    } else {
      this.worldSquareSide = worldSquareSide;

      const nodes = new Array(worldSquareSide);
      const copy = new Array(worldSquareSide);
      for (let i = 0; i < worldSquareSide; i++) {
        copy[i] = null;
      }

      for (let i = 0; i < nodes.length; i++) {
        nodes[i] = copy.slice(0);
      }

      this.gameWorldState = nodes as WorldState;
    }

    const actions = {
      'switch-create-pure-water': () => { this.unitCreationType = 0; },
      'switch-create-yellow-sand': () => { this.unitCreationType = 1; },
      'switch-create-gray-rock': () => { this.unitCreationType = 2; },
      'switch-create-flammable-gas': () => { this.unitCreationType = 3; },
      'switch-create-red-blood': () => { this.unitCreationType = 4; },
      'switch-create-black-oil': () => { this.unitCreationType = 6; },
      'switch-create-rock-hard': () => { this.unitCreationType = 8; },
      'switch-create-wood-wall': () => { this.unitCreationType = 9; },
      'switch-remove': () => { this.unitCreationType = 5; },
      'switch-ignite': () => { this.unitCreationType = 7; },
      'default-action': (mousePosition: IPoint) => this.mainAction(mousePosition),
    };

    this.ui = new UI(actions);

    // const toLinearArrayIndex = (x: number, y: number, width: number, height: number) => (height - y - 1) * width + x;
    // this.gameWorldState[
    //   toLinearArrayIndex(1, 2, this.worldSquareSide, this.worldSquareSide)
    // ].unitType.unitColor = 0xff0000ff;
    // this.gameWorldState[
    //   toLinearArrayIndex(9, 0, this.worldSquareSide, this.worldSquareSide)
    // ].unitType.unitColor = 0xff0000ff;

    // this.gameWorldState.fill(new Unit({
    //   unitHealth: 1,
    //   unitIsGas: false,
    //   unitIsFlammable: false,
    //   unitIsLiquid: false,
    //   unitIsStatic: true,
    //   unitColor: 0xff000000,
    // }, []));
  }

  setEngineState(engineState: IGameState | null) {
    if (!engineState) return;

    this.frameWidth = engineState.frameWidth;
    this.frameHeight = engineState.frameHeight;
    this.framePositionX = engineState.framePositionX;
    this.framePositionY = engineState.framePositionY;
    this.worldSquareSide = engineState.worldSquareSide;
    this.mousePosition = engineState.mousePosition;
    this.lastMousePosition = engineState.lastMousePosition;
    this.lastUnitId = 0;
    this.gameWorldState = engineState.gameWorldState;
  }

  getEngineState() {
    return {
      frameWidth: this.frameHeight,
      frameHeight: this.frameHeight,
      framePositionX: this.framePositionX,
      framePositionY: this.framePositionY,
      worldSquareSide: this.worldSquareSide,
      mousePosition: this.mousePosition,
      lastMousePosition: this.lastMousePosition,
      lastUnitId: this.lastUnitId,
      gameWorldState: this.gameWorldState,
    } as IGameState;
  }

  setPause(isPause: boolean) {
    this.isPhysicsEnginePause = isPause;
  }

  setFramePosition(x: number, y: number) {
    this.framePositionX = x;
    this.framePositionY = y;

    this.ui.setFramePosition({ x, y });
    this.playersEngine.setFramePosition({ x, y });
  }

  setMousedPosition(point: IPoint) {
    this.lastMousePosition = this.mousePosition;
    this.mousePosition = point;
    this.ui.setMousePosition(point);
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;

    this.ui.setRendererSize(width, height);
  }

  getUi() {
    return this.ui;
  }

  getPlayersEngine() {
    return this.playersEngine;
  }

  pushPlayerMoveEvent(direction: string) {
    const directionToDeltaPosition = {
      up: { x: 0, y: 1 },
      down: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };

    const deltaPosition = directionToDeltaPosition[direction as keyof typeof directionToDeltaPosition];

    if (!deltaPosition) {
      return;
    }

    const player = this.playersEngine.getPlayer(0);

    const playerExistingDesiredPositionX = player.globalPosition.x + player.desiredDeltaPosition.x;
    const playerExistingDesiredPositionY = player.globalPosition.y + player.desiredDeltaPosition.y;

    const newDesiredPositionX = playerExistingDesiredPositionX + deltaPosition.x;
    const newDesiredPositionY = playerExistingDesiredPositionY + deltaPosition.y;

    let isMovementPossible = false;

    const playerHeight = player.hitBoxHeight;
    const playerWidth = player.hitBoxWidth;

    const maxStepHeight = 2;

    if (!this.gameWorldState[newDesiredPositionX]) {
      return;
    }

    if (deltaPosition.y < 0) {
      for (let i = newDesiredPositionX; i < newDesiredPositionX + playerWidth; i++) {
        if (!this.gameWorldState[i]) {
          return;
        }

        const unit = this.gameWorldState[i][newDesiredPositionY];

        if (unit === undefined) {
          return;
        }

        if (unit && (unit.getUnitType().unitIsStatic || (!unit.getUnitType().unitIsGas
        && !unit.getUnitType().unitIsFlame && !unit.getUnitType().unitIsLiquid))) {
          return;
        }
      }

      isMovementPossible = true;
    } else if (deltaPosition.y > 0) {
      for (let i = newDesiredPositionX; i < newDesiredPositionX + playerWidth; i++) {
        if (!this.gameWorldState[i]) {
          return;
        }

        const unit = this.gameWorldState[i][newDesiredPositionY + playerHeight - 1];

        if (unit === undefined) {
          return;
        }

        if (unit && (unit.getUnitType().unitIsStatic || (!unit.getUnitType().unitIsGas
        && !unit.getUnitType().unitIsFlame && !unit.getUnitType().unitIsLiquid))) {
          return;
        }
      }

      isMovementPossible = true;
    } else if (deltaPosition.x > 0) {
      for (let offsetStepY = 0; offsetStepY <= maxStepHeight; offsetStepY++) {
        deltaPosition.y = offsetStepY;

        for (let i = newDesiredPositionY + offsetStepY; i < newDesiredPositionY + playerHeight + offsetStepY; i++) {
          const unit = this.gameWorldState[newDesiredPositionX + playerWidth - 1][i];

          if (unit === undefined) {
            return;
          }

          if (unit && (unit.getUnitType().unitIsStatic || (!unit.getUnitType().unitIsGas
        && !unit.getUnitType().unitIsFlame && !unit.getUnitType().unitIsLiquid))) {
            break;
          }

          if (i + 1 >= newDesiredPositionY + playerHeight + offsetStepY) {
            isMovementPossible = true;
          }
        }

        if (isMovementPossible) {
          break;
        }
      }
    } else if (deltaPosition.x < 0) {
      for (let offsetStepY = 0; offsetStepY <= maxStepHeight; offsetStepY++) {
        deltaPosition.y = offsetStepY;

        for (let i = newDesiredPositionY + offsetStepY; i < newDesiredPositionY + playerHeight + offsetStepY; i++) {
          const unit = this.gameWorldState[newDesiredPositionX][i];

          if (unit === undefined) {
            return;
          }

          if (unit && (unit.getUnitType().unitIsStatic || (!unit.getUnitType().unitIsGas
        && !unit.getUnitType().unitIsFlame && !unit.getUnitType().unitIsLiquid))) {
            break;
          }

          if (i + 1 >= newDesiredPositionY + playerHeight + offsetStepY) {
            isMovementPossible = true;
          }
        }

        if (isMovementPossible) {
          break;
        }
      }
    }

    if (isMovementPossible) {
      this.playersEngine.addPlayerDeltaPosition(0, deltaPosition);
    }
  }

  extractFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    this.eventsStack.push(...this.ui.collectActions());

    this.eventsStack.forEach((el) => el());
    this.eventsStack = [];

    const frame = new Uint32Array(frameWidth * frameHeight);
    let frameIndex = (frameHeight - 1) * frameWidth;
    for (let y = framePositionY; y < framePositionY + frameHeight; y += 1) {
      for (let x = framePositionX; x < framePositionX + frameWidth; x += 1) {
        if (this.gameWorldState[x][y] !== null) {
          let newColor: null | number = null;
          if (this.gameWorldState[x][y] !== null) {
            if (this.gameWorldState[x][y]?.unitState) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const { unitColor } = this.gameWorldState[x][y]!.unitState;
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const { unitDecalColor } = this.gameWorldState[x][y]!.unitState;
              if (unitDecalColor && unitDecalColor !== 0) {
                newColor = Number(mixColors(unitColor, unitDecalColor));
              } else {
                newColor = unitColor;
              }
            }
          }

          if (newColor) {
            frame[frameIndex] = newColor;
          }
        }

        frameIndex += 1;
      }
      frameIndex -= frameWidth * 2;
    }
    return frame;
  }

  handleMouseLeftButtonDown(mousePosition: IPoint) {
    this.ui.handleClickDown(mousePosition);
    this.lastMousePosition = this.mousePosition;
    this.mousePosition = mousePosition;
  }

  handleMouseLeftButtonUp(mousePosition: IPoint) {
    this.ui.handleClickUp(mousePosition);
    this.lastMousePosition = this.mousePosition;
    this.mousePosition = mousePosition;
  }

  mainAction(mousePosition: IPoint) {
    const createWrapper = (point: IPoint) => this.createUnitAtPoint(
      point,
      this.unitCreationType,
      this.unitCreationSquareSize,
    );
    this.drawLine(this.lastMousePosition, mousePosition, createWrapper);
    // this.createUnitAtPoint(mousePosition, this.unitCreationType, this.unitCreationSquareSize);
  }

  drawLine(startPoint: IPoint, endPoint: IPoint, callback: (p: IPoint) => void = () => {}) {
    const resultArray: Array<IPoint> = [];
    let newX = startPoint.x;
    let newY = startPoint.y;

    const x1 = endPoint.x;
    const y1 = endPoint.y;

    const dx = Math.abs(x1 - newX);
    const dy = Math.abs(y1 - newY);
    const sx = (newX < x1) ? 1 : -1;
    const sy = (newY < y1) ? 1 : -1;
    let err = dx - dy;

    do {
      callback({ x: newX, y: newY });
      resultArray.push({ x: newX, y: newY });

      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; newX += sx; }
      if (e2 < dx) { err += dx; newY += sy; }
    } while (!((newX === x1) && (newY === y1)));
    return resultArray;
  }

  handleMouseWheelUp() {
    if (this.unitCreationSquareSize < this.frameHeight * 2) {
      this.unitCreationSquareSize += 1;
    }
  }

  handleMouseWheelDown() {
    if (this.unitCreationSquareSize > 0) {
      this.unitCreationSquareSize -= 1;
    }
  }

  handleMouseMiddleButton() {
    if (this.unitCreationType < this.gameMaxCountMaterials) {
      this.unitCreationType += 1;
    } else {
      this.unitCreationType = 0;
    }
  }

  createUnit(unitType: string, unitVector: IVector | null, state: IUnitState | null) {
    this.lastUnitId += 1;
    const unit = new Unit(unitType, unitVector, this.lastUnitId);
    if (state) {
      const newState = { ...unit.unitState, ...state } as IUnitState;
      unit.unitState = newState;
    }

    return unit;
  }

  createUnitAtPoint(mousePosition: IPoint, unitType: number, squareSize: number) {
    const generateNewUnit = () => {
      let unitTypeName = 'pure-water';
      switch (unitType) {
        case 0: {
          unitTypeName = 'pure-water';
          break;
        }
        case 1: {
          unitTypeName = 'yellow-sand';
          break;
        }
        case 2: {
          unitTypeName = 'gray-rock';
          break;
        }

        case 3: {
          unitTypeName = 'flammable-gas';
          break;
        }
        case 4: {
          unitTypeName = 'red-blood';
          break;
        }
        case 5: {
          return null;
        }
        case 6: {
          unitTypeName = 'black-oil';
          break;
        }
        case 7: {
          return 'set-on-fire';
        }
        case 8: {
          unitTypeName = 'rock-hard';
          break;
        }
        case 9: {
          unitTypeName = 'wood-wall';
          break;
        }

        default:
          break;
      }

      return new Unit(unitTypeName, null, 0);
    };

    if (squareSize > 0) {
      const squareStartX = Math.floor(mousePosition.x / squareSize) * squareSize;
      const squareStartY = Math.floor(mousePosition.y / squareSize) * squareSize;

      for (let y = 0; y < squareSize; y += 1) {
        for (let x = 0; x < squareSize; x += 1) {
          const generatedUnit = generateNewUnit();
          if (squareStartX + x < this.worldSquareSide && squareStartY + y < this.worldSquareSide) {
            if (generatedUnit === 'set-on-fire') {
              if (this.gameWorldState[squareStartX + x][squareStartY + y]
                && this.gameWorldState[squareStartX + x][squareStartY + y]?.getUnitType().unitIsFlammable) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.gameWorldState[squareStartX + x][squareStartY + y]!.unitState.unitIsOnFire = true;
              }
            } else if (!this.gameWorldState[squareStartX + x][squareStartY + y] || generatedUnit === null) {
              this.gameWorldState[squareStartX + x][squareStartY + y] = generatedUnit;
              if (generatedUnit !== null) {
                generatedUnit.unitId = this.lastUnitId++;
              }
            }
          }
        }
      }
      return;
    }

    const generatedUnit = generateNewUnit();
    if (generatedUnit === 'set-on-fire') {
      if (this.gameWorldState[mousePosition.x][mousePosition.y]
        && this.gameWorldState[mousePosition.x][mousePosition.y]?.getUnitType().unitIsFlammable) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.gameWorldState[mousePosition.x][mousePosition.y]!.unitState.unitIsOnFire = true;
      }
    } else if (!this.gameWorldState[mousePosition.x][mousePosition.y] || generatedUnit === null) {
      this.gameWorldState[mousePosition.x][mousePosition.y] = generatedUnit;
      if (generatedUnit !== null) {
        generatedUnit.unitId = this.lastUnitId++;
      }
    }
  }

  requestFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    if (!this.isPhysicsEnginePause) {
      this.gameWorldState = this.physicEngine.resolveWorld(
        this.gameWorldState,
        this.worldSquareSide,
        (
          unitType: string,
          unitVector: IVector | null,
          unitState: IUnitState | null,
        ) => this.createUnit(unitType, unitVector, unitState),
      );
      this.pushPlayerMoveEvent('down');
    }
    return this.extractFrame(frameWidth, frameHeight, framePositionX, framePositionY);
  }
}
