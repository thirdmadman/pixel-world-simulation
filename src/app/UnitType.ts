import { UnitDefaultColor } from './UnitDefaultColor';
import { Transformations } from './Transformations';

export default interface UnitType {
  unitName: string;
  unitDefaultHealth: number;
  unitDurability: number;
  unitIsGas: boolean;
  unitIsFlammable: boolean;
  unitDefaultFlameSustainability: number;
  unitDefaultFireHP: number;
  unitDefaultColor: UnitDefaultColor;
  unitIsLiquid: boolean;
  unitIsStatic: boolean;
  unitDensity: number;
  unitTransformations?: Transformations;
}
