/* eslint-disable no-bitwise */
import { IUnitState, IUnitStateShorthand } from '../interfaces/IUnitState';
import { getUnitTypeByUnitTypeName } from '../data/UnitTypes';
import { getRandomInt } from '../utils/utils';
import { IVector, IVectorShorthand } from '../interfaces/IVector';

export interface IUnitShorthand {
  n: string; // unitTypeName
  i: number; // unitId
  v?: IVectorShorthand; // unitVelocityVector
  s: IUnitStateShorthand; // unitState
}
export class Unit {
  unitTypeName: string;

  unitId: number;

  unitVelocityVector: IVector | null;

  isUpdated = false;

  unitState: IUnitState;

  constructor(
    unitTypeName: string,
    unitForceVectorsArray: IVector | null = null,
    unitId = 0,
    unitState: IUnitState | null = null,
  ) {
    this.unitTypeName = unitTypeName;
    this.unitVelocityVector = unitForceVectorsArray;
    this.unitId = unitId;

    if (!unitState) {
      const defaultType = getUnitTypeByUnitTypeName(unitTypeName);
      const {
        unitDefaultColor, unitDefaultHealth, unitDefaultFlameSustainability, unitDefaultFireHP,
      } = defaultType;

      const randColor = getRandomInt(unitDefaultColor.minRandomColor, unitDefaultColor.maxRandomColor);
      const r = ((unitDefaultColor.colorShiftNumbers & 0x00f) >> 3);
      const g = ((unitDefaultColor.colorShiftNumbers & 0x0f0) >> 4) >> 3;
      const b = ((unitDefaultColor.colorShiftNumbers & 0xf00) >> 8) >> 3;
      const resColor = randColor * r + (randColor * 16 ** 2) * g + (randColor * 16 ** 4) * b;
      const unitColor = unitDefaultColor.baseColor + resColor;

      this.unitState = {
        unitHealth: unitDefaultHealth,
        unitIsOnFire: false,
        unitColor,
        unitDecalColor: 0,
        flameSustainability: unitDefaultFlameSustainability,
        fireHP: unitDefaultFireHP,
      };
    } else {
      this.unitState = unitState;
    }
  }

  getUnitType() {
    return getUnitTypeByUnitTypeName(this.unitTypeName);
  }

  toJson() {
    const stateShorthand = {
      h: this.unitState.unitHealth,
      f: Number(this.unitState.unitIsOnFire),
      c: this.unitState.unitColor,
      d: this.unitState.unitDecalColor,
      s: this.unitState.flameSustainability,
      j: this.unitState.fireHP,
    };

    const unit = {
      n: this.unitTypeName,
      i: this.unitId,
      s: stateShorthand,
    } as IUnitShorthand;

    if (this.unitVelocityVector) {
      unit.v = {
        s: this.unitVelocityVector.startPoint,
        e: this.unitVelocityVector.endPoint,
      } as IVectorShorthand;
    }

    return unit;
  }
}
