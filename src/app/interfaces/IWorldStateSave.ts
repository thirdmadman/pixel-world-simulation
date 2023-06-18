import { IUnitShorthand } from '../models/Unit';

export interface IWorldStateSave {
  [key: number]: { [key: number]: IUnitShorthand };
}
