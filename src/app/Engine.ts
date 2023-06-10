/* eslint-disable class-methods-use-this */
import PhysicEngine from './PhysicEngine';
import Point from './Point';
import { UI } from './UI';
import Unit from './Unit';
import { mixColors } from './utils';

interface IWorldStateSave {
  [key: number]: { [key: number]: Unit };
}

interface ISaveFile {
  frameWidth: number;
  frameHeight: number;
  framePositionX: number;
  framePositionY: number;
  worldSideSize: number;
  lastUnitId: number;
  worldSate: IWorldStateSave;
}

export default class Engine {
  private frameWidth = 0;

  private frameHeight = 0;

  private framePositionX = 0;

  private framePositionY = 0;

  private physicEngine = new PhysicEngine();

  private worldSquareSide = 2;

  private mousePosition = { x: 0, y: 0 } as Point;

  private lastUnitId = 0;

  private save = '';

  private isPhysicsEnginePause = false;

  private unitCreationType = 0;

  private unitCreationSquareSize = 0;

  private gameMaxCountMaterials = 9;

  private ui = new UI({});

  // gameWorld = new Uint32Array(4);

  // 0x 01  02  33  44
  // 01 This is the type of unit
  // 02
  // 33
  // 44

  // Unit types
  // 0x 01  0 1 2 3 4 5
  // 01 This is number of the type of unit
  // 02 this is health of the unit
  //

  gameWorldState: Array<Array<Unit | null>> = Array.from(Array(4), () => new Array<Unit | null>(4));

  constructor(worldSquareSide: number) {
    this.worldSquareSide = worldSquareSide;

    const nodes = new Array(worldSquareSide);
    const copy = new Array(worldSquareSide);
    for (let i = 0; i < worldSquareSide; i++) {
      copy[i] = null;
    }

    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = copy.slice(0);
    }

    this.gameWorldState = nodes as Array<Array<Unit | null>>;

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
      'default-action': () => this.mainAction(),
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

  setPause(isPause: boolean) {
    this.isPhysicsEnginePause = isPause;
  }

  setFramePosition(x: number, y: number) {
    this.framePositionX = x;
    this.framePositionY = y;
    console.error(this.framePositionX, this.framePositionY);
  }

  setMousedPosition(point: Point) {
    this.mousePosition = point;
    this.ui.setMousedPosition({ x: point.x - this.framePositionX, y: point.y - this.framePositionY });
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;

    this.ui.setRendererSize(width, height);
  }

  extractFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    const uiState = this.ui.extractFrame();

    const frame = new Uint32Array(frameWidth * frameHeight);
    let frameIndex = (frameHeight - 1) * frameWidth;
    for (let y = framePositionY; y < framePositionY + frameHeight; y += 1) {
      for (let x = framePositionX; x < framePositionX + frameWidth; x += 1) {
        const uiPixel = uiState[x - framePositionX][y - framePositionY];
        if (this.gameWorldState[x][y] !== null || uiPixel) {
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

          if (uiPixel != null) {
            const uiColor = uiPixel.color;
            newColor = Number(mixColors(newColor || 0x0, uiColor));
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

  handleMouseLeftButton(mousePosition: Point) {
    this.mousePosition = mousePosition;
    this.ui.handleClick(
      { x: mousePosition.x - this.framePositionX, y: mousePosition.y - this.framePositionY },
    );
  }

  mainAction() {
    this.createUnitAtPoint(this.mousePosition, this.unitCreationType, this.unitCreationSquareSize);
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

  createUnitAtPoint(mousePosition: Point, unitType: number, squareSize: number) {
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
      this.gameWorldState = this.physicEngine.resolveWorld(this.gameWorldState, this.worldSquareSide);
    }
    return this.extractFrame(frameWidth, frameHeight, framePositionX, framePositionY);
  }

  convertWorldStateToSave() {
    const worldObj = {} as IWorldStateSave;
    for (let x = 0; x < this.worldSquareSide; x += 1) {
      for (let y = 0; y < this.worldSquareSide; y += 1) {
        if (this.gameWorldState[x][y] != null) {
          if (!worldObj[x]) {
            worldObj[x] = {};
          }
          worldObj[x][y] = this.gameWorldState[x][y] as Unit;
        }
      }
    }
    return worldObj;
  }

  serializeToSaveFile() {
    const saveObject = {
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
      framePositionX: this.framePositionX,
      framePositionY: this.framePositionY,
      worldSideSize: this.worldSquareSide,
      lastUnitId: this.lastUnitId,
      worldSate: this.convertWorldStateToSave(),
    };
    console.error(saveObject);
    this.save = JSON.stringify(saveObject);
    return JSON.stringify(saveObject);
  }

  convertSaveToWorldState(save: IWorldStateSave, worldSquareSide: number) {
    const newWorldState = Array.from(Array(worldSquareSide), () => new Array<Unit>(worldSquareSide));
    Object.keys(save).forEach((keyX) => {
      if (save[parseInt(keyX, 10)]) {
        Object.keys(save[parseInt(keyX, 10)]).forEach((keyY) => {
          if (save[parseInt(keyX, 10)][parseInt(keyY, 10)]) {
            const u = save[parseInt(keyX, 10)][parseInt(keyY, 10)];
            const unit = new Unit(u.unitTypeName, null, u.unitId, u.unitState);
            newWorldState[parseInt(keyX, 10)][parseInt(keyY, 10)] = unit;
          }
        });
      }
    });
    return newWorldState;
  }

  deserializeAnLoadFromFile(file: string = this.save) {
    const saveObject = JSON.parse(file) as ISaveFile;
    if (file && file[0] === '{') {
      const saveObjectKeysNumber = Object.keys(saveObject).length;
      if (saveObject && saveObjectKeysNumber > 0) {
        if (saveObject.worldSate) {
          this.frameWidth = saveObject.frameWidth;
          this.frameHeight = saveObject.frameHeight;
          this.framePositionX = saveObject.framePositionX;
          this.framePositionY = saveObject.framePositionY;
          this.worldSquareSide = saveObject.worldSideSize;
          this.lastUnitId = saveObject.lastUnitId;
          this.gameWorldState = this.convertSaveToWorldState(saveObject.worldSate, saveObject.worldSideSize);
        }
      }
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('pws-save', this.serializeToSaveFile());
  }

  loadFromLocalStorage() {
    const src = localStorage.getItem('pws-save');
    if (src) {
      this.deserializeAnLoadFromFile(src);
    }
  }
}
