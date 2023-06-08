import { UnitState } from './UnitState';
import { getUnitTypeByUnitTypeName } from './UnitTypes';
import getRandomInt from './utils';
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
      const resColor = randColor + randColor * 16 ** 2 + randColor * 16 ** 4;
      const unitColor = unitDefaultColor.baseColor + resColor;

      this.unitState = {
        unitHealth: defaultType.unitDefaultHealth,
        unitIsOnFire: false,
        unitColor,
        unitDecalColor: 0,
        flameSustainability: defaultType.flameSustainability,
      } as UnitState;
    } else {
      this.unitState = unitState;
    }
  }

  getUnitType() {
    return getUnitTypeByUnitTypeName(this.unitTypeName);
  }
}
