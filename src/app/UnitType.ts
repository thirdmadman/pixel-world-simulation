import { UnitDefaultColor } from './UnitDefaultColor';
import { Transformations } from './Transformations';

export default interface UnitType {
  unitName: string;
  unitDefaultHealth: number;
  unitIsGas: boolean;
  unitIsFlammable: boolean;
  unitDefaultColor: UnitDefaultColor;
  unitIsLiquid: boolean;
  unitIsStatic: boolean;
  unitDensity: number;
  unitTransformations?: Transformations;
}
