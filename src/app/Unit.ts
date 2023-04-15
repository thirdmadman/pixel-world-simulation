import Vector from './Vector';
import UnitType from './UnitType';

export default class Unit {
  unitType: UnitType;

  unitId: number;

  unitVelocityVector: Vector | null;

  isUpdated = false;

  constructor(unitType: UnitType, unitForceVectorsArray: Vector | null = null, unitId = 0) {
    this.unitType = unitType;
    this.unitVelocityVector = unitForceVectorsArray;
    this.unitId = unitId;
  }
}
