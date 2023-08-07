import { IUnitDefaultColor } from './IUnitDefaultColor';
import { ITransformations } from './ITransformations';

export interface UnitType {
  unitName: string;
  unitDefaultHealth: number;
  unitDurability: number;
  unitIsGas: boolean;
  unitIsFlame?: boolean;
  unitIsFlammable: boolean;
  unitDefaultFlameSustainability: number;
  unitDefaultFireHP: number;
  unitDefaultColor: IUnitDefaultColor;
  unitIsLiquid: boolean;
  unitIsStatic: boolean;
  unitDensity: number;
  unitTransformations?: ITransformations;
}
