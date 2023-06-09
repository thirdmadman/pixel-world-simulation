/* eslint-disable no-bitwise */
import { UnitState } from './UnitState';
import { getUnitTypeByUnitTypeName } from './UnitTypes';
import { getRandomInt } from './utils';
import Vector from './Vector';

export default class Unit {
  unitTypeName: string;

  unitId: number;

  unitVelocityVector: Vector | null;

  isUpdated = false;

  unitState: UnitState;

  constructor(
    unitTypeName: string,
    unitForceVectorsArray: Vector | null = null,
    unitId = 0,
    unitState: UnitState | null = null,
  ) {
    this.unitTypeName = unitTypeName;
    this.unitVelocityVector = unitForceVectorsArray;
    this.unitId = unitId;

    if (!unitState) {
      const defaultType = getUnitTypeByUnitTypeName(unitTypeName);
      const { unitDefaultColor } = defaultType;

      const randColor = getRandomInt(unitDefaultColor.minRandomColor, unitDefaultColor.maxRandomColor);
      const r = ((unitDefaultColor.colorShiftNumbers & 0x00f) >> 3);
      const g = ((unitDefaultColor.colorShiftNumbers & 0x0f0) >> 4) >> 3;
      const b = ((unitDefaultColor.colorShiftNumbers & 0xf00) >> 8) >> 3;
      const resColor = randColor * r + (randColor * 16 ** 2) * g + (randColor * 16 ** 4) * b;
      const unitColor = unitDefaultColor.baseColor + resColor;

      this.unitState = {
        unitHealth: defaultType.unitDefaultHealth,
        unitIsOnFire: false,
        unitColor,
        unitDecalColor: 0,
        flameSustainability: defaultType.unitDefaultFlameSustainability,
        fireHP: defaultType.unitDefaultFireHP,
      };
    } else {
      this.unitState = unitState;
    }
  }

  getUnitType() {
    return getUnitTypeByUnitTypeName(this.unitTypeName);
  }
}
