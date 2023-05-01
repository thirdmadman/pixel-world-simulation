/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Unit from './Unit';
import getRandomInt from './utils';

/* eslint-disable class-methods-use-this */
export default class PhysicEngine {
  resolveWorld(currentWorld: Array<Array<Unit | null>>, worldSideSize: number) {
    // const toLinearArrayIndex = (x: number, y: number, width: number, height: number) => (height - y - 1) * width + x;

    // const testForCopies = (x: number, y: number) => {
    //   if (currentWorld[x][y] != null) {
    //     for (let y2 = 0; y2 < worldSideSize; y2 += 1) {
    //       for (let x2 = 0; x2 < worldSideSize; x2 += 1) {
    //         if (currentWorld[x][y] != null) {
    //           if (x2 !== x && y2 !== y && currentWorld[x2][y2]?.unitId === currentWorld[x][y]?.unitId) {
    //             currentWorld[x2][y2] = null;
    //             return 'this is copy';
    //           }
    //         }
    //       }
    //     }
    //   }
    //   return '';
    // };

    const replaceUnit = (xSrc: number, ySrc: number, xDist: number, yDist: number, isUpdated = true) => {
      const tmp = currentWorld[xDist][yDist];
      currentWorld[xDist][yDist] = currentWorld[xSrc][ySrc];
      currentWorld[xDist][yDist]!.isUpdated = isUpdated;
      currentWorld[xSrc][ySrc] = tmp;
    };

    const processSand = (x: number, y: number) => {
      if (y > 0) {
        const isUnderEmptyOrLiquids = !currentWorld[x][y - 1] || currentWorld[x][y - 1]?.unitType.unitIsLiquid;

        const isUnderLeftDiagonalFreeOrLiquids = x > 0
        && (!currentWorld[x - 1][y - 1]
        || currentWorld[x - 1][y - 1]?.unitType.unitIsLiquid);

        const isUnderRightDiagonalFreeOrLiquids = x < worldSideSize - 1
        && (!currentWorld[x + 1][y - 1]
        || currentWorld[x + 1][y - 1]?.unitType.unitIsLiquid);

        const isUnderDiagonalFreeOrLiquids = isUnderLeftDiagonalFreeOrLiquids && isUnderRightDiagonalFreeOrLiquids;

        const isLeftFreeOrLiquid = x > 0
        && (!currentWorld[x - 1][y] || currentWorld[x - 1][y]?.unitType.unitIsLiquid);

        const isRightFreeOrLiquid = x < worldSideSize - 1
        && (!currentWorld[x + 1][y] || currentWorld[x + 1][y]?.unitType.unitIsLiquid);

        const isLeftAndRightFreeOrLiquids = isLeftFreeOrLiquid && isRightFreeOrLiquid;

        if (isUnderEmptyOrLiquids) {
          if (currentWorld[x][y - 1]?.unitType.unitIsLiquid) {
            if (y < worldSideSize - 1) {
              if (!currentWorld[x][y + 1]) {
                replaceUnit(x, y, x, y - 1);
              } else if (x > 0 && !currentWorld[x - 1][y]) {
                replaceUnit(x, y, x - 1, y);
              } else if (x < worldSideSize - 1 && !currentWorld[x + 1][y]) {
                replaceUnit(x, y, x + 1, y);
              } else {
                replaceUnit(x, y, x, y - 1);
              }
            }
          } else if (!currentWorld[x][y - 1]) {
            replaceUnit(x, y, x, y - 1);
          }
        } else if ((isUnderDiagonalFreeOrLiquids) && (isLeftAndRightFreeOrLiquids)) {
          const dir = getRandomInt(0, 1);
          if (dir === 0) {
            replaceUnit(x, y, x - 1, y - 1);
          } else {
            replaceUnit(x, y, x + 1, y - 1);
          }
        } else if (isUnderLeftDiagonalFreeOrLiquids && isLeftFreeOrLiquid) {
          replaceUnit(x, y, x - 1, y - 1);
        } else if (isUnderRightDiagonalFreeOrLiquids && isRightFreeOrLiquid) {
          replaceUnit(x, y, x + 1, y - 1);
        }
      }
    };

    const processWater = (x: number, y: number) => {
      if (y > 0) {
        if (!currentWorld[x][y - 1]) {
          replaceUnit(x, y, x, y - 1);
        } else if (
          x > 0
          && !currentWorld[x - 1][y - 1]
          && !currentWorld[x - 1][y]
          && x < worldSideSize - 1
          && !currentWorld[x + 1][y - 1]
          && !currentWorld[x + 1][y]
        ) {
          const dir = getRandomInt(0, 1);
          if (dir === 0) {
            replaceUnit(x, y, x - 1, y - 1);
          } else {
            replaceUnit(x, y, x + 1, y - 1);
          }
        } else if (x > 0 && !currentWorld[x - 1][y - 1] && !currentWorld[x - 1][y]) {
          replaceUnit(x, y, x - 1, y - 1);
        } else if (x < worldSideSize - 1 && !currentWorld[x + 1][y - 1] && !currentWorld[x + 1][y]) {
          replaceUnit(x, y, x + 1, y - 1);
        } else if (x < worldSideSize - 1 && !currentWorld[x + 1][y]) {
          replaceUnit(x, y, x + 1, y);
        } else if (x > 0 && !currentWorld[x - 1][y]) {
          replaceUnit(x, y, x - 1, y);
        }
      } else if (y === 0) {
        if (x > 0 && !currentWorld[x - 1][y]) {
          replaceUnit(x, y, x - 1, y);
        } else if (x < worldSideSize - 1 && !currentWorld[x + 1][y]) {
          replaceUnit(x, y, x + 1, y);
        }
      }
    };

    const processUnit = (x: number, y: number) => {
      if (!currentWorld[x][y]?.isUpdated) {
        if (currentWorld[x][y]?.unitType.unitIsLiquid) {
          processWater(x, y);
        } else {
          processSand(x, y);
        }
      }
    };

    const processUnits = (x: number, y: number) => {
      if (currentWorld[x][y] != null) {
        if (!currentWorld[x][y]?.unitType.unitIsStatic) {
          if (!currentWorld[x][y]?.unitType.unitIsGas) {
            processUnit(x, y);
          }
        }
      }
    };

    for (let y = 0; y < worldSideSize; y += 1) {
      for (let x = 0; x < worldSideSize; x += 1) {
        // const stateUnitIndex = toLinearArrayIndex(x, y, worldSideSize, worldSideSize);
        if (currentWorld[x][y] != null) {
          if (!currentWorld[x][y]?.unitType.unitIsStatic) {
            currentWorld[x][y]!.isUpdated = false;
          }
        }
      }
    }

    // let isReverseDirection = false;

    for (let y = 0; y < worldSideSize; y += 1) {
      const dir = Boolean(getRandomInt(0, 1));

      if (dir === false) {
        for (let x = 0; x < worldSideSize; x += 1) {
          processUnits(x, y);
        }
      } else {
        for (let x = worldSideSize - 1; x >= 0; x -= 1) {
          processUnits(x, y);
        }
      }
      // isReverseDirection = !isReverseDirection;
    }

    // for (let y = 0; y < worldSideSize; y += 1) {
    //   for (let x = 0; x < worldSideSize; x += 1) {
    //     if (currentWorld[x][y] != null) {
    //       for (let y2 = 0; y2 < worldSideSize; y2 += 1) {
    //         for (let x2 = 0; x2 < worldSideSize; x2 += 1) {
    //           if (currentWorld[x][y] != null) {
    //             if (x2 !== x && y2 !== y && currentWorld[x2][y2]?.unitId === currentWorld[x][y]?.unitId) {
    //               console.error('this is copy');
    //               currentWorld[x2][y2] = null;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    return currentWorld;
  }
}
