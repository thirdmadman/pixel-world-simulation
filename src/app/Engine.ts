/* eslint-disable no-bitwise */
/* eslint-disable class-methods-use-this */
import PhysicEngine from './PhysicEngine';
import Point from './Point';
import Unit from './Unit';
// import getRandomInt from './utils';

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
  frameWidth = 0;

  frameHeight = 0;

  framePositionX = 0;

  framePositionY = 0;

  physicEngine = new PhysicEngine();

  worldSquareSide = 2;

  mousePosition = { x: 0, y: 0 } as Point;

  lastUnitId = 0;

  save = '';

  isPhysicsEnginePause = false;

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
    // this.gameWorld = new Uint32Array(worldSize);
    this.worldSquareSide = worldSquareSide;

    this.gameWorldState = Array.from(Array(worldSquareSide), () => new Array<Unit>(worldSquareSide));

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

  setMousedPosition(point: Point) {
    this.mousePosition = point;
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;
  }

  extractFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    const mixColors = (colorA: number, colorB: number) => {
      // 0xff11aa00 a B G R

      const alphaA = Number(BigInt(colorA) >> BigInt(24));
      const alphaB = Number(BigInt(colorB) >> BigInt(24));

      if (alphaB === 255) {
        return colorB;
      }

      const alphaAInProc = alphaA / 0xff;
      const alphaBInProc = alphaB / 0xff;
      const colorANoAlpha = Number(BigInt(colorA) & BigInt(0x00ffffff));
      const colorBNoAlpha = Number(BigInt(colorB) & BigInt(0x00ffffff));

      const resultAlpha = (1 - alphaAInProc) * alphaBInProc + alphaAInProc;

      const extract = (
        cA: number,
        cB: number,
        alA: number,
        alB: number,
        rA: number,
      ) => Math.round(((1 - alA) * alB * cB + alA * cA) / rA);

      const rA = colorANoAlpha & 0xff;
      const gA = (colorANoAlpha & 0xff00) >> 8;
      const bA = (colorANoAlpha & 0xff0000) >> 16;

      const rB = colorBNoAlpha & 0xff;
      const gB = (colorBNoAlpha & 0xff00) >> 8;
      const bB = (colorBNoAlpha & 0xff0000) >> 16;

      const newR = extract(rA, rB, alphaAInProc, alphaBInProc, resultAlpha);
      const newG = extract(gA, gB, alphaAInProc, alphaBInProc, resultAlpha);
      const newB = extract(bA, bB, alphaAInProc, alphaBInProc, resultAlpha);

      const color = ((newB << 16) + (newG << 8) + newR);

      const result = (BigInt((Math.round(resultAlpha * 255))) << BigInt(24)) + BigInt(color);

      return result;
    };

    const frame = new Uint32Array(frameWidth * frameHeight);
    let frameIndex = (frameHeight - 1) * frameWidth;
    for (let y = framePositionY; y < framePositionY + frameHeight; y += 1) {
      for (let x = framePositionX; x < framePositionX + frameWidth; x += 1) {
        if (this.gameWorldState[x][y] !== null) {
          if (this.gameWorldState[x][y]?.unitState) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { unitColor } = this.gameWorldState[x][y]!.unitState;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { unitDecalColor } = this.gameWorldState[x][y]!.unitState;
            const newColor = mixColors(unitColor, unitDecalColor);
            frame[frameIndex] = Number(newColor);
          }

          // frame[frameIndex] = 0x0;
        }

        frameIndex += 1;
      }
      frameIndex -= frameWidth * 2;
    }

    return frame;
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
      if (this.gameWorldState[mousePosition.x][mousePosition.y]) {
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
