/* eslint-disable class-methods-use-this */
import PhysicEngine from './PhysicEngine';
import Point from './Point';
import Unit from './Unit';
// import getRandomInt from './utils';

export default class Engine {
  frameWidth = 0;

  frameHeight = 0;

  framePositionX = 0;

  framePositionY = 0;

  physicEngine = new PhysicEngine();

  worldSquareSide = 2;

  mousePosition = { x: 0, y: 0 } as Point;

  lastUnitId = 0;

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

  gameWorldState = Array.from(Array(4), () => new Array<Unit | null>(4));

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

  setMousedPosition(point: Point) {
    this.mousePosition = point;
  }

  setRendererSize(width: number, height: number) {
    this.frameWidth = width;
    this.frameHeight = height;
  }

  extractFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    const frame = new Uint32Array(frameWidth * frameHeight);
    let frameIndex = (frameHeight - 1) * frameWidth;
    for (let y = framePositionY; y < framePositionY + frameHeight; y += 1) {
      for (let x = framePositionX; x < framePositionX + frameWidth; x += 1) {
        if (this.gameWorldState[x][y] !== null) {
          frame[frameIndex] = this.gameWorldState[x][y]?.unitState.unitColor || 0x00000000;
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
          return null;
        }

        default:
          break;
      }

      return new Unit(unitTypeName, null, this.lastUnitId++);
    };

    if (squareSize > 0) {
      const squareStartX = Math.floor(mousePosition.x / squareSize) * squareSize;
      const squareStartY = Math.floor(mousePosition.y / squareSize) * squareSize;

      for (let y = 0; y < squareSize; y += 1) {
        for (let x = 0; x < squareSize; x += 1) {
          const generatedUnit = generateNewUnit();
          if (squareStartX + x < this.worldSquareSide && squareStartY + y < this.worldSquareSide) {
            if (!this.gameWorldState[squareStartX + x][squareStartY + y] || generatedUnit === null) {
              this.gameWorldState[squareStartX + x][squareStartY + y] = generatedUnit;
            }
          }
        }
      }
      return;
    }

    const generatedUnit = generateNewUnit();
    if (!this.gameWorldState[mousePosition.x][mousePosition.y] || generatedUnit === null) {
      this.gameWorldState[mousePosition.x][mousePosition.y] = generatedUnit;
    }
  }

  requestFrame(frameWidth: number, frameHeight: number, framePositionX: number, framePositionY: number) {
    this.gameWorldState = this.physicEngine.resolveWorld(this.gameWorldState, this.worldSquareSide);
    return this.extractFrame(frameWidth, frameHeight, framePositionX, framePositionY);
  }
}
