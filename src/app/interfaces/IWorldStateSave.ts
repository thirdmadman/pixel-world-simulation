import { IUnitShorthand } from '../units/Unit';

export interface IWorldStateSave {
  [key: number]: { [key: number]: IUnitShorthand };
}
