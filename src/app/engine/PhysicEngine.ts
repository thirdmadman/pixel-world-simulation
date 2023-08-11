import { IUnitState } from '../interfaces/IUnitState';
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { IVector } from '../interfaces/IVector';
import { Unit } from '../models/Unit';
import { getRandomInt } from '../utils/utils';

/* eslint-disable class-methods-use-this */
export class PhysicEngine {
  private lastY = 0;

  private isLineByLineResolve = false;

  private lastUnitId = 0;

  private emittedUnits: Array<{ unitType: string, x: number, y: number }> = [];

  resolveWorld(
    currentWorld: Array<Array<Unit | null>>,
    worldSideSize: number,
    createUnit: (unitType: string, unitVector: IVector | null, state: IUnitState | null) => Unit,
  ) {
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
      if (currentWorld[xDist][yDist]) {
        currentWorld[xDist][yDist]!.isUpdated = isUpdated;
      }
      currentWorld[xSrc][ySrc] = tmp;
      if (currentWorld[xSrc][ySrc]) {
        currentWorld[xSrc][ySrc]!.isUpdated = isUpdated;
      }
    };

    const displaceLiquidOrGasUnit = (x: number, y: number, isLiquid: boolean) => {
      const displaceLine = (yAdd: number) => {
        if (!currentWorld[x][y + yAdd]) {
          replaceUnit(x, y, x, y + yAdd);
          return true;
        }
        if (x > 0 && !currentWorld[x - 1][y + yAdd]) {
          replaceUnit(x, y, x - 1, y + yAdd);
          return true;
        }
        if (x < worldSideSize - 1 && !currentWorld[x + 1][y + yAdd]) {
          replaceUnit(x, y, x + 1, y + yAdd);
          return true;
        }
        return false;
      };

      const dir = isLiquid ? -1 : 1;

      if (y >= 0) {
        if (displaceLine(1 * dir)) {
          return true;
        }
      } else if (x > 0 && !currentWorld[x - 1][y]) {
        replaceUnit(x, y, x - 1, y);
        return true;
      } else if (x < worldSideSize - 1 && !currentWorld[x + 1][y]) {
        replaceUnit(x, y, x + 1, y);
        return true;
      } else if (y < worldSideSize - 1) {
        if (displaceLine(-1 * dir)) {
          return true;
        }
      }
      return false;
    };

    const displaceOrReplaceUnit = (xSrc: number, ySrc: number, xDist: number, yDist: number, isUpdated = true) => {
      if (!currentWorld[xDist][yDist]) {
        replaceUnit(xSrc, ySrc, xDist, yDist, isUpdated);
        return;
      }

      const isLiquid = currentWorld[xDist][yDist]!.getUnitType().unitIsLiquid;

      const isDisplaced = displaceLiquidOrGasUnit(xDist, yDist, isLiquid);
      if (isDisplaced) {
        return;
      }

      replaceUnit(xSrc, ySrc, xDist, yDist, isUpdated);
    };

    const processGas = (x: number, y: number) => {
      const isLeftFree = x > 0 && !currentWorld[x - 1][y];
      const isRightFree = x < worldSideSize - 1 && !currentWorld[x + 1][y];

      if (y <= worldSideSize - 1) {
        const isUpperEmpty = !currentWorld[x][y + 1];
        const isUpperLeftDiagonalFree = x > 0 && !currentWorld[x - 1][y + 1];
        const isUpperRightDiagonalFree = x < worldSideSize - 1 && !currentWorld[x + 1][y + 1];
        const isUpperDiagonalFree = isUpperLeftDiagonalFree && isUpperRightDiagonalFree;
        const isLeftAndRightFree = isLeftFree && isRightFree;

        if (isUpperEmpty) {
          replaceUnit(x, y, x, y + 1);
        } else if (isUpperDiagonalFree && isLeftAndRightFree) {
          const dir = getRandomInt(0, 1);
          if (dir === 0) {
            replaceUnit(x, y, x - 1, y + 1);
          } else {
            replaceUnit(x, y, x + 1, y + 1);
          }
        } else if (isUpperLeftDiagonalFree && isLeftFree) {
          replaceUnit(x, y, x - 1, y + 1);
        } else if (isUpperRightDiagonalFree && isRightFree) {
          replaceUnit(x, y, x + 1, y + 1);
        } else if (isLeftFree) {
          replaceUnit(x, y, x - 1, y);
        } else if (isRightFree) {
          replaceUnit(x, y, x + 1, y);
        }
      } else if (y === worldSideSize - 1) {
        if (isLeftFree) {
          replaceUnit(x, y, x - 1, y);
        } else if (isRightFree) {
          replaceUnit(x, y, x + 1, y);
        }
      }
    };

    const processPowder = (x: number, y: number) => {
      if (y <= 0) {
        return;
      }

      let isLeftFree = false;
      let isLeftLiquid = false;
      let isLeftGas = false;

      let isRightFree = false;
      let isRightLiquid = false;
      let isRightGas = false;

      let isUnderLeftDiagonalFree = false;
      let isUnderLeftDiagonalLiquid = false;
      let isUnderLeftDiagonalGas = false;

      let isUnderRightDiagonalFree = false;
      let isUnderRightDiagonalLiquid = false;
      let isUnderRightDiagonalGas = false;

      if (x > 0) {
        isLeftFree = !currentWorld[x - 1][y];
        if (!isLeftFree) {
          isLeftLiquid = !!currentWorld[x - 1][y]?.getUnitType().unitIsLiquid;
          isLeftGas = !!currentWorld[x - 1][y]?.getUnitType().unitIsGas;
        }

        isUnderLeftDiagonalFree = !currentWorld[x - 1][y - 1];
        if (!isUnderLeftDiagonalFree) {
          isUnderLeftDiagonalLiquid = !!currentWorld[x - 1][y - 1]?.getUnitType().unitIsLiquid;
          isUnderLeftDiagonalGas = !!currentWorld[x - 1][y - 1]?.getUnitType().unitIsGas;
        }
      }

      if (x < worldSideSize - 1) {
        isRightFree = !currentWorld[x + 1][y];
        if (!isRightFree) {
          isRightLiquid = !!currentWorld[x + 1][y]?.getUnitType().unitIsLiquid;
          isRightGas = !!currentWorld[x + 1][y]?.getUnitType().unitIsGas;
        }

        isUnderRightDiagonalFree = !currentWorld[x + 1][y - 1];
        if (!isUnderRightDiagonalFree) {
          isUnderRightDiagonalLiquid = !!currentWorld[x + 1][y - 1]?.getUnitType().unitIsLiquid;
          isUnderRightDiagonalGas = !!currentWorld[x + 1][y - 1]?.getUnitType().unitIsGas;
        }
      }

      const isUnderLiquidsOrGas = currentWorld[x][y - 1]
      && (currentWorld[x][y - 1]?.getUnitType().unitIsLiquid
      || currentWorld[x][y - 1]?.getUnitType().unitIsGas);

      const isUnderEmptyOrLiquidsOrGas = !currentWorld[x][y - 1] || isUnderLiquidsOrGas;

      const isLeftFreeOrLiquidOrGas = isLeftFree || isLeftLiquid || isLeftGas;

      const isRightFreeOrLiquidOrGas = isRightFree || isRightLiquid || isRightGas;

      const isUnderLeftDiagonalFreeOrLiquidsOrGas = isUnderLeftDiagonalFree
      || isUnderLeftDiagonalLiquid || isUnderLeftDiagonalGas;

      const isUnderRightDiagonalFreeOrLiquidsOrGas = isUnderRightDiagonalFree
      || isUnderRightDiagonalLiquid || isUnderRightDiagonalGas;

      const isUnderDiagonalFreeOrLiquidsOrGas = isUnderLeftDiagonalFreeOrLiquidsOrGas
      && isUnderRightDiagonalFreeOrLiquidsOrGas;

      const isLeftAndRightFreeOrLiquidsOrGas = isLeftFreeOrLiquidOrGas && isRightFreeOrLiquidOrGas;

      if (isUnderEmptyOrLiquidsOrGas) {
        if (isUnderLiquidsOrGas) {
          if (y < worldSideSize - 1) {
            displaceOrReplaceUnit(x, y, x, y - 1);
          }
        } else if (!currentWorld[x][y - 1]) {
          replaceUnit(x, y, x, y - 1);
        }
      } else if (isUnderDiagonalFreeOrLiquidsOrGas && isLeftAndRightFreeOrLiquidsOrGas) {
        const dir = getRandomInt(0, 1);
        if (dir === 0) {
          displaceOrReplaceUnit(x, y, x - 1, y - 1);
        } else {
          displaceOrReplaceUnit(x, y, x + 1, y - 1);
        }
      } else if (isUnderLeftDiagonalFreeOrLiquidsOrGas && isLeftFreeOrLiquidOrGas) {
        displaceOrReplaceUnit(x, y, x - 1, y - 1);
      } else if (isUnderRightDiagonalFreeOrLiquidsOrGas && isRightFreeOrLiquidOrGas) {
        displaceOrReplaceUnit(x, y, x + 1, y - 1);
      }
    };

    const processWater = (x: number, y: number) => {
      const isLeftFree = x > 0 && !currentWorld[x - 1][y];
      const isLeftUpdated = x > 0 && !isLeftFree && !isLeftFree && currentWorld[x - 1][y]?.isUpdated;
      const isLeftLessDense = x > 0 && !isLeftFree
        && currentWorld[x - 1][y]?.getUnitType().unitIsLiquid
        && currentWorld[x - 1][y]!.getUnitType().unitDensity < currentWorld[x][y]!.getUnitType().unitDensity;
      const isLeftGas = x > 0 && !isLeftFree && currentWorld[x - 1][y]?.getUnitType().unitIsGas;

      const isRightFree = x < worldSideSize - 1 && !currentWorld[x + 1][y];
      const isRightUpdated = x < worldSideSize - 1 && !isRightFree && currentWorld[x + 1][y]?.isUpdated;
      const isRightLessDense = x < worldSideSize - 1 && !isRightFree
        && currentWorld[x + 1][y]?.getUnitType().unitIsLiquid
        && currentWorld[x + 1][y]!.getUnitType().unitDensity < currentWorld[x][y]!.getUnitType().unitDensity;
      const isRightGas = x < worldSideSize - 1 && !isRightFree && currentWorld[x + 1][y]?.getUnitType().unitIsGas;

      if (y > 0) {
        const isUnderEmpty = !currentWorld[x][y - 1];
        const isUnderLessDense = !isUnderEmpty
          && currentWorld[x][y - 1]?.getUnitType().unitIsLiquid
          && currentWorld[x][y - 1]!.getUnitType().unitDensity < currentWorld[x][y]!.getUnitType().unitDensity;
        const isUnderGas = !isUnderEmpty && currentWorld[x][y - 1]?.getUnitType().unitIsGas;

        const isUnderLeftDiagonalFree = x > 0 && !currentWorld[x - 1][y - 1];
        const isUnderLeftDiagonalLessDense = x > 0
          && !isUnderLeftDiagonalFree
          && currentWorld[x - 1][y - 1]!.getUnitType().unitIsLiquid
          && currentWorld[x - 1][y - 1]!.getUnitType().unitDensity < currentWorld[x][y]!.getUnitType().unitDensity;
        const isUnderLeftDiagonalGas = x > 0
          && !isUnderLeftDiagonalFree
          && currentWorld[x - 1][y - 1]!.getUnitType().unitIsGas;
        const isUnderLeftDiagonalUpdated = x > 0
          && !isUnderLeftDiagonalFree
          && currentWorld[x - 1][y - 1]?.isUpdated;

        const isUnderRightDiagonalFree = x < worldSideSize - 1 && !currentWorld[x + 1][y - 1];
        const isUnderRightDiagonalLessDense = x < worldSideSize - 1
          && !isUnderRightDiagonalFree
          && currentWorld[x + 1][y - 1]!.getUnitType().unitIsLiquid
          && currentWorld[x + 1][y - 1]!.getUnitType().unitDensity < currentWorld[x][y]!.getUnitType().unitDensity;
        const isUnderRightDiagonalGas = x < worldSideSize - 1
          && !isUnderRightDiagonalFree
          && currentWorld[x + 1][y - 1]!.getUnitType().unitIsGas;
        const isUnderRightDiagonalUpdated = x < worldSideSize - 1
          && !isUnderRightDiagonalFree
          && currentWorld[x + 1][y - 1]?.isUpdated;

        const isUnderDiagonalFree = isUnderLeftDiagonalFree && isUnderRightDiagonalFree;
        const isUnderDiagonalLessDense = isUnderLeftDiagonalLessDense && isUnderRightDiagonalLessDense;
        // const isUnderDiagonalUpdated = isUnderLeftDiagonalUpdated && isUnderRightDiagonalUpdated;
        const isUnderDiagonalGas = isUnderLeftDiagonalGas && isUnderRightDiagonalGas;

        const isLeftAndRightFree = isLeftFree && isRightFree;
        const isLeftAndRightUpdated = isLeftUpdated && isRightUpdated;
        const isLeftAndRightLessDense = isLeftLessDense && isRightLessDense;
        const isLeftAndRightGas = isLeftGas && isRightGas;

        if (isUnderEmpty || isUnderLessDense || isUnderGas) {
          replaceUnit(x, y, x, y - 1);
        } else if (
          !isLeftAndRightUpdated
          && (isUnderDiagonalFree || isUnderDiagonalLessDense || isUnderDiagonalGas)
          && (isLeftAndRightFree || isLeftAndRightLessDense || isLeftAndRightGas)
        ) {
          const dir = getRandomInt(0, 1);
          if (dir === 0) {
            replaceUnit(x, y, x - 1, y - 1);
          } else {
            replaceUnit(x, y, x + 1, y - 1);
          }
        } else if (
          !isUnderLeftDiagonalUpdated
          && (isUnderLeftDiagonalFree || isUnderLeftDiagonalLessDense || isUnderLeftDiagonalGas)
          && (isLeftFree || isLeftLessDense || isLeftGas)
        ) {
          replaceUnit(x, y, x - 1, y - 1);
        } else if (
          !isUnderRightDiagonalUpdated
          && (isUnderRightDiagonalFree || isUnderRightDiagonalLessDense || isUnderRightDiagonalGas)
          && (isRightFree || isRightLessDense || isRightGas)
        ) {
          replaceUnit(x, y, x + 1, y - 1);
        } else if (!isLeftUpdated && (isLeftFree || isLeftLessDense || isLeftGas)) {
          replaceUnit(x, y, x - 1, y);
        } else if (!isRightUpdated && (isRightFree || isRightLessDense || isRightGas)) {
          replaceUnit(x, y, x + 1, y);
        }
      } else if (y === 0) {
        if (!isLeftUpdated && (isLeftFree || isLeftLessDense || isLeftGas)) {
          replaceUnit(x, y, x - 1, y);
        } else if (!isRightUpdated && (isRightFree || isRightLessDense || isRightGas)) {
          replaceUnit(x, y, x + 1, y);
        }
      }
    };

    const isInBounds = (x: number, y: number) => {
      if (x >= 0 && x < worldSideSize && y >= 0 && y < worldSideSize) {
        return true;
      }
      return false;
    };

    const setOnFireNeighbor = (xNeighbor: number, yNeighbor: number) => {
      if (!isInBounds(xNeighbor, yNeighbor)) {
        return;
      }

      if (!currentWorld[xNeighbor][yNeighbor] || !currentWorld[xNeighbor][yNeighbor]?.getUnitType().unitIsFlammable) {
        return;
      }

      if (currentWorld[xNeighbor][yNeighbor]!.unitState.unitIsOnFire) {
        return;
      }

      // if (currentWorld[xNeighbor][yNeighbor]!.unitState.flameSustainability <= 1) {
      //   const random = getRandomInt(0, 1000);
      //   const prob = (currentWorld[xNeighbor][yNeighbor]?.getUnitType().unitDefaultFlameSustainability || 0);
      //   if (random >= prob) {
      //     currentWorld[xNeighbor][yNeighbor]!.unitState.unitIsOnFire = true;
      //   }
      // } else {
      //   currentWorld[xNeighbor][yNeighbor]!.unitState.flameSustainability -= 1;
      // }

      const random = getRandomInt(0, 1000);
      const prob = (currentWorld[xNeighbor][yNeighbor]?.getUnitType().unitDefaultFlameSustainability || 0);
      if (random >= prob) {
        currentWorld[xNeighbor][yNeighbor]!.unitState.unitIsOnFire = true;
      }
    };

    const processUnitOnFire = (x: number, y: number) => {
      const minRandomColor = 0x00;
      const maxRandomColor = 0xe9;
      const baseColor = 0x0000ff + 0xff000000; // b55a00
      // Colors order in 0x00caca is B G R

      let unitColor = 0x00000000;

      if (getRandomInt(0, 100) >= 30) {
        const randColor = getRandomInt(minRandomColor, maxRandomColor);
        const resColor = randColor * 16 ** 2;
        unitColor = baseColor + resColor;
      }

      currentWorld[x][y]!.unitState.unitDecalColor = unitColor;
      currentWorld[x][y]!.unitState.fireHP -= 1;

      setOnFireNeighbor(x - 1, y);
      setOnFireNeighbor(x + 1, y);
      setOnFireNeighbor(x, y + 1);
      setOnFireNeighbor(x, y - 1);
    };

    const elevateFlame = (x: number, y: number) => {
      if (y + 1 > worldSideSize) return false;

      if (!currentWorld[x][y + 1]) {
        if (Math.random() >= 0.1) {
          currentWorld[x][y]!.unitState.unitHealth -= 1;
        }
        replaceUnit(x, y, x, y + 1);
        return true;
      }
      if (currentWorld[x][y + 1]?.getUnitType().unitIsFlame) {
        const res = elevateFlame(x, y + 1);
        if (res) {
          if (Math.random() >= 0.5) {
            currentWorld[x][y]!.unitState.unitHealth -= 1;
          }
          replaceUnit(x, y, x, y + 1);
          return true;
        }
      }

      return false;
    };

    const processFlame = (x: number, y: number) => {
      if (Math.random() >= 0.8) {
        currentWorld[x][y]!.unitState.unitHealth -= 1;
      }
      elevateFlame(x, y);
    };

    const processNotStaticUnit = (x: number, y: number) => {
      if (!currentWorld[x][y]?.isUpdated) {
        if (currentWorld[x][y]?.getUnitType().unitIsGas) {
          processGas(x, y);
        } else if (currentWorld[x][y]?.getUnitType().unitIsLiquid) {
          processWater(x, y);
        } else if (currentWorld[x][y]?.getUnitType().unitIsFlame) {
          processFlame(x, y);
        } else {
          processPowder(x, y);
        }
      }
    };

    const processUnit = (x: number, y: number) => {
      if (currentWorld[x][y] != null) {
        if (currentWorld[x][y] && currentWorld[x][y]?.unitState && currentWorld[x][y]!.unitState.unitHealth <= 0) {
          const transformations = currentWorld[x][y]?.getUnitType().unitTransformations;

          currentWorld[x][y] = null;

          if (!transformations || !transformations.toDestroy) {
            return;
          }

          if (Math.random() >= 0.99) {
            this.emittedUnits.push({ unitType: transformations.toDestroy, x, y });
          }
          return;
        }

        if (
          currentWorld[x][y] && currentWorld[x][y]?.getUnitType().unitIsFlammable
          && currentWorld[x][y]?.unitState && currentWorld[x][y]!.unitState.fireHP <= 0
        ) {
          currentWorld[x][y] = null;

          const transformations = currentWorld[x][y]?.getUnitType().unitTransformations;
          if (!transformations || !transformations.toDestroy) {
            return;
          }

          this.emittedUnits.push({ unitType: transformations.toDestroy, x, y });
          return;
        }

        if (currentWorld[x][y]?.unitState.unitIsOnFire) {
          processUnitOnFire(x, y);
          this.emittedUnits.push({ unitType: 'yellow-flame', x, y: y + 1 });
        }

        if (!currentWorld[x][y]?.getUnitType().unitIsStatic) {
          processNotStaticUnit(x, y);
        }
      }
    };

    for (let y = 0; y < worldSideSize; y += 1) {
      for (let x = 0; x < worldSideSize; x += 1) {
        if (currentWorld[x][y] != null) {
          if (!currentWorld[x][y]?.getUnitType().unitIsStatic) {
            currentWorld[x][y]!.isUpdated = false;
          }
        }
      }
    }

    const processLine = (y: number) => {
      const dir = Boolean(getRandomInt(0, 1));

      if (dir === false) {
        for (let x = 0; x < worldSideSize; x += 1) {
          processUnit(x, y);
        }
      } else {
        for (let x = worldSideSize - 1; x >= 0; x -= 1) {
          processUnit(x, y);
        }
      }
    };

    if (this.isLineByLineResolve) {
      let y = 0;

      if (this.lastY < worldSideSize) {
        y = this.lastY++;
      } else {
        this.lastY = 0;
      }

      processLine(y);
    } else {
      for (let y = 0; y < worldSideSize; y += 1) {
        processLine(y);
      }
    }

    for (let i = 0; i < this.emittedUnits.length; i += 1) {
      const { x, y, unitType } = this.emittedUnits[i];
      if (currentWorld[x][y] === null) {
        currentWorld[x][y] = createUnit(unitType, null, null);
      }
    }
    this.emittedUnits = [];

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
